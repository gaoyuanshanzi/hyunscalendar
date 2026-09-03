import { neon } from '@neondatabase/serverless';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_ZQ2vOcwUd6Mf@ep-dry-dust-a5h62wl1-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

export const sql = neon(connectionString);

let initialized = false;

export async function ensureTables() {
  if (initialized) return;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS memos (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        plain_text_preview TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        is_pinned BOOLEAN DEFAULT FALSE
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS todos (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        dates TEXT[],
        time TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT FALSE,
        color TEXT DEFAULT 'blue',
        created_at TEXT NOT NULL
      );
    `;
    initialized = true;
  } catch (err) {
    console.error('Failed to initialize database tables:', err);
  }
}
