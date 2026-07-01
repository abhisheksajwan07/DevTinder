import crypto, { timingSafeEqual } from "crypto";
import {

  SignInDto,
  SignUpDto,
  VerifyEmailDto,
} from "./auth.validator.js";
import { CreateUserRepoDTO, IAuthRepository } from "./auth.types.js";
import { redis } from "../../config/redis.js";
import { AppError } from "../../utils/AppError.js";
import { emailQueue } from "../../queues/email.queue.js";
import { comparePassword, hashPassword } from "../../utils/password.js";
import { ISessionService } from "../session/session.types.js";
import { env } from "../../config/env.js";
import {
  getClearedAttemptData,
  getNextLoginAttemptData,
  isAccountLocked,
} from "../../utils/loginAttempts.js";
// import { emailQueue } from "../../queues/email.queue.js";

export class AuthService {
  // private authRepository: IAuthRepository;

  // constructor(repository: IAuthRepository) {
  //   this.authRepository = repository;
  // }
  constructor(
    private authRepository: IAuthRepository,
    private sessionService: ISessionService,
  ) {}

  private async sendVerificationOtp(email: string) {
    const otpKey = `otp:${email}`;
    const attemptsKey = `otp_attempts:${email}`;
    const otp = crypto.randomInt(100000, 999999).toString();
    await redis.set(otpKey, otp, "EX", 300);
    await redis.set(attemptsKey, 0, "EX", 300);

    await emailQueue.add("send-welcome-otp", {
      email,
      otp,
    });
  }

  async runSignupPipeline(dto: SignUpDto) {
    const normalisedEmail = dto.email;

    const existingUser =
      await this.authRepository.findUserByEmail(normalisedEmail);

    if (existingUser) {
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
      if (error?.code === "23505") {
        throw new AppError(
          "Registration failed. Please check your inputs.",
          409,
        );
      }
      throw error;
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
      },
      accessToken,
      rawRefreshToken,
    };
  }

  async resendVerificationOtp(email: string) {
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
    const cooldownKey = `otp_resend_cooldown:${email}`;

    const isCoolingDown = await redis.exists(cooldownKey);

    if (isCoolingDown) {
      throw new AppError(
        "Please wait before requesting another OTP.",
        429,
        "OTP_RESEND_RATE_LIMITED",
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
    const isValid = await comparePassword(data.password, user.passwordHash);

    if (!isValid) {
      const attemptData = getNextLoginAttemptData(user.loginAttempts ?? 0);
      await this.authRepository.updateLoginAttempts(user.id, attemptData);
      throw new AppError("invalid credentials", 401, "INVALID_CREDENTIALS");
    }
    if (!user.isVerified) {
      throw new AppError(
        "Please verify your email.",
        403,
        "EMAIL_NOT_VERIFIED",
      );
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

 
}
