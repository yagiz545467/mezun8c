import { initDatabase, select, selectOne, execute } from './_lib/turso.js';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  try {
    await initDatabase();
    if (req.method === 'GET') {
      const rows = await select('SELECT * FROM memories ORDER BY created_at DESC');
      return res.status(200).json(rows);
    }
    if (req.method === 'POST') {
      const { id, student_id, student_name, user_uid, media_url, media_type, created_at } = req.body;
      if (!id || !student_id || !student_name || !user_uid || !media_url) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      await execute(`INSERT INTO memories (id, student_id, student_name, user_uid, media_url, media_type, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)`, [
        id, student_id, student_name, user_uid, media_url,
        media_type || 'image', created_at || Date.now(),
      ]);
      const row = await selectOne('SELECT * FROM memories WHERE id = ?', [id]);
      return res.status(200).json(row || null);
    }
    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'id is required' });
      await execute('DELETE FROM memories WHERE id = ?', [id]);
      return res.status(200).json({ success: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Memories API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
