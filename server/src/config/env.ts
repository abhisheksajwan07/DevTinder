import dotenv from "dotenv";

// Keep test configuration separate from local development credentials.
dotenv.config({ path: process.env.NODE_ENV === "test" ? ".env.test" : ".env" });

import { z } from "zod";
import { StringValue } from "ms";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  PORT: z.coerce.number().default(3000),
  CLIENT_URL: z.url(),
  DATABASE_URL: z.string().min(1),
  SALT_ROUNDS: z.coerce.number(),

  RESEND_API_KEY: z.string().min(1),

  REDIS_URL: z.string().min(1),

  ACCESS_TOKEN_SECRET: z.string().min(32),

  DUMMY_HASH: z.string().min(1),
  CSRF_TOKEN_SECRET: z.string().min(32),
  ACCESS_TOKEN_EXPIRES_IN: z.custom<StringValue | number>(),
  REFRESH_TOKEN_EXPIRES_IN: z.custom<StringValue | number>(),

  VOYAGE_API_KEY: z.string().min(1),
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
