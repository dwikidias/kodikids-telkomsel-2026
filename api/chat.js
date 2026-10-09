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

  // 1. Kamus Jawaban Cadangan Tanpa Emotikon
  const termAnswers = [
    {
      keywords: ['koding', 'coding', 'apa itu koding'],
      reply: 'Koding adalah cara memberi perintah kepada komputer agar komputer menjalankan tugas yang kita inginkan, seperti menggambar, menghitung, atau menjalankan game.'
    },
    {
      keywords: ['algoritma', 'apa itu algoritma'],
      reply: 'Algoritma adalah langkah-langkah teratur dan berurutan untuk menyelesaikan suatu masalah, contohnya seperti resep membuat roti atau urutan menyikat gigi.'
    },
    {
      keywords: ['bug', 'kutu', 'apa itu bug'],
      reply: 'Bug adalah istilah untuk kesalahan pada baris kode program. Tugas programmer adalah mencari dan memperbaikinya melalui proses debugging.'
    },
    {
      keywords: ['loop', 'perulangan', 'apa itu loop'],
      reply: 'Loop adalah perintah untuk mengulang suatu tindakan berkali-kali secara otomatis tanpa perlu menuliskan perintah yang sama berulang-ulang.'
    }
  ];

  // 2. Kunci Jawaban Resmi Level Permainan (Teks Bersih)
  const levelAnswers = {
    '1': 'Kunci Jawaban Level 1:\n1. Maju 1\n2. Maju 1\n3. Maju 1\n4. Bintang!',
    '2': 'Kunci Jawaban Level 2:\n1. Maju 1\n2. Maju 1\n3. Kanan\n4. Maju 1\n5. Maju 1\n6. Maju 1\n7. Bintang!',
    '3': 'Kunci Jawaban Level 3:\n1. Kanan\n2. Maju 1 (2x)\n3. Kanan\n4. Maju 1\n5. Kiri\n6. Maju 1 (2x)\n7. Kiri\n8. Maju 1 (4x)\n9. Bintang!',
    '4': 'Kunci Jawaban Level 4:\n1. Kanan\n2. Maju 1 (2x)\n3. Kiri\n4. Maju 1 (3x)\n5. Kanan\n6. Maju 1 (3x)\n7. Kiri\n8. Maju 1\n9. Bintang!',
    '5': 'Kunci Jawaban Level 5:\n1. Maju 1 (5x)\n2. Kanan\n3. Maju 1 (5x)\n4. Kanan\n5. Maju 1 (4x)\n6. Kanan\n7. Maju 1 (3x)\n8. Kanan\n9. Maju 1 (1x)\n10. Bintang!'
  };

  function getSmartFallback() {
    const clean = message.toLowerCase().trim();
    for (const item of termAnswers) {
      if (item.keywords.some(k => clean.includes(k))) return item.reply;
    }
    const matchLevel = clean.match(/level\s*([1-5])/i);
    if (matchLevel) return levelAnswers[matchLevel[1]];
    if (clean.includes('selesai') || clean.includes('cara main') || clean.includes('kunci jawaban')) {
      const activeLvl = String(currentLevel || '1');
      return levelAnswers[activeLvl] || levelAnswers['1'];
    }
    if (clean.includes('1+1') || clean.includes('1 + 1')) {
      return 'Jawaban dari 1 + 1 adalah 2.';
    }
    return 'Halo! Saya Kodi, asisten belajar koding anak SD. Tanyakan istilah koding atau cara menyelesaikan level labirin jika kamu butuh bantuan.';
  }

  if (!apiKey) {
    return res.status(200).json({ reply: getSmartFallback() });
  }

  // 3. System Prompt Bersih: Larangan Emotikon Berlebihan dan Pemisahan Konteks
  const systemPrompt = `Anda adalah Kodi, robot pemandu koding anak SD di platform KodiKids.
Karakter: Ramah, mendidik, berbahasa Indonesia yang jelas, ringkas, dan santun.

ATURAN GAYA PENULISAN:
1. DILARANG menggunakan banyak emoji atau emotikon. Hindari emoji hiasan seperti api, roket, apel, atau bintang berderet. Gunakan teks polos yang rapi.
2. Jawab pertanyaan anak secara tepat sasaran dan singkat (maksimal 2-3 kalimat).
3. HANYA berikan kunci jawaban level permainan JIKA anak secara eksplisit bertanya tentang level atau cara menyelesaikan permainan (contoh: "bantu level 2", "cara menang", "level 3").
4. JIKA anak bertanya hal umum (contoh: matematika "1+1", sains, sapaan halo), JAWAB LANGSUNG pertanyaan tersebut secara wajar TANPA membawa-bawa kunci jawaban level labirin.

KUNCI RESMI GAME LABIRIN (Hanya jika ditanya tentang level):
- Level 1: Maju 1 (3x), Bintang!
- Level 2: Maju 1 (2x), Kanan, Maju 1 (3x), Bintang!
- Level 3: Kanan, Maju 1 (2x), Kanan, Maju 1, Kiri, Maju 1 (2x), Kiri, Maju 1 (4x), Bintang!
- Level 4: Kanan, Maju 1 (2x), Kiri, Maju 1 (3x), Kanan, Maju 1 (3x), Kiri, Maju 1, Bintang!
- Level 5: Maju 1 (5x), Kanan, Maju 1 (5x), Kanan, Maju 1 (4x), Kanan, Maju 1 (3x), Kanan, Maju 1 (1x), Bintang!`;

  const userMessage = `Pertanyaan anak: "${message}". (Pemain sedang membuka Level ${currentLevel || 1})`;

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
        max_tokens: 250
      })
    });

    const data = await response.json();

    if (response.ok && data.choices?.[0]?.message?.content) {
      return res.status(200).json({ reply: data.choices[0].message.content });
    }

    console.warn('API error, gunakan fallback:', data.error?.message || '');
    return res.status(200).json({ reply: getSmartFallback() });
  } catch (err) {
    console.error('Fetch error:', err);
    return res.status(200).json({ reply: getSmartFallback() });
  }
};