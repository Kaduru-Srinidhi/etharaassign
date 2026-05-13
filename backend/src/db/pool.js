import pg from 'pg';
import dotenv from 'dotenv';
import { URL } from 'url';

dotenv.config();

const { Pool } = pg;

function buildPoolConfig() {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (databaseUrl) {
    try {
      const parsedUrl = new URL(databaseUrl);
      const useSsl = !['localhost', '127.0.0.1'].includes(parsedUrl.hostname);

      // When a full DATABASE_URL is provided, pass only the connection string
      // to the pg Pool. Railway-hosted Postgres requires SSL, while local
      // connections usually do not.
      return {
        connectionString: databaseUrl,
        ssl: useSsl ? { rejectUnauthorized: false } : false,
      };
    } catch (error) {
      throw new Error('DATABASE_URL is not a valid PostgreSQL connection string');
    }
  }

  return {
    host: process.env.PGHOST || 'localhost',
    port: Number(process.env.PGPORT || 5432),
    user: process.env.PGUSER || 'postgres',
    password: String(process.env.PGPASSWORD ?? ''),
    database: process.env.PGDATABASE || 'team_task_manager',
  };
}

const pool = new Pool(buildPoolConfig());

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export default pool;
