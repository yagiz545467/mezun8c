import { initDatabase, select, execute } from './_lib/turso.js';

const INITIAL_STUDENTS = [
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
  { id: 'tcr-1', name: 'ŞÖHRET HOCA', gender: 'F', is_teacher: true },
  { id: 'tcr-2', name: 'ASLI HOCA', gender: 'F', is_teacher: true },
  { id: 'tcr-3', name: 'BÜNYAMİN HOCA', gender: 'M', is_teacher: true },
  { id: 'tcr-4', name: 'MERAL HOCA', gender: 'F', is_teacher: true },
  { id: 'tcr-5', name: 'MUSTAFA HOCA', gender: 'M', is_teacher: true },
  { id: 'tcr-6', name: 'CANER HOCA', gender: 'M', is_teacher: true },
  { id: 'tcr-7', name: 'DUYGU HOCA', gender: 'F', is_teacher: true },
  { id: 'tcr-8', name: 'ERKAN HOCA', gender: 'M', is_teacher: true },
  { id: 'tcr-9', name: 'MEHIBE HOCA', gender: 'F', is_teacher: true },
  { id: 'tcr-10', name: 'EMRE HOCA', gender: 'M', is_teacher: true },
];

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  try {
    await initDatabase();
    const existing = await select('SELECT COUNT(*) as count FROM students');
    const count = Number(existing[0]?.count || 0);
    if (count > 0) return res.status(200).json({ message: 'Database already seeded', count });
    for (const student of INITIAL_STUDENTS) {
      await execute(`INSERT INTO students (id, name, email, photo_url, gender, claimed_by_uid, is_teacher, is_approved)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
        student.id, student.name, null, null, student.gender || null,
        null, student.is_teacher ? 1 : 0, 0,
      ]);
    }
    await execute(`INSERT INTO settings (id, value) VALUES (?, ?) ON CONFLICT(id) DO NOTHING`, [
      'isNotebookPublic', 'false',
    ]);
    return res.status(200).json({ message: 'Database seeded successfully', count: INITIAL_STUDENTS.length });
  } catch (error) {
    console.error('Seed API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
