import crypto from "crypto";

import { SignUpDto } from "./auth.validator.js";
import { CreateUserRepoDTO, IAuthRepository } from "./auth.types.js";
import { redis } from "../../config/redis.js";
import { AppError } from "../../utils/AppError.js";
import { emailQueue } from "../../queues/email.queue.js";
import { hashPassword } from "../../utils/password.js";
// import { emailQueue } from "../../queues/email.queue.js";

export class AuthService {
  private authRepository: IAuthRepository;

  constructor(repository: IAuthRepository) {
    this.authRepository = repository;
  }
  // constructor(private authRepository: IAuthRepository) {}
  
  async runSignupPipeline(dto: SignUpDto) {
    const normalisedEmail = dto.email;

    const existingUser =
      await this.authRepository.findUserByEmail(normalisedEmail);
    if (existingUser) {
      throw new AppError("Registration failed. please check your inputs.", 409);
    }

    const passwordHash = await hashPassword(dto.password);
    const repoPayload: CreateUserRepoDTO = {
      email: normalisedEmail,
      passwordHash,
    };
    let newUser;
    try {
      newUser = await this.authRepository.createUser(repoPayload);
    } catch (error: any) {
      if (error?.code === "23505") {
        throw new AppError(
          "Registration failed. Please check your inputs.",
          409,
        );
      }
      throw error;
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    await redis.set(`otp:${normalisedEmail}`, otp, "EX", 300);
    await redis.set(`otp_attempts:${normalisedEmail}`, 0, "EX", 300);

    await emailQueue.add("send-welcome-otp", {
      email: normalisedEmail,
      otp,
    });
    return {
      message: "SignUp completed ! Check your email for verification",
    };
  }
}
