import dotenv from "dotenv";
dotenv.config();

import { z } from "zod";
import { StringValue } from "ms";

const envSchema = z.object({
  NODE_ENV: z.enum(["dev", "prod"]).default("dev"),

  PORT: z.coerce.number().default(3000),
  FRONTEND_URL: z.url(),
  DATABASE_URL: z.string().min(1),
  SALT_ROUNDS: z.coerce.number(),

  RESEND_API_KEY: z.string().min(1),

  REDIS_URL: z.string().min(1),

  ACCESS_TOKEN_SECRET: z.string().min(32),

  DUMMY_HASH: z.string().min(1),
  CSRF_TOKEN_SECRET: z.string().min(32),
  ACCESS_TOKEN_EXPIRES_IN: z.custom<StringValue | number>(),
  REFRESH_TOKEN_EXPIRES_IN: z.custom<StringValue | number>(),
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
