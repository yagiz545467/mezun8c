import { VercelRequest, VercelResponse } from '@vercel/node';
import { getTurso, initDatabase } from './_lib/turso';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');

  try {
    await initDatabase();
    const turso = getTurso();

    if (req.method === 'GET') {
      const result = await turso.execute('SELECT * FROM memories ORDER BY created_at DESC');
      return res.status(200).json(result.rows);
    }

    if (req.method === 'POST') {
      const { id, student_id, student_name, user_uid, media_url, media_type, created_at } = req.body;

      if (!id || !student_id || !student_name || !user_uid || !media_url) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      await turso.execute({
        sql: `INSERT INTO memories (id, student_id, student_name, user_uid, media_url, media_type, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id, student_id, student_name, user_uid, media_url,
          media_type || 'image', created_at || Date.now(),
        ],
      });

      const result = await turso.execute({
        sql: 'SELECT * FROM memories WHERE id = ?',
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
        sql: 'DELETE FROM memories WHERE id = ?',
        args: [id],
      });
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Memories API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
