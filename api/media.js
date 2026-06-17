const VDS = 'http://212.180.120.242:3001';

export default async function handler(req, res) {
  try {
    const filename = req.query?.file;
    if (!filename || filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }
    const upstream = await fetch(`${VDS}/media/${encodeURIComponent(filename)}`);
    if (!upstream.ok) return res.status(upstream.status).json({ error: 'Not found' });
    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
    const buffer = await upstream.arrayBuffer();
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.status(200).send(Buffer.from(buffer));
  } catch (err) {
    console.error('Media proxy error:', err);
    res.status(502).json({ error: 'VDS unreachable' });
  }
}
