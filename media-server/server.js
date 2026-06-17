import express from 'express';
import cors from 'cors';
import https from 'https';
import http from 'http';
import { randomUUID } from 'crypto';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import selfsigned from 'selfsigned';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MEDIA_DIR = join(__dirname, 'media');
const CERT_DIR = join(__dirname, 'certs');
const HTTP_PORT = process.env.HTTP_PORT || 3001;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;

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

    const protocol = req.socket.encrypted ? 'https' : 'http';
    const url = `${protocol}://${req.get('host')}/media/${filename}`;
    res.json({ url, filename });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

function ensureCert() {
  const keyPath = join(CERT_DIR, 'key.pem');
  const certPath = join(CERT_DIR, 'cert.pem');

  if (existsSync(keyPath) && existsSync(certPath)) {
    return { key: readFileSync(keyPath), cert: readFileSync(certPath) };
  }

  console.log('Generating self-signed certificate...');
  const attrs = [{ name: 'commonName', value: '212.180.120.242' }];
  const { private: keyPem, cert: certPem } = selfsigned.generate(attrs, {
    keySize: 2048,
    days: 365,
    algorithm: 'sha256',
    extensions: [
      { name: 'basicConstraints', cA: true },
      { name: 'subjectAltName', altNames: [{ type: 2, value: '212.180.120.242' }] },
    ],
  });

  mkdir(CERT_DIR, { recursive: true }).then(() => {
    writeFileSync(keyPath, keyPem);
    writeFileSync(certPath, certPem);
  });

  return { key: keyPem, cert: certPem };
}

http.createServer(app).listen(HTTP_PORT, () => {
  console.log(`HTTP server running on port ${HTTP_PORT}`);
});

try {
  const httpsOpts = ensureCert();
  https.createServer(httpsOpts, app).listen(HTTPS_PORT, () => {
    console.log(`HTTPS server running on port ${HTTPS_PORT}`);
  });
} catch (err) {
  console.error('Could not start HTTPS server:', err.message);
  console.log('Falling back to HTTP only. Update VDS_URL in CameraTab to use HTTP.');
}

console.log(`Serving files from: ${MEDIA_DIR}`);
