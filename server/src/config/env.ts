import dotenv from "dotenv";

// Load base environment file
dotenv.config({ path: process.env.NODE_ENV === "test" ? ".env.test" : ".env" });
// Load .env.local overrides for local development if not in test
if (process.env.NODE_ENV !== "test") {
  dotenv.config({ path: ".env.local", override: true });
}

import { z } from "zod";
import { StringValue } from "ms";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  PORT: z.coerce.number().default(3000),
  CLIENT_URL: z.url(),
  CORS_ALLOWED_ORIGINS: z.string().default(""),
  DATABASE_URL: z.string().min(1),
  SALT_ROUNDS: z.coerce.number(),

  RESEND_API_KEY: z.string().min(1),
  NOTIFY_FROM_EMAIL: z.string().email().default("noreply@devtinder.abhishekbytes.space"),

  REDIS_URL: z.string().min(1),

  ACCESS_TOKEN_SECRET: z.string().min(32),

  DUMMY_HASH: z.string().min(1),
  CSRF_TOKEN_SECRET: z.string().min(32),
  ACCESS_TOKEN_EXPIRES_IN: z.custom<StringValue | number>(),
  REFRESH_TOKEN_EXPIRES_IN: z.custom<StringValue | number>(),

  VOYAGE_API_KEY: z.string().min(1),
  OAUTH_TOKEN_ENCRYPTION_KEY: z.string().length(64),
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
