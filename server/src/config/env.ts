import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["dev", "prod"]).default("dev"),

  PORT: z.coerce.number().default(3000),

  DATABASE_URL: z.string().min(1),

  REDIS_URL: z.string().min(1),

  JWT_ACCESS_SECRET: z.string().min(32),

  JWT_REFRESH_SECRET: z.string().min(32),

  CSRF_TOKEN_SECRET: z.string().min(32),
});

export const env = envSchema.parse(process.env);
