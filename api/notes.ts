import { VercelRequest, VercelResponse } from '@vercel/node';
import { getTurso, initDatabase } from './_lib/turso';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');

  try {
    await initDatabase();
    const turso = getTurso();

    if (req.method === 'GET') {
      const result = await turso.execute('SELECT * FROM notes ORDER BY created_at DESC');
      return res.status(200).json(result.rows);
    }

    if (req.method === 'POST') {
      const { id, to_student_id, from_student_id, from_student_name, from_user_uid, content, created_at } = req.body;

      if (!id || !to_student_id || !from_student_id || !from_student_name || !from_user_uid || !content) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      await turso.execute({
        sql: `INSERT INTO notes (id, to_student_id, from_student_id, from_student_name, from_user_uid, content, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [id, to_student_id, from_student_id, from_student_name, from_user_uid, content, created_at || Date.now()],
      });

      const result = await turso.execute({
        sql: 'SELECT * FROM notes WHERE id = ?',
        args: [id],
      });

      return res.status(200).json(result.rows[0] || null);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) {
        return res.status(400).json({ error: 'id is required' });
      }
      await turso.execute({
        sql: 'DELETE FROM notes WHERE id = ?',
        args: [id],
      });
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Notes API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
