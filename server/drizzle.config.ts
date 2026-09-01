import { defineConfig } from "drizzle-kit";
import "dotenv/config";

declare const process: { env: { DATABASE_URL?: string } };

export default defineConfig({
  schema: "./src/db/schema/*.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
