import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Sync existing custom icon if present
try {
  const iconPath = path.join(__dirname, 'assets', 'icon.png');
  if (fs.existsSync(iconPath) && fs.statSync(iconPath).size > 0) {
    const buf = fs.readFileSync(iconPath);
    fs.writeFileSync(path.join(__dirname, 'assets', 'icon-512.png'), buf);
    fs.writeFileSync(path.join(__dirname, 'assets', 'icon-192.png'), buf);
    fs.writeFileSync(path.join(__dirname, 'assets', 'apple-touch-icon.png'), buf);
  }
} catch (e) {}

app.use(express.json({ limit: '20mb' }));

app.post('/api/custom-icon', (req, res) => {
  try {
    const { image } = req.body || {};
    if (!image) {
      return res.status(400).json({ ok: false });
    }
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const assetsDir = path.join(__dirname, 'assets');
    fs.writeFileSync(path.join(assetsDir, 'icon.png'), buffer);
    fs.writeFileSync(path.join(assetsDir, 'icon-512.png'), buffer);
    fs.writeFileSync(path.join(assetsDir, 'icon-192.png'), buffer);
    fs.writeFileSync(path.join(assetsDir, 'apple-touch-icon.png'), buffer);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false });
  }
});

app.get('/manifest.json', (req, res) => {
  res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(__dirname, 'manifest.json'));
});

app.get('/sw.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Service-Worker-Allowed', '/');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(__dirname, 'sw.js'));
});

// Serve static assets from root directory
app.use(express.static(__dirname));

// Fallback to index.html for root or SPA navigation
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
