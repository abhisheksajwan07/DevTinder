import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["dev", "prod"]).default("dev"),

  PORT: z.coerce.number().default(3000),
  FRONTEND_URL: z.url(),
  DATABASE_URL: z.string().min(1),
  SALT_ROUNDS: z.coerce.number(),

  REDIS_URL: z.string().min(1),

  JWT_ACCESS_SECRET: z.string().min(32),

  JWT_REFRESH_SECRET: z.string().min(32),

  CSRF_TOKEN_SECRET: z.string().min(32),
  ACCESS_TOKEN_EXPIRES_IN: z.string().default("15m"),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default("7d"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    "Invalid environment variables: ",
    z.treeifyError(parsedEnv.error),
  );
  process.exit(1);
}

export const env = parsedEnv.data;
