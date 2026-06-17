const VDS = 'http://212.180.120.242:3001';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  try {
    const targetUrl = `${VDS}${req.url === '/api/upload-chunk/finalize' ? '/api/upload-chunk/finalize' : '/api/upload-chunk'}`;
    const upstream = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    const data = await upstream.json();
    return res.status(upstream.status).json(data);
  } catch (err) {
    console.error('Upload chunk proxy error:', err);
    return res.status(502).json({ error: 'VDS unreachable' });
  }
}
