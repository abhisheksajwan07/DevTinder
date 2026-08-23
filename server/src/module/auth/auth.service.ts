import crypto, { timingSafeEqual } from "crypto";
import {
  ResetPasswordDto,
  SignInDto,
  SignUpDto,
  VerifyEmailDto,
} from "./auth.validator.js";
import { CreateUserRepoDTO, IAuthRepository } from "./auth.types.js";
import { redis } from "../../config/redis.js";
import { AppError } from "../../utils/AppError.js";
import { emailQueue } from "../../queues/email.queue.js";
import { comparePassword, hashPassword } from "../../utils/password.js";
import {
  ISessionRepository,
  ISessionService,
} from "../session/session.types.js";
import { env } from "../../config/env.js";
import {
  getClearedAttemptData,
  getNextLoginAttemptData,
  isAccountLocked,
} from "../../utils/loginAttempts.js";
import {
  deleteResetToken,
  generateResetToken,
  getResetTokenUserId,
  hashResetToken,
  storeResetToken,
} from "./auth.utils.js";
import { handleDbError } from "../../errors/database-error.js";

export class AuthService {
  // private authRepository: IAuthRepository;

  // constructor(repository: IAuthRepository) {
  //   this.authRepository = repository;
  // }
  constructor(
    private authRepository: IAuthRepository,
    private sessionService: ISessionService,
    private sessionRepository: ISessionRepository,
  ) {}

  private async sendVerificationOtp(email: string) {
    const otpKey = `otp:${email}`;
    const attemptsKey = `otp_attempts:${email}`;
    const otp = crypto.randomInt(100000, 999999).toString();
    await redis.set(otpKey, otp, "EX", 300);
    await redis.set(attemptsKey, 0, "EX", 300);

    await emailQueue.add(
      "send-welcome-otp",
      {
        email,
        otp,
      },
      { jobId: `send-welcome-otp-${email}` },
    );
  }

  async getMe(userId: string) {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    return {
      id: user.id,
      email: user.email,
      onBoardingComplete: user.onBoardingComplete,
    };
  }

  async runSignupPipeline(dto: SignUpDto) {
    const normalisedEmail = dto.email;

    const existingUser =
      await this.authRepository.findUserByEmail(normalisedEmail);

    if (existingUser) {
      // User identity exists but was created via OAuth (no email_credentials row)
      // Direct them to sign in with their social provider instead
      if (!existingUser.hasEmailCredentials) {
        throw new AppError(
          "This email is already linked to a social account (GitHub/Google). Please sign in with that provider instead.",
          409,
          "OAUTH_ACCOUNT_EXISTS",
        );
      }

      if (existingUser.isVerified) {
        throw new AppError(
          "Registration failed. Please check your inputs.",
          409,
        );
      }

      throw new AppError(
        "Your account already exists but isn't verified.",
        409,
        "EMAIL_NOT_VERIFIED",
      );
    }

    const passwordHash = await hashPassword(dto.password);
    const repoPayload: CreateUserRepoDTO = {
      email: normalisedEmail,
      passwordHash,
    };

    try {
      const newUser = await this.authRepository.createUser(repoPayload);
    } catch (error: any) {
      return handleDbError(error);
    }

    await this.sendVerificationOtp(normalisedEmail);
    return;
  }

  async verifyEmail(
    dto: VerifyEmailDto,
    meta: { userAgent?: string; ipAddress?: string },
  ) {
    // abstract Redis OTP operations into OtpRepository for cleaner architecture
    const otpKey = `otp:${dto.email}`;
    const attemptsKey = `otp_attempts:${dto.email}`;

    const attempts = Number(await redis.get(attemptsKey)) || 0;

    if (attempts >= 5) {
      throw new AppError(
        "Too many attemtps !! try again later",
        429,
        "OTP_RATE_LIMITED",
      );
    }

    const storedOtp = await redis.get(otpKey);

    if (!storedOtp)
      throw new AppError("OTP expired or invalid.", 400, "INVALID_OTP");

    if (storedOtp.length !== dto.otp.length) {
      await redis.incr(attemptsKey);
      throw new AppError("Invalid OTP.", 400);
    }

    const isMatch = timingSafeEqual(
      Buffer.from(storedOtp),
      Buffer.from(dto.otp),
    );
    if (!isMatch) {
      await redis.incr(attemptsKey);
      throw new AppError("Invalid OTP.", 400);
    }
    const user = await this.authRepository.findUserByEmail(dto.email);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.isVerified) {
      throw new AppError("Email already verified.", 400);
    }

