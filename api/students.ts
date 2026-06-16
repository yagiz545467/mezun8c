import { VercelRequest, VercelResponse } from '@vercel/node';
import { getTurso, initDatabase } from './_lib/turso';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');

  try {
    await initDatabase();
    const turso = getTurso();

    if (req.method === 'GET') {
      const result = await turso.execute('SELECT * FROM students ORDER BY id');
      return res.status(200).json(result.rows);
    }

    if (req.method === 'POST') {
      const { id, name, email, photo_url, gender, claimed_by_uid, is_teacher, is_approved } = req.body;

      if (!id || !name) {
        return res.status(400).json({ error: 'id and name are required' });
      }

      await turso.execute({
        sql: `INSERT INTO students (id, name, email, photo_url, gender, claimed_by_uid, is_teacher, is_approved)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET
                name = COALESCE(?, name),
                email = COALESCE(?, email),
                photo_url = COALESCE(?, photo_url),
                gender = COALESCE(?, gender),
                claimed_by_uid = COALESCE(?, claimed_by_uid),
                is_teacher = COALESCE(?, is_teacher),
                is_approved = COALESCE(?, is_approved)`,
        args: [
          id, name, email || null, photo_url || null, gender || null,
          claimed_by_uid || null, is_teacher ? 1 : 0, is_approved ? 1 : 0,
          name, email || null, photo_url || null, gender || null,
          claimed_by_uid || null, is_teacher ? 1 : 0, is_approved ? 1 : 0,
        ],
      });

      const result = await turso.execute({
        sql: 'SELECT * FROM students WHERE id = ?',
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
        sql: 'DELETE FROM students WHERE id = ?',
        args: [id],
      });
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Students API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
