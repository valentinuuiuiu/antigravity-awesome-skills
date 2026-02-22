import { Pool } from 'pg';
require('dotenv').config({ path: '/root/legacy/piata-ai-fresh/my-app/.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

async function runMaintenance() {
  console.log('[Maintenance] Starting cleanup...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Archive old audit logs (older than 90 days)
    const archiveRes = await client.query(`
      DELETE FROM audit_logs
      WHERE created_at < NOW() - INTERVAL '90 days'
      RETURNING id
    `);
    if (archiveRes.rowCount > 0) {
      console.log(`[Maintenance] Archived ${archiveRes.rowCount} old audit logs.`);
    }

    // 2. Clean up expired verification tokens (older than 24h)
    const tokenRes = await client.query(`
      DELETE FROM verification_tokens
      WHERE created_at < NOW() - INTERVAL '24 hours'
    `);
    if (tokenRes.rowCount > 0) {
      console.log(`[Maintenance] Removed ${tokenRes.rowCount} expired tokens.`);
    }

    // 3. Optimize tables (Vacuum Analyze)
    // Note: VACUUM cannot run inside a transaction block
    await client.query('COMMIT');

    // Run VACUUM separately if needed, or just let autovacuum handle it.
    // But we can update stats.
    // await client.query('ANALYZE anunturi');
    // console.log('[Maintenance] Analyzed table anunturi.');

    console.log('[Maintenance] Cleanup complete.');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Maintenance] Error:', err);
  } finally {
    client.release();
    pool.end();
  }
}

runMaintenance();
