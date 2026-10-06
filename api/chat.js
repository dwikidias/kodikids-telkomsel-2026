module.exports = async function handler(req, res) {
  // Hanya terima metode POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, currentLevel } = req.body || {};
  if (!message) {
    return res.status(400).json({ error: 'Pesan tidak boleh kosong' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  // System Instruction dengan kepribadian Kodi dan panduan solusi Level 1 sampai 5
  const systemInstruction = `
Kamu adalah Kodi, robot maskot ceria pemandu koding anak SD di platform KodiKids.
Karaktermu: Ramah, bersahabat, selalu berbahasa Indonesia sederhana, dan penuh semangat.
Pemain saat ini di: Level ${currentLevel || 1}.

ATURAN BALOK KODING KODIKIDS:
Hanya ada 4 balok: "Maju 1", "Kanan", "Kiri", dan "Bintang!".

PANDUAN SOLUSI LEVEL:
- Level 1: Maju 1, Maju 1, Maju 1, Bintang!
- Level 2: Maju 1, Maju 1, Maju 1, Kanan, Maju 1, Maju 1, Maju 1, Bintang!
- Level 3: Maju 1, Maju 1, Kanan, Maju 1, Maju 1, Kanan, Maju 1, Bintang!
- Level 4: Maju 1, Kanan, Maju 1, Kiri, Maju 1, Maju 1, Kanan, Maju 1, Maju 1, Bintang!
- Level 5: Maju 1 (5x), Kanan, Maju 1 (5x), Kanan, Maju 1 (4x), Kanan, Maju 1 (3x), Kanan, Maju 1 (2x), Kanan, Maju 1 (1x), Bintang!

Jawablah singkat (2-3 kalimat), berikan nomor urut baloknya secara jelas, dan gunakan emoji seperti 🤖, ⭐, 🚀.
`;

  // Fallback cadangan otomatis jika kunci belum valid atau kuota habis
  const fallbackAnswers = {
    '1': 'Untuk Level 1 gampang banget! Susun balok: 1. Maju 1, 2. Maju 1, 3. Maju 1, lalu 4. Bintang! Semangat ya! 🤖⭐',
    '2': 'Untuk Level 2: Maju 1 tiga kali, belok Kanan, lalu Maju 1 tiga kali lagi menuju bintang! Jangan lupa balok Bintang! ya! 🚀',
    '3': 'Untuk Level 3: Maju 1 dua kali, belok Kanan, Maju 1 dua kali, belok Kanan lagi, lalu Maju 1 ke bintang! ✨',
    '4': 'Untuk Level 4 yang berliku: Ikuti rute tangga berbelok Kanan dan Kiri secara bergantian sampai tiba di bintang! 💡',
    '5': 'Level 5 Labirin Juara: Ikuti lorong spiral dari pinggir luar memutar ke tengah sampai robot tiba tepat di bintang emas! 🏆'
  };

  // Jika kunci API belum terpasang atau formatnya salah
  if (!apiKey || !apiKey.startsWith('AIzaSy')) {
    const levelKey = String(currentLevel || '1');
    const defaultReply = fallbackAnswers[levelKey] ||
      'Halo sahabat kecil! Kodi siap membantumu menaklukkan tantangan koding hari ini! 🤖⭐';
    return res.status(200).json({ reply: defaultReply });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemInstruction}\n\nPertanyaan anak: "${message}"` }]
            }
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 350
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.warn('Google API mengembalikan status error:', data.error);
      const levelKey = String(currentLevel || '1');
      return res.status(200).json({
        reply: fallbackAnswers[levelKey] || 'Kodi siap membantumu! Yuk susun balok kodingmu dan raih bintang emas! 🤖⭐'
      });
    }

    const aiReply = data.candidates?.[0]?.content?.parts?.[0]?.text ||
      'Wah pertanyaan menarik! Yuk coba susun balok kodingmu sekarang! 🤖';

    return res.status(200).json({ reply: aiReply });
  } catch (err) {
    console.error('Server fetch error:', err);
    return res.status(200).json({
      reply: 'Kodi sedang memeriksa peta arena! Coba tanyakan lagi ya sahabat kecil! 🤖💡'
    });
  }
};