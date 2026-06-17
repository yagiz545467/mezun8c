const DB_URL = 'libsql://8c-graduation-celestial-capricorn-tffyvy.aws-us-east-2.turso.io';
const DB_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODE2MzU2NTksImlkIjoiMDE5ZWQxYzItOTgwMS03ZDM4LWE4MGEtNDU1YWVmNmRlZmIwIiwicmlkIjoiZjQzZjJmMGItZDljNC00MmI4LWFkYmQtOTAwYzg3NDcxYTM3In0.hLmc5b84GXpAbgqLVlXv5rKHUJVVbaUtYChyzOedqADGh-8lcBTDRP9WOoK5ZLeZplOFwQtBZ9QMAFFZt5B6Aw';

const API_URL = DB_URL.replace('libsql://', 'https://');
const DB = (sql: string, args: any[] = []) =>
  fetch(`${API_URL}/v2/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${DB_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [{ type: 'execute', stmt: { sql, args: args.map(valueToProto), named_args: [], want_rows: true } }],
    }),
  }).then(async r => { const d = await r.json(); const res = d.results?.[0]; if (res?.type === 'error') throw new Error(res.error?.message); return res?.response?.result; });

function valueToProto(v: any): any {
  if (v === null || v === undefined) return { type: 'null' };
  if (typeof v === 'string') return { type: 'text', value: v };
  if (typeof v === 'number') return Number.isInteger(v) ? { type: 'integer', value: String(v) } : { type: 'float', value: v };
  if (typeof v === 'boolean') return { type: 'integer', value: v ? '1' : '0' };
  return { type: 'text', value: String(v) };
}

function valueFromProto(v: any): any {
  if (v === null) return null;
  if (v.type === 'null') return null;
  if (v.type === 'integer') return Number(v.value);
  if (v.type === 'float') return v.value;
  if (v.type === 'text') return v.value;
  if (v.type === 'blob') return v.base64;
  return null;
}

function rowsToObjects(result: any) {
  if (!result) return [];
  const cols = (result.cols || []).map((c: any) => c.name);
  return (result.rows || []).map((row: any[]) => {
    const obj: any = {};
    row.forEach((v: any, i: number) => { if (cols[i]) obj[cols[i]] = valueFromProto(v); });
    return obj;
  });
}

export async function select(sql: string, args?: any[]) {
  const result = await DB(sql, args);
  return rowsToObjects(result);
}

export async function selectOne(sql: string, args?: any[]) {
  const rows = await select(sql, args);
  return rows[0] || null;
}

export async function execute(sql: string, args?: any[]) {
  await DB(sql, args);
}

let initialized = false;

export async function initDatabase() {
  if (initialized) return;
  await execute(`CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT, photo_url TEXT,
    gender TEXT, claimed_by_uid TEXT, is_teacher INTEGER DEFAULT 0, is_approved INTEGER DEFAULT 0
  )`);
  await execute(`CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY, to_student_id TEXT NOT NULL, from_student_id TEXT NOT NULL,
    from_student_name TEXT NOT NULL, from_user_uid TEXT NOT NULL,
    content TEXT NOT NULL, created_at INTEGER NOT NULL
  )`);
  await execute(`CREATE TABLE IF NOT EXISTS memories (
    id TEXT PRIMARY KEY, student_id TEXT NOT NULL, student_name TEXT NOT NULL,
    user_uid TEXT NOT NULL, media_url TEXT NOT NULL,
    media_type TEXT DEFAULT 'image', created_at INTEGER NOT NULL
  )`);
  await execute(`CREATE TABLE IF NOT EXISTS settings (
    id TEXT PRIMARY KEY, value TEXT NOT NULL
  )`);
  initialized = true;
}
