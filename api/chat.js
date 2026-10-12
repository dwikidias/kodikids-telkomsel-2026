/**
 * Vercel Serverless Function: POST /api/chat
 * Logika identik dengan server.js karena memakai modul bersama lib/kodiChat.js.
 */
const { processChat } = require('../lib/kodiChat');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: 'Format JSON tidak valid.' });
    }
  }

  try {
    const result = await processChat(body);
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error('[api/chat] Unexpected error:', err);
    return res.status(200).json({
      reply: 'Maaf, Kodi sedang kebingungan sebentar. Coba tanya lagi ya!'
    });
  }
};