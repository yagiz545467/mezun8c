import { VercelRequest, VercelResponse } from '@vercel/node';
import { initDatabase, selectOne, execute } from './_lib/turso';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');

  try {
    await initDatabase();

    if (req.method === 'GET') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'id query parameter is required' });
      const row = await selectOne('SELECT * FROM settings WHERE id = ?', [id as string]);
      return res.status(200).json(row || null);
    }

    if (req.method === 'POST') {
      const { id, value } = req.body;
      if (!id || value === undefined) return res.status(400).json({ error: 'id and value are required' });
      await execute(`INSERT INTO settings (id, value) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET value = ?`, [
        id, String(value), String(value),
      ]);
      return res.status(200).json({ id, value: String(value) });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Settings API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
