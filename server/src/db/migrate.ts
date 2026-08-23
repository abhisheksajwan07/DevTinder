import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

const pool = new Pool({ connectionString: env.DATABASE_URL });

const db = drizzle(pool);

await migrate(db, {
  migrationsFolder: "./drizzle/migrations",
  migrationsTable: "__drizzle_migrations",
  migrationsSchema: "drizzle",
});

await pool.end(); 

logger.info("Migrations done!");
process.exit(0);
