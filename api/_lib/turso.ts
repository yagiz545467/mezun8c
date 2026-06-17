import { createClient } from '@libsql/client/http';

const DB_URL = 'libsql://8c-graduation-celestial-capricorn-tffyvy.aws-us-east-2.turso.io';
const DB_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODE2MzU2NTksImlkIjoiMDE5ZWQxYzItOTgwMS03ZDM4LWE4MGEtNDU1YWVmNmRlZmIwIiwicmlkIjoiZjQzZjJmMGItZDljNC00MmI4LWFkYmQtOTAwYzg3NDcxYTM3In0.hLmc5b84GXpAbgqLVlXv5rKHUJVVbaUtYChyzOedqADGh-8lcBTDRP9WOoK5ZLeZplOFwQtBZ9QMAFFZt5B6Aw';

const httpUrl = DB_URL.replace('libsql://', 'https://');

let client: ReturnType<typeof createClient> | null = null;

function getClient() {
  if (!client) {
    client = createClient({
      url: httpUrl,
      authToken: DB_TOKEN,
    });
  }
  return client;
}

export async function initDatabase() {
  const c = getClient();

  await c.execute(`CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT, photo_url TEXT,
    gender TEXT, claimed_by_uid TEXT, is_teacher INTEGER DEFAULT 0, is_approved INTEGER DEFAULT 0
  )`);

  await c.execute(`CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY, to_student_id TEXT NOT NULL, from_student_id TEXT NOT NULL,
    from_student_name TEXT NOT NULL, from_user_uid TEXT NOT NULL,
    content TEXT NOT NULL, created_at INTEGER NOT NULL
  )`);

  await c.execute(`CREATE TABLE IF NOT EXISTS memories (
    id TEXT PRIMARY KEY, student_id TEXT NOT NULL, student_name TEXT NOT NULL,
    user_uid TEXT NOT NULL, media_url TEXT NOT NULL,
    media_type TEXT DEFAULT 'image',
    created_at INTEGER NOT NULL
  )`);

  await c.execute(`CREATE TABLE IF NOT EXISTS settings (
    id TEXT PRIMARY KEY, value TEXT NOT NULL
  )`);
}

export async function select(sql: string, args?: any[]) {
  const c = getClient();
  const result = args
    ? await c.execute({ sql, args })
    : await c.execute(sql);
  return result.rows;
}

export async function selectOne(sql: string, args?: any[]) {
  const rows = await select(sql, args);
  return rows[0] || null;
}

export async function execute(sql: string, args?: any[]) {
  const c = getClient();
  if (args) {
    await c.execute({ sql, args });
  } else {
    await c.execute(sql);
  }
}
