import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from "@shared/schema";

// Force HTTP-only connections by completely disabling WebSocket
neonConfig.webSocketConstructor = undefined;

// Explicitly configure HTTP endpoint
neonConfig.fetchEndpoint = (host) => {
  return `https://${host}/sql`;
};

// Disable connection pooling for better serverless compatibility
neonConfig.poolQueryViaFetch = true;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });
