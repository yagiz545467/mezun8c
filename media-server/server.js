import express from 'express';
import cors from 'cors';
import { randomUUID } from 'crypto';
import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MEDIA_DIR = join(__dirname, 'media');
const PORT = process.env.PORT || 3001;

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

    const url = `${req.protocol}://${req.get('host')}/media/${filename}`;
    res.json({ url, filename });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Media server running on port ${PORT}`);
  console.log(`Serving files from: ${MEDIA_DIR}`);
});
