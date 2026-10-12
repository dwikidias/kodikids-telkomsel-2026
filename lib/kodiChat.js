/**
 * KodiKids - Inti logika chat "Kodi si Robot AI".
 * Dipakai bersama oleh server.js (Express / Dokploy) dan api/chat.js (Vercel Serverless)
 * agar perilaku endpoint /api/chat identik di kedua platform.
 */

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'openai/gpt-oss-20b';
const FETCH_TIMEOUT_MS = 8000;

const SYSTEM_INSTRUCTION =
  'Kamu adalah Kodi si Robot AI, sahabat belajar koding untuk siswa Sekolah Dasar (usia 6-12 tahun). ' +
  'Berikan jawaban yang ramah, mendidik, ringkas (maksimal 2-3 kalimat), dan jelas. ' +
  'HINDARI emotikon berlebihan (cukup 1 emoji ramah di awal atau tanpa emoji sama sekali). ' +
  'Jika ditanya soal matematika umum seperti 1+1, jawab langsung dengan benar tanpa membahas level koding.';

// ---------------------------------------------------------------------------
// Kunci jawaban resmi Level 1-5 (Fast Cache, tanpa memanggil API eksternal)
// ---------------------------------------------------------------------------
const M = 'kodi.maju(); // maju 1 langkah';
const KA = 'kodi.putarKanan(); // putar kanan 90°';
const KI = 'kodi.putarKiri(); // putar kiri 90°';
const B = 'kodi.ambilBintang(); // ambil bintang sasaran';
const rep = (step, n) => Array(n).fill(step);

const LEVEL_STEPS = {
  1: [...rep(M, 2), B],
  2: [...rep(M, 2), KA, ...rep(M, 3), B],
  3: [KA, ...rep(M, 2), KA, M, KI, ...rep(M, 2), KI, ...rep(M, 4), B],
  4: [KA, ...rep(M, 2), KI, ...rep(M, 3), KA, ...rep(M, 3), KI, M, B],
  5: [...rep(M, 5), KA, ...rep(M, 5), KA, ...rep(M, 4), KA, ...rep(M, 3), KA, M, B]
};

const LEVEL_ANSWERS = Object.fromEntries(
  Object.entries(LEVEL_STEPS).map(([lvl, steps]) => [
    lvl,
    `Kunci Jawaban Level ${lvl}:\n${steps.join('\n')}`
  ])
);

// Kata yang menandakan anak meminta bantuan/kunci jawaban level.
const LEVEL_INTENT = /(kunci|jawab|cara|bantu|tolong|solusi|selesai|menang|lewat|langkah|gimana|bagaimana|caranya|kode|susah|sulit|tamat|petunjuk|hint|contek)/i;

/**
 * Mengembalikan kunci jawaban jika pesan menanyakan level 1-5, selain itu null.
 */
function getLevelAnswer(message, currentLevel) {
  const clean = message.toLowerCase().trim();
  const match = clean.match(/\blevel\s*-?\s*([1-5])\b/);

  if (match) {
    // "level 3" saja, atau "level 3" + kata bantuan -> berikan kunci.
    const onlyLevel = /^(kodi[,\s]*)?level\s*-?\s*[1-5][\s?!.]*$/.test(clean);
    if (onlyLevel || LEVEL_INTENT.test(clean)) return LEVEL_ANSWERS[match[1]];
    return null;
  }

  // "kunci jawaban" tanpa nomor level -> pakai currentLevel (opsional) dari frontend.
  if (/kunci\s*jawaban/.test(clean)) {
    const lvl = String(parseInt(currentLevel, 10) || '');
    if (LEVEL_ANSWERS[lvl]) return LEVEL_ANSWERS[lvl];
  }
  return null;
}

// ---------------------------------------------------------------------------
// Fallback ramah anak (dipakai jika API key kosong / timeout / error)
// ---------------------------------------------------------------------------
const OFFLINE_TERMS = [
  { keywords: ['algoritma'], reply: 'Algoritma adalah langkah-langkah teratur untuk menyelesaikan masalah, seperti urutan menyikat gigi atau resep membuat roti.' },
  { keywords: ['bug'], reply: 'Bug adalah kesalahan kecil di dalam kode program. Mencari dan memperbaikinya disebut debugging.' },
  { keywords: ['loop', 'perulangan'], reply: 'Loop adalah perintah untuk mengulang suatu tindakan berkali-kali secara otomatis tanpa menulis perintah yang sama berulang-ulang.' },
  { keywords: ['koding', 'coding'], reply: 'Koding adalah cara memberi perintah kepada komputer agar menjalankan tugas yang kita inginkan, seperti menggambar atau menjalankan game.' }
];

const DEFAULT_FALLBACK =
  'Halo, aku Kodi! Otak robotku sedang istirahat sebentar. Coba tanya lagi nanti, atau ketik "kunci jawaban level 1" sampai "level 5" kalau butuh bantuan main labirin.';

function getFriendlyFallback(message) {
  const clean = message.toLowerCase();
  for (const item of OFFLINE_TERMS) {
    if (item.keywords.some((k) => clean.includes(k))) return item.reply;
  }
  return DEFAULT_FALLBACK;
}

// ---------------------------------------------------------------------------
// Integrasi Groq Cloud dengan Timeout Guard 8 detik
// ---------------------------------------------------------------------------
async function askGroq(message) {
  const apiKey = (process.env.GROQ_API_KEY || '').trim();
  if (!apiKey) throw new Error('GROQ_API_KEY belum diisi');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: (process.env.GROQ_MODEL || DEFAULT_MODEL).trim(),
        messages: [
          { role: 'system', content: SYSTEM_INSTRUCTION },
          { role: 'user', content: message }
        ],
        temperature: 0.3,
        max_completion_tokens: 512,
        reasoning_effort: 'low'
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(`Groq HTTP ${response.status}: ${data?.error?.message || 'unknown error'}`);
    }

    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) {
      throw new Error('Groq mengembalikan respon kosong');
    }
    return content.trim();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Memproses body permintaan chat.
 * @param {object} body - { message: string, currentLevel?: number }
 * @returns {Promise<{status: number, body: object}>}
 */
async function processChat(body) {
  const { message, currentLevel } = body || {};

  // a) Validasi input
  if (typeof message !== 'string' || !message.trim()) {
    return { status: 400, body: { error: 'Pesan tidak boleh kosong dan harus berupa teks.' } };
  }
  const text = message.trim().slice(0, 1000);

  // b) Fast cache: kunci jawaban level 1-5
  const levelAnswer = getLevelAnswer(text, currentLevel);
  if (levelAnswer) {
    return { status: 200, body: { reply: levelAnswer, source: 'cache' } };
  }

  // c) Groq Cloud, d) fallback tangguh
  try {
    const reply = await askGroq(text);
    return { status: 200, body: { reply, source: 'groq' } };
  } catch (err) {
    const reason = err && err.name === 'AbortError' ? 'timeout 8 detik' : err && err.message;
    console.warn('[KodiChat] Fallback aktif:', reason);
    return { status: 200, body: { reply: getFriendlyFallback(text), source: 'fallback' } };
  }
}

module.exports = { processChat, getLevelAnswer, LEVEL_ANSWERS };
