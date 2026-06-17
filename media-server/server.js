import express from 'express';
import cors from 'cors';
import http from 'http';
import { randomUUID } from 'crypto';
import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MEDIA_DIR = join(__dirname, 'media');
const DIST_DIR = join(__dirname, 'dist');
const PORT = process.env.PORT || 3001;
const API_UPSTREAM = 'https://mezun8c.vercel.app';

const app = express();

app.use(cors());
app.use(express.json({ limit: '100mb' }));

app.use('/media', express.static(MEDIA_DIR));

app.post('/api/upload', async (req, res) => {
  try {
    const { base64 } = req.body;
    if (!base64) return res.status(400).json({ error: 'Missing base64' });

    const matches = base64.match(/^data:(image\/(\w+)|video\/(\w+));base64,(.+)$/);
    if (!matches) return res.status(400).json({ error: 'Invalid base64 format' });

    const ext = matches[2] || matches[3];
    const data = matches[4];
    const filename = `${randomUUID()}.${ext}`;
    const filepath = join(MEDIA_DIR, filename);

    await mkdir(MEDIA_DIR, { recursive: true });
    await writeFile(filepath, Buffer.from(data, 'base64'));

    const url = `http://${req.get('host')}/media/${filename}`;
    res.json({ url, filename });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const proxyTarget = `${API_UPSTREAM}/api`;
app.all('/api/*', async (req, res) => {
  try {
    const path = req.path;
    const targetUrl = `${proxyTarget}${path === '/api' ? '' : path.substring(4)}`;
    const headers = { 'Content-Type': 'application/json' };
    const body = ['GET', 'HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body);
    const upstream = await fetch(targetUrl, { method: req.method, headers, body });
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    console.error('Proxy error:', err.message);
    res.status(502).json({ error: 'Upstream unavailable' });
  }
});

app.use(express.static(DIST_DIR));

app.get('*', (_req, res) => {
  res.sendFile(join(DIST_DIR, 'index.html'));
});

http.createServer(app).listen(PORT, () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Serving frontend from: ${DIST_DIR}`);
  console.log(`Serving media from: ${MEDIA_DIR}`);
  console.log(`Proxying /api/* -> ${API_UPSTREAM}`);
});
