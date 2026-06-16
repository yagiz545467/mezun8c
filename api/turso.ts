import { createClient } from '@libsql/client';

let client: ReturnType<typeof createClient> | null = null;

export function getTurso() {
  if (!client) {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url) {
      throw new Error('TURSO_DATABASE_URL environment variable is not set');
    }

    client = createClient({
      url,
      authToken,
    });
  }
  return client;
}

export async function initDatabase() {
  const turso = getTurso();

  await turso.execute(`
    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      photo_url TEXT,
      gender TEXT,
      claimed_by_uid TEXT,
      is_teacher INTEGER DEFAULT 0,
      is_approved INTEGER DEFAULT 0
    )
  `);

  await turso.execute(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      to_student_id TEXT NOT NULL,
      from_student_id TEXT NOT NULL,
      from_student_name TEXT NOT NULL,
      from_user_uid TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )
  `);

  await turso.execute(`
    CREATE TABLE IF NOT EXISTS memories (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      student_name TEXT NOT NULL,
      user_uid TEXT NOT NULL,
      media_url TEXT NOT NULL,
      media_type TEXT DEFAULT 'image',
      created_at INTEGER NOT NULL
    )
  `);

  await turso.execute(`
    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);
}
