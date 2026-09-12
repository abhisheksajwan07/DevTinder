import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

import { env } from "../config/env.js";
import * as authSchema from "./schema/auth.schema.js";
import * as sessionSchema from "./schema/sessions.schema.js";
import * as usersSchema from "./schema/users.schema.js";
import * as onboardingSchema from "./schema/onboarding.schema.js";
import * as profileActionSchema from "./schema/profile-actions.schema.js";
import * as matchingSchema from "./schema/matching.schema.js";
import * as githubSchema from "./schema/github.schema.js";
import * as messageSchema from "./schema/message.schema.js";
export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 50,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 3000,
});

export const db = drizzle(pool, {
  schema: {
    ...authSchema,
    ...sessionSchema,
    ...usersSchema,
    ...onboardingSchema,
    ...profileActionSchema,
    ...matchingSchema,
    ...githubSchema,
    ...messageSchema,
  },
});

export * from "./schema/auth.schema.js";
export * from "./schema/sessions.schema.js";
export * from "./schema/users.schema.js";
export * from "./schema/onboarding.schema.js";
export * from "./schema/profile-actions.schema.js";
export * from "./schema/matching.schema.js";
export * from "./schema/github.schema.js";
export * from "./schema/message.schema.js";
