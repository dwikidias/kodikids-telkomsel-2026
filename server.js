/**
 * KodiKids - Server Express mandiri (Dokploy / container / lokal).
 * Menyajikan frontend statis + endpoint POST /api/chat (Groq Cloud).
 */
const path = require('path');
const express = require('express');
const { processChat } = require('./lib/kodiChat');

const app = express();
const PORT = process.env.PORT || 3000;

app.disable('x-powered-by');
app.use(express.json({ limit: '16kb' }));

// API chat (logika identik dengan api/chat.js untuk Vercel).
// Didaftarkan SEBELUM pemblokir berkas agar /api/chat tidak ikut terblokir.
app.post('/api/chat', async (req, res) => {
  try {
    const result = await processChat(req.body);
    res.status(result.status).json(result.body);
  } catch (err) {
    console.error('[server] Unexpected error:', err);
    res.status(200).json({ reply: 'Maaf, Kodi sedang kebingungan sebentar. Coba tanya lagi ya!' });
  }
});
app.all('/api/chat', (req, res) => {
  res.set('Allow', 'POST').status(405).json({ error: 'Method not allowed' });
});

app.get('/healthz', (req, res) => res.json({ status: 'ok' }));

// Keamanan: express.static('.') menyajikan seluruh root, jadi blokir berkas sensitif
// (kredensial, kode server, konfigurasi) agar tidak bisa diunduh dari browser.
const BLOCKED = [
  /^\/\./,                                   // dotfiles: .env, .git, .gitignore, ...
  /^\/(server\.js|package(-lock)?\.json)$/i,
  /^\/(api|lib|node_modules)(\/|$)/i,
  /^\/(antigravity_config|mcp_config)\.json$/i,
  /\.local\.json$/i,
  /\.env/i
];
app.use((req, res, next) => {
  let p;
  try {
    p = decodeURIComponent(req.path);
  } catch {
    return res.status(400).end();
  }
  if (BLOCKED.some((re) => re.test(p))) return res.status(404).end();
  next();
});

// Frontend statis: index.html, css/, js/, assets/
app.use(express.static('.', { dotfiles: 'ignore', index: 'index.html' }));

// Penanganan JSON rusak / error lain tanpa membuat server crash
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Format JSON tidak valid.' });
  }
  console.error('[server] Error:', err);
  res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
});

if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server KodiKids siap di http://0.0.0.0:${PORT}`);
    if (!process.env.GROQ_API_KEY) {
      console.warn('GROQ_API_KEY belum diisi: chat akan memakai jawaban fallback.');
    }
  });
}

module.exports = app;
