import { initDatabase, select, selectOne, execute } from './_lib/turso.js';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  try {
    await initDatabase();
    if (req.method === 'GET') {
      const rows = await select('SELECT * FROM notes ORDER BY created_at DESC');
      return res.status(200).json(rows);
    }
    if (req.method === 'POST') {
      const { id, to_student_id, from_student_id, from_student_name, from_user_uid, content, created_at } = req.body;
      if (!id || !to_student_id || !from_student_id || !from_student_name || !from_user_uid || !content) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      await execute(`INSERT INTO notes (id, to_student_id, from_student_id, from_student_name, from_user_uid, content, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)`, [
        id, to_student_id, from_student_id, from_student_name, from_user_uid, content, created_at || Date.now(),
      ]);
      const row = await selectOne('SELECT * FROM notes WHERE id = ?', [id]);
      return res.status(200).json(row || null);
    }
    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'id is required' });
      await execute('DELETE FROM notes WHERE id = ?', [id]);
      return res.status(200).json({ success: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Notes API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