    await this.authRepository.markEmailVerified(user.id);

    await redis.del(otpKey, attemptsKey);

    const { accessToken, rawRefreshToken } =
      await this.sessionService.issueTokenPair(user.id, meta);

    return {
      user: {
        id: user.id,
        email: user.email,
        onBoardingComplete: user.onBoardingComplete,
      },
      accessToken,
      rawRefreshToken,
    };
  }

  async resendVerificationOtp(email: string) {
    const cooldownKey = `otp_resend_cooldown:${email}`;

    const isCoolingDown = await redis.exists(cooldownKey);

    if (isCoolingDown) {
      throw new AppError(
        "Please  wait 60s before requesting another OTP.",
        429,
        "OTP_RESEND_RATE_LIMITED",
      );
    }

    const user = await this.authRepository.findUserByEmail(email);

    if (!user) {
      throw new AppError("User not found.", 404, "USER_NOT_FOUND");
    }

    if (user.isVerified) {
      throw new AppError(
        "Email already verified.",
        400,
        "EMAIL_ALREADY_VERIFIED",
      );
    }

    await this.sendVerificationOtp(email);

    await redis.set(cooldownKey, "1", "EX", 60);

    return;
  }

  async login(
    data: SignInDto,
    meta: {
      userAgent?: string;
      ipAddress?: string;
    },
  ) {
    const user = await this.authRepository.findUserByEmail(data.email);

    if (!user || !user.passwordHash) {
      await comparePassword(data.password, env.DUMMY_HASH);
      throw new AppError("invalid credentials", 401, "INVALID_CREDENTIALS");
    }

    if (isAccountLocked(user.lockedUntil)) {
      throw new AppError(
        "Account locked. Try again later.",
        423,
        " ACCOUNT_LOCKED",
      );
    }

    if (!user.isVerified) {
      throw new AppError(
        "Please verify your email.",
        403,
        "EMAIL_NOT_VERIFIED",
      );
    }
    
    const isValid = await comparePassword(data.password, user.passwordHash);

    if (!isValid) {
      const attemptData = getNextLoginAttemptData(user.loginAttempts ?? 0);
      await this.authRepository.updateLoginAttempts(user.id, attemptData);
      throw new AppError("invalid credentials", 401, "INVALID_CREDENTIALS");
    }

    await this.authRepository.updateLoginAttempts(
      user.id,
      getClearedAttemptData(),
    );
    const { accessToken, rawRefreshToken } =
      await this.sessionService.issueTokenPair(user.id, meta);

    return {
      accessToken,
      rawRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        onBoardingComplete: user.onBoardingComplete,
      },
    };
  }
  async forgotPassword(email: string) {
    const cooldownKey = `reset_cooldown:${email}`;
    const isCoolingDown = await redis.exists(cooldownKey);
    if (isCoolingDown) {
      return;
    }
    const user = await this.authRepository.findUserByEmail(email);

    if (!user) {
      return;
    }
    const rawToken = generateResetToken();
    const hashToken = hashResetToken(rawToken);

    await storeResetToken(hashToken, user.id);
    const resetUrl = `${env.CLIENT_URL}/reset-password?token=${rawToken}`;

    await emailQueue.add(
      "send-reset-password",
      {
        email,
        resetUrl,
        // Resend keys identify one concrete send attempt. Keep this value in
        // the job payload so BullMQ retries reuse the same key, while every
        // newly requested reset email gets a different key.
        idempotencyKey: crypto.randomUUID(),
      },
      {
        priority: 1,
        jobId: `reset-email-${hashToken}`, // unique per reset attempt — prevents BullMQ dedup blocking re-sends
      },
    );

    await redis.set(cooldownKey, "1", "EX", 300); // cooldown per email to limit inbox flooding
  }

  async resetPassword(dto: ResetPasswordDto) {
    const tokenHash = hashResetToken(dto.token);
    const userId = await getResetTokenUserId(tokenHash);

    if (!userId) {
      throw new AppError(
        "invalid or expired reset token",
        400,
        "INVALID_OR_EXPIRED_TOKEN",
      );
    }

    const passwordHash = await hashPassword(dto.newPassword);

    await this.authRepository.updatePasswordHash(userId, passwordHash);
    await deleteResetToken(tokenHash);

    // revoke all on-going sessions
    await this.sessionRepository.revokeAllSessionsByUserId(userId);
  }
}
