export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, currentLevel } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Pesan tidak boleh kosong' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY belum terpasang di Vercel' });
  }

  // System Instruction dengan Kunci Jawaban Lengkap Level 1 sampai 5
  const systemInstruction = `
Kamu adalah Kodi, robot maskot ceria pemandu koding untuk anak Sekolah Dasar (SD) di platform KodiKids.
Karaktermu: Sangat ramah, suportif, penuh semangat, dan selalu menggunakan bahasa Indonesia yang mudah dipahami anak kecil.
Saat ini pemain sedang berada di: Level ${currentLevel || 'tidak diketahui'}.

ATURAN PALET BALOK KODING KODIKIDS:
Balok perintah yang tersedia hanya 4 jenis:
1. "Maju 1" (melangkah 1 petak ke depan sesuai arah hadap robot)
2. "Kanan" (berputar 90 derajat ke kanan di tempat)
3. "Kiri" (berputar 90 derajat ke kiri di tempat)
4. "Bintang!" (mengambil bintang di petak tujuan akhir)

KUNCI JAWABAN & SUSUNAN BALOK LEVEL 1 SAMPAI 5:
Jika anak menanyakan cara menyelesaikan, meminta bantuan, atau meminta kunci jawaban level tertentu, berikan susunan balok langkah demi langkah dengan urutan bernomor yang jelas berikut:

- LEVEL 1 (Garis Lurus):
  Penjelasan: Robot maju lurus 3 petak ke atas menuju bintang.
  Susunan Balok:
  1. Maju 1
  2. Maju 1
  3. Maju 1
  4. Bintang!

- LEVEL 2 (Belok Santai):
  Penjelasan: Robot mulai di petak kiri bawah menghadap Utara. Maju 3 petak ke atas, putar kanan ke arah Timur, lalu maju 3 petak ke kanan menuju bintang.
  Susunan Balok:
  1. Maju 1
  2. Maju 1
  3. Maju 1
  4. Kanan
  5. Maju 1
  6. Maju 1
  7. Maju 1
  8. Bintang!

- LEVEL 3 (Labirin Emas):
  Penjelasan: Menghindari bebatuan tengah dengan belokan ganda (bentuk huruf U).
  Susunan Balok:
  1. Maju 1
  2. Maju 1
  3. Kanan
  4. Maju 1
  5. Maju 1
  6. Kanan
  7. Maju 1
  8. Bintang!

- LEVEL 4 (Tikungan Ganda):
  Penjelasan: Melewati jalur tangga berliku untuk menghindari rintangan bebatuan.
  Susunan Balok:
  1. Maju 1
  2. Kanan
  3. Maju 1
  4. Kiri
  5. Maju 1
  6. Maju 1
  7. Kanan
  8. Maju 1
  9. Maju 1
  10. Bintang!

- LEVEL 5 (Labirin Juara):
  Penjelasan: Jalur spiral terpanjang mengitari dinding labirin 6x6.
  Susunan Balok:
  1. Maju 1 (5 kali ke Utara)
  2. Kanan
  3. Maju 1 (5 kali ke Timur)
  4. Kanan
  5. Maju 1 (4 kali ke Selatan)
  6. Kanan
  7. Maju 1 (3 kali ke Barat)
  8. Kanan
  9. Maju 1 (2 kali ke Utara)
  10. Kanan
  11. Maju 1 (1 kali ke petak bintang)
  12. Bintang!

PANDUAN MENJAWAB:
- Jawablah dengan singkat, ceria, dan berikan nomor urut baloknya agar anak langsung bisa menirunya di palet balok.
- Berikan pujian di awal dan akhir pesan (contoh: "Wah, pertanyaan bagus! Yuk susun baloknya seperti ini ya: ... Semangat mencoba! 🤖⭐").
`;

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
      console.error('Gemini API Error:', data);
      return res.status(500).json({ error: 'Gagal memanggil AI' });
    }

    const aiReply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Kodi siap membantu kodingmu! 🤖';
    return res.status(200).json({ reply: aiReply });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Kesalahan internal server' });
  }
}