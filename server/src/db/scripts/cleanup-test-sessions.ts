import { pool } from "../drizzle.js";

const client = await pool.connect();

try {
  // Delete sessions belonging to load-test users only
  const result = await client.query(`
    DELETE FROM sessions
    WHERE user_id IN (
      SELECT id FROM users
      WHERE email LIKE 'loadtest_%@devtinder.local'
    )
  `);
  console.log(`✅ Deleted ${result.rowCount} load-test sessions`);

  // Show remaining session count
  const remaining = await client.query(`SELECT COUNT(*) AS total FROM sessions`);
  console.log(`   Remaining sessions in DB: ${remaining.rows[0].total}`);
} finally {
  client.release();
  await pool.end();
  process.exit(0);
}
