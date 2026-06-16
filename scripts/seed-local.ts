import { createClient } from '@libsql/client';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(import.meta.dirname, '../.env.local') });

const students = [
  { id: 'std-1', name: 'MİRAÇ HALİM TANRIKULU', gender: 'M' },
  { id: 'std-2', name: 'MUSTAFA ADİL CİHAN', gender: 'M' },
  { id: 'std-3', name: 'AZAD YILMAZ', gender: 'M' },
  { id: 'std-4', name: 'AYŞE NEVAL ÇETİN', gender: 'F' },
  { id: 'std-5', name: 'SEYYİD EREN BÜYÜKDEMİR', gender: 'M' },
  { id: 'std-6', name: 'MERYEM YALÇINLAR', gender: 'F' },
  { id: 'std-7', name: 'BERDAN YILDIRIM', gender: 'M' },
  { id: 'std-8', name: 'ENES ÇATAL', gender: 'M' },
  { id: 'std-9', name: 'ZEYNEP NEVA SELÇUK', gender: 'F' },
  { id: 'std-10', name: 'ÜMMÜ GÜLSÜM MUTLU', gender: 'F' },
  { id: 'std-11', name: 'MERT KARAN', gender: 'M' },
  { id: 'std-12', name: 'LİN HANNAVİ', gender: 'F' },
  { id: 'std-13', name: 'ELİF EBRAR BÜLBÜL', gender: 'F' },
  { id: 'std-14', name: 'BEYZANUR ABLAK', gender: 'F' },
  { id: 'std-15', name: 'ECENUR BEKTAŞ', gender: 'F' },
  { id: 'std-16', name: 'ELİF SARE KAYA', gender: 'F' },
  { id: 'std-17', name: 'KUZEY KARADENİZ', gender: 'M' },
  { id: 'std-18', name: 'CEYLİN BAŞKAN', gender: 'F' },
  { id: 'std-19', name: 'ÖMER ASAF OCAKLI', gender: 'M' },
  { id: 'std-20', name: 'EREN HALİL BEYHAN', gender: 'M' },
  { id: 'std-21', name: 'ŞURANUR ŞEKER', gender: 'F' },
  { id: 'std-22', name: 'YAĞIZ SİRAÇ ÜNLÜ', gender: 'M' },
  { id: 'std-23', name: 'YUNUS EMRE BOZ', gender: 'M' },
  { id: 'std-24', name: 'YUNUS EMRE CİBA', gender: 'M' },
  { id: 'std-25', name: 'ZEYNEP GENÇYILMAZ', gender: 'F' },
  { id: 'std-26', name: 'ZEYNEP ZEHRA KESİKBAŞ', gender: 'F' },
  { id: 'std-27', name: 'HASAN ALİ ŞAHİN', gender: 'M' },
  { id: 'std-28', name: 'NUR HATİCE AKSOY', gender: 'F' },
  { id: 'std-29', name: 'RUVEYDA ERVA YILDIZ', gender: 'F' },
  { id: 'tcr-1', name: 'ŞÖHRET HOCA', gender: 'F', isTeacher: true },
  { id: 'tcr-2', name: 'ASLI HOCA', gender: 'F', isTeacher: true },
  { id: 'tcr-3', name: 'BÜNYAMİN HOCA', gender: 'M', isTeacher: true },
  { id: 'tcr-4', name: 'MERAL HOCA', gender: 'F', isTeacher: true },
  { id: 'tcr-5', name: 'MUSTAFA HOCA', gender: 'M', isTeacher: true },
  { id: 'tcr-6', name: 'CANER HOCA', gender: 'M', isTeacher: true },
  { id: 'tcr-7', name: 'DUYGU HOCA', gender: 'F', isTeacher: true },
  { id: 'tcr-8', name: 'ERKAN HOCA', gender: 'M', isTeacher: true },
  { id: 'tcr-9', name: 'MEHIBE HOCA', gender: 'F', isTeacher: true },
];

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const token = process.env.TURSO_AUTH_TOKEN;

  if (!url) { console.error('TURSO_DATABASE_URL missing'); process.exit(1); }
  if (!token) { console.error('TURSO_AUTH_TOKEN missing'); process.exit(1); }

  const turso = createClient({ url, authToken: token });

  // First ensure tables exist
  await turso.execute(`CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT, photo_url TEXT,
    gender TEXT, claimed_by_uid TEXT, is_teacher INTEGER DEFAULT 0, is_approved INTEGER DEFAULT 0
  )`);
  await turso.execute(`CREATE TABLE IF NOT EXISTS settings (
    id TEXT PRIMARY KEY, value TEXT NOT NULL
  )`);

  // Clear existing
  await turso.execute('DELETE FROM students');

  // Insert all
  for (const s of students) {
    await turso.execute({
      sql: `INSERT INTO students (id, name, gender, is_teacher) VALUES (?, ?, ?, ?)`,
      args: [s.id, s.name, s.gender || null, s.isTeacher ? 1 : 0],
    });
  }

  // Default settings
  await turso.execute({
    sql: `INSERT INTO settings (id, value) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET value = ?`,
    args: ['isNotebookPublic', 'false', 'false'],
  });

  console.log(`Seeded ${students.length} students/teachers successfully!`);
}

main().catch(console.error);
