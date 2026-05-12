#!/usr/bin/env node
import 'dotenv/config';
import pkg from 'pg';
import { URL } from 'url';

const { Client } = pkg;

function buildConfigForPostgresDB() {
  if (process.env.DATABASE_URL) {
    try {
      const url = new URL(process.env.DATABASE_URL);
      url.pathname = '/postgres';
      return { connectionString: url.toString() };
    } catch (e) {
      // fall through to env var fallback
    }
  }

  return {
    host: process.env.PGHOST || 'localhost',
    user: process.env.PGUSER || 'postgres',
    password: String(process.env.PGPASSWORD || ''),
    port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432,
    database: 'postgres',
  };
}

async function main() {
  const dbName = process.env.PGDATABASE || 'ai';
  const config = buildConfigForPostgresDB();

  const client = new Client(config);
  try {
    await client.connect();
    const existsRes = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
    if (existsRes.rows.length > 0) {
      console.log(`Database '${dbName}' already exists.`);
    } else {
      // Create the database
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`Database '${dbName}' created successfully.`);
    }
  } catch (err) {
    console.error('Error creating database:', err.message || err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main();
