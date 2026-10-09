module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, currentLevel } = req.body || {};
  if (!message) {
    return res.status(400).json({ error: 'Pesan tidak boleh kosong' });
  }

  const apiKey = (process.env.AI_GATEWAY_API_KEY || '').trim();
  const modelName = (process.env.AI_MODEL_NAME || 'openai/gpt-oss-20b').trim();

  // 1. Kamus Jawaban Cadangan untuk Istilah Koding
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

  // 2. Kunci Jawaban Resmi Level 1 sampai 5 (Sesuai Denah Arena Terbaru)
  const levelAnswers = {
    '1': 'Kunci Jawaban Level 1 (Garis Lurus):\n1. Maju 1\n2. Maju 1\n3. Maju 1\n4. Bintang!\nSemangat mencoba ya! 🤖⭐',

    '2': 'Kunci Jawaban Level 2 (Belok Santai):\n1. Maju 1\n2. Maju 1\n3. Kanan\n4. Maju 1\n5. Maju 1\n6. Maju 1\n7. Bintang!\nSusun baloknya dan raih bintangmu! 🚀',

    '3': 'Kunci Jawaban Level 3 (Labirin Emas):\n1. Kanan\n2. Maju 1\n3. Maju 1\n4. Kanan\n5. Maju 1\n6. Kiri\n7. Maju 1\n8. Maju 1\n9. Kiri\n10. Maju 1\n11. Maju 1\n12. Maju 1\n13. Maju 1\n14. Bintang!\nKeren sekali jika kamu berhasil menyusunnya! ✨',

    '4': 'Kunci Jawaban Level 4 (Tikungan Ganda):\n1. Kanan\n2. Maju 1\n3. Maju 1\n4. Kiri\n5. Maju 1\n6. Maju 1\n7. Maju 1\n8. Kanan\n9. Maju 1\n10. Maju 1\n11. Maju 1\n12. Kiri\n13. Maju 1\n14. Bintang!\nIkuti rute tangga berbelok ini ya! 💡',

    '5': 'Kunci Jawaban Level 5 (Labirin Juara):\n1. Maju 1 (5 kali)\n2. Kanan\n3. Maju 1 (5 kali)\n4. Kanan\n5. Maju 1 (4 kali)\n6. Kanan\n7. Maju 1 (3 kali)\n8. Kanan\n9. Maju 1 (1 kali)\n10. Bintang!\nLuar biasa! Lorong spiral ini akan membawamu ke bintang emas! 🏆'
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

  // 3. System Prompt AI (Agar Respon Gemini / Groq Sama Persis dengan Kunci)
  const systemPrompt = `Anda adalah Kodi, robot maskot ceria pemandu koding anak SD di platform KodiKids.
Karakter: Sangat ramah, bersahabat, selalu berbahasa Indonesia sederhana, dan penuh semangat.
Aturan:
1. Jika ditanya istilah koding (seperti apa itu koding, algoritma, bug, loop), jelaskan dengan analogi benda nyata anak kecil.
2. Jika ditanya cara menyelesaikan level permainan (Level 1 sampai 5), WAJIB memberikan urutan balok resmi bernomor berikut:

- Level 1:
  1. Maju 1, 2. Maju 1, 3. Maju 1, 4. Bintang!

- Level 2:
  1. Maju 1, 2. Maju 1, 3. Kanan, 4. Maju 1, 5. Maju 1, 6. Maju 1, 7. Bintang!

- Level 3:
  1. Kanan, 2. Maju 1, 3. Maju 1, 4. Kanan, 5. Maju 1, 6. Kiri, 7. Maju 1, 8. Maju 1, 9. Kiri, 10. Maju 1, 11. Maju 1, 12. Maju 1, 13. Maju 1, 14. Bintang!

- Level 4:
  1. Kanan, 2. Maju 1, 3. Maju 1, 4. Kiri, 5. Maju 1, 6. Maju 1, 7. Maju 1, 8. Kanan, 9. Maju 1, 10. Maju 1, 11. Maju 1, 12. Kiri, 13. Maju 1, 14. Bintang!

- Level 5:
  1. Maju 1 (5 kali), 2. Kanan, 3. Maju 1 (5 kali), 4. Kanan, 5. Maju 1 (4 kali), 6. Kanan, 7. Maju 1 (3 kali), 8. Kanan, 9. Maju 1 (1 kali), 10. Bintang!

3. Format jawaban dibuat rapi per nomor agar anak SD mudah menirunya di palet balok. Gunakan emoji ceria seperti 🤖, ⭐, 🚀.`;

  const userMessage = `Pemain saat ini sedang di Level ${currentLevel || 1}. Pertanyaan anak: "${message}"`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.2,
        max_tokens: 350
      })
    });

    const data = await response.json();

    if (response.ok && data.choices?.[0]?.message?.content) {
      return res.status(200).json({ reply: data.choices[0].message.content });
    }

    console.warn('AI response not OK, beralih ke fallback:', response.status, data.error?.message || '');
    return res.status(200).json({ reply: getSmartFallback() });
  } catch (err) {
    console.error('Fetch error:', err);
    return res.status(200).json({ reply: getSmartFallback() });
  }
};