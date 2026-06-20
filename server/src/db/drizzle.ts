import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

import { env } from "../config/env.js";

import * as authSchema from "./schema/auth.schema.js";
import * as sessionSchema from "./schema/sessions.schema.js";
import * as usersSchema from "./schema/users.schema.js";
const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

export const db = drizzle(pool, {
  schema: {
    ...authSchema,
    ...sessionSchema,
    ...usersSchema,
  },
});
