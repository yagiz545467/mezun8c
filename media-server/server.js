import express from 'express';
import cors from 'cors';
import https from 'https';
import http from 'http';
import { randomUUID } from 'crypto';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MEDIA_DIR = join(__dirname, 'media');
const CERT_DIR = join(__dirname, 'certs');
const HTTP_PORT = 3001;
const HTTPS_PORT = 3443;

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

    const proto = req.socket.encrypted ? 'https' : 'http';
    const url = `${proto}://${req.get('host')}/media/${filename}`;
    res.json({ url, filename });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const certKeyPath = join(CERT_DIR, 'key.pem');
const certPath = join(CERT_DIR, 'cert.pem');
let httpsOpts = null;

if (existsSync(certKeyPath) && existsSync(certPath)) {
  httpsOpts = { key: readFileSync(certKeyPath), cert: readFileSync(certPath) };
} else {
  console.log('SSL sertifikası bulunamadı.');
  console.log('Önce setup-ssl.ps1 çalıştırın, ya da HTTP kullanmak için:');
  console.log('  CameraTab.tsx -> VDS_URL = http://212.180.120.242:3001');
}

http.createServer(app).listen(HTTP_PORT, () => {
  console.log(`HTTP: http://212.180.120.242:${HTTP_PORT}`);
});

if (httpsOpts) {
  https.createServer(httpsOpts, app).listen(HTTPS_PORT, () => {
    console.log(`HTTPS: https://212.180.120.242:${HTTPS_PORT}`);
  });
}
