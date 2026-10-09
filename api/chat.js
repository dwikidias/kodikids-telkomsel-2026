module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, currentLevel } = req.body || {};
  if (!message) {
    return res.status(400).json({ error: 'Pesan tidak boleh kosong' });
  }

  // 1. Konfigurasi Fleksibel AI Gateway / OpenAI-Compatible Provider
  const baseURL = process.env.AI_GATEWAY_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta/openai/';
  const apiKey = (process.env.AI_GATEWAY_API_KEY || process.env.GEMINI_API_KEY || '').trim();
  const modelName = process.env.AI_MODEL_NAME || 'gemini-1.5-flash';

  // Kamus cadangan pintar Kodi (Resilience Fallback)
  const termAnswers = [
    {
      keywords: ['koding', 'coding', 'apa itu koding'],
      reply: 'Koding itu seperti menulis resep ajaib untuk komputer! 📝 Kita memberi tahu komputer apa yang harus digambar dan dimainkan lewat perintah teratur! 🤖✨'
    },
    {
      keywords: ['algoritma', 'apa itu algoritma'],
      reply: 'Algoritma adalah langkah-langkah yang rapi dan urut dari awal sampai akhir, persis seperti resep membuat roti selai cokelat! 🥪🦷'
    },
    {
      keywords: ['bug', 'kutu', 'apa itu bug'],
      reply: 'Bug itu artinya kesalahan kecil dalam koding! Tugas kita memperbaikinya lewat proses seru bernama Debugging! 🐞🔍'
    },
    {
      keywords: ['loop', 'perulangan', 'apa itu loop'],
      reply: 'Loop itu seperti mengayuh sepeda berulang-ulang sampai tiba di tujuan tanpa perlu capek mengetik perintah berkali-kali! 🚲⭐'
    }
  ];

  const levelAnswers = {
    '1': 'Untuk Level 1: Susun balok: 1. Maju 1 (3x), lalu 2. Bintang! Semangat ya! 🤖⭐',
    '2': 'Untuk Level 2: Susun balok: 1. Maju 1 (3x), 2. Kanan, 3. Maju 1 (3x), lalu 4. Bintang! 🚀',
    '3': 'Untuk Level 3: Susun balok: 1. Maju 1 (2x), 2. Kanan, 3. Maju 1 (2x), 4. Kanan, 5. Maju 1, lalu 6. Bintang! ✨',
    '4': 'Untuk Level 4: Rute tangga selang-seling Kanan dan Kiri melewati rintangan batu! 💡',
    '5': 'Untuk Level 5: Rute spiral luar ke dalam (Maju 5x, Kanan, Maju 5x, Kanan, Maju 4x, Kanan, Maju 3x, Kanan, Maju 2x, Kanan, Maju 1x, Bintang!). 🏆'
  };

  function getSmartFallback() {
    const clean = message.toLowerCase().trim();
    for (const item of termAnswers) {
      if (item.keywords.some(k => clean.includes(k))) return item.reply;
    }
    const matchLevel = clean.match(/level\s*([1-5])/i);
    if (matchLevel) return levelAnswers[matchLevel[1]];
    if (clean.includes('selesai') || clean.includes('main') || clean.includes('bintang') || clean.includes('bantu')) {
      const activeLvl = String(currentLevel || '1');
      return levelAnswers[activeLvl] || levelAnswers['1'];
    }
    return 'Halo sahabat kecil! Kodi siap menemanimu belajar koding. Yuk tanyakan hal seru seputar koding! 🤖⭐';
  }

  // Jika API key belum terpasang, langsung berikan balasan ramah fallback
  if (!apiKey) {
    return res.status(200).json({ reply: getSmartFallback() });
  }

  // 2. Struktur System Prompt KodiKids
  const systemPrompt = `Anda adalah Kodi, robot maskot ceria pemandu koding untuk anak Sekolah Dasar (SD usia 6-12 tahun) di platform KodiKids.
Karakter: Sangat ramah, bersahabat, selalu berbahasa Indonesia sederhana, dan penuh semangat.

ATURAN BALOK KODING KODIKIDS:
Hanya tersedia 4 balok: 'Maju 1', 'Kanan', 'Kiri', dan 'Bintang!'.

PANDUAN MENJAWAB:
1. Jika anak bertanya istilah koding (seperti apa itu koding, algoritma, bug, loop), jelaskan dengan analogi benda nyata anak (mainan lego, resep kue, sikat gigi, mengayuh sepeda).
2. Jika anak bertanya cara menyelesaikan permainan atau meminta bantuan level (Level 1 sampai 5), berikan urutan balok bernomor yang jelas sesuai kunci resmi:
   - Level 1: Maju 1 (3x), Bintang!
   - Level 2: Maju 1 (3x), Kanan, Maju 1 (3x), Bintang!
   - Level 3: Maju 1 (2x), Kanan, Maju 1 (2x), Kanan, Maju 1, Bintang!
   - Level 4: Rute tangga selang-seling Kanan dan Kiri.
   - Level 5: Rute spiral luar ke dalam (Maju 5x, Kanan, Maju 5x, Kanan, Maju 4x, Kanan, Maju 3x, Kanan, Maju 2x, Kanan, Maju 1x, Bintang!).
3. Jawablah singkat (2-3 kalimat), ceria, dan gunakan emoji seperti 🤖, ⭐, 🚀.`;

  // 3. Format Request Chat Completions (OpenAI-Compatible)
  try {
    const endpoint = `${baseURL.replace(/\/$/, '')}/chat/completions`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Pemain saat ini di Level ${currentLevel || 1}. Pertanyaan: "${message}"` }
        ],
        temperature: 0.3,
        max_tokens: 300
      })
    });

    const data = await response.json();

    // 4. Parsing Response & Resilience Fallback
    const aiReply = data.choices?.[0]?.message?.content;
    if (response.ok && aiReply) {
      return res.status(200).json({ reply: aiReply.trim() });
    }

    console.warn('AI Gateway / OpenAI API status:', response.status, data.error?.message || '');
    return res.status(200).json({ reply: getSmartFallback() });
  } catch (err) {
    console.error('Fetch error:', err);
    return res.status(200).json({ reply: getSmartFallback() });
  }
};