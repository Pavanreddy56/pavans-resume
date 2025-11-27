import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Use standard pg client for better compatibility with all hosting environments
export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1, // Minimal pooling for serverless
  idleTimeoutMillis: 5000,
  connectionTimeoutMillis: 5000,
});

export const db = drizzle({ client: pool, schema });
