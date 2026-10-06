module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, currentLevel } = req.body || {};
  if (!message) {
    return res.status(400).json({ error: 'Pesan tidak boleh kosong' });
  }

  const apiKey = (process.env.GEMINI_API_KEY || '').trim();

  // Kamus jawaban cadangan cerdas (aktif jika semua model Google sibuk)
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
    '1': 'Untuk Level 1: Susun balok: 1. Maju 1, 2. Maju 1, 3. Maju 1, lalu 4. Bintang! Semangat ya! 🤖⭐',
    '2': 'Untuk Level 2: Susun balok: Maju 1 (3x), belok Kanan, lalu Maju 1 (3x) menuju bintang, dan akhiri dengan Bintang! 🚀',
    '3': 'Untuk Level 3: Maju 1 (2x), belok Kanan, Maju 1 (2x), belok Kanan lagi, lalu Maju 1 ke bintang! ✨',
    '4': 'Untuk Level 4: Ikuti rute tangga berbelok Kanan dan Kiri secara bergantian melewati rintangan batu! 💡',
    '5': 'Untuk Level 5: Ikuti lorong spiral dari luar memutar ke arah tengah sampai tiba tepat di bintang emas! 🏆'
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

  if (!apiKey) {
    return res.status(200).json({ reply: getSmartFallback() });
  }

  const systemInstruction = `
Kamu adalah Kodi, robot maskot ceria pemandu koding anak SD di platform KodiKids.
Karaktermu: Ramah, bersahabat, selalu berbahasa Indonesia sederhana, dan penuh semangat.
Aturan:
1. Jika ditanya istilah koding (seperti apa itu koding, algoritma, bug, loop), jelaskan dengan analogi benda nyata anak.
2. Jika ditanya cara menyelesaikan level permainan (Level 1 sampai 5), berikan urutan balok bernomor dari palet: "Maju 1", "Kanan", "Kiri", "Bintang!".
Kunci Level:
- Level 1: Maju 1 (3x), Bintang!
- Level 2: Maju 1 (3x), Kanan, Maju 1 (3x), Bintang!
- Level 3: Maju 1 (2x), Kanan, Maju 1 (2x), Kanan, Maju 1, Bintang!
- Level 4: Rute tangga selang-seling Kanan dan Kiri.
- Level 5: Rute spiral luar ke dalam (Maju 5x, Kanan, Maju 5x, Kanan, Maju 4x, Kanan, Maju 3x, Kanan, Maju 2x, Kanan, Maju 1x, Bintang!).
`;

  // Kumpulan model alternatif jika terjadi 503 (High Demand)
  const modelPool = [
    'gemini-3.8-flash',
    'gemini-3.8-flash-lite',
    'gemini-3-flash'
  ];

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: `${systemInstruction}\n\nPertanyaan anak: "${message}"` }]
      }
    ],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 300
    }
  };

  // Coba model secara berurutan
  for (const model of modelPool) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey
          },
          body: JSON.stringify(payload)
        }
      );

      const data = await response.json();

      if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
        return res.status(200).json({ reply: data.candidates[0].content.parts[0].text });
      }

      console.warn(`Model ${model} mengembalikan status ${response.status}. Mencoba model alternatif...`);
    } catch (e) {
      console.warn(`Gagal memanggil model ${model}:`, e);
    }
  }

  // Jika semua model online sedang dalam antrean beban 503, gunakan fallback cerdas
  return res.status(200).json({ reply: getSmartFallback() });
};