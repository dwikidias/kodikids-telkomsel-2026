/**
 * Vercel Serverless Function: KodiKids Tanya Kodi AI Buddy Handler
 * Integrasi Google Gemini AI untuk asisten belajar koding anak SD.
 */

export default async function handler(req, res) {
  // CORS Configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method Not Allowed',
      message: 'Hanya metode POST yang diizinkan.'
    });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        // Biarkan body as is jika gagal parse
      }
    }

    const { message } = body || {};
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Pesan pertanyaan (message) wajib diisi.'
      });
    }

    // Cukup baca dari process.env tanpa menuliskan teks kunci asli di sini
    const apiKey = process.env.GEMINI_API_KEY;
    const primaryUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const systemInstructionText = "Kamu adalah Kodi, robot maskot ceria pemandu koding untuk anak Sekolah Dasar (SD usia 6-12 tahun) di platform KodiKids. Karaktermu: Sangat ramah, bersahabat, selalu menggunakan bahasa Indonesia yang sederhana dan ceria. Gunakan analogi benda nyata anak (seperti mainan balok lego, kue, menyikat gigi, bermain sepeda). Jawablah secara singkat dan padat (maksimal 2-3 kalimat per jawaban). Tambahkan emoji ceria seperti 🤖, ⭐, 🚀, 💡. Jangan gunakan istilah teknis rumit tanpa menjelaskan artinya secara jenaka.";

    const requestPayload = {
      systemInstruction: {
        parts: [
          { text: systemInstructionText }
        ]
      },
      contents: [
        {
          role: "user",
          parts: [
            { text: message.trim() }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 250
      }
    };

    // Fungsi pembantu panggil API Gemini
    const callGemini = async (url) => {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestPayload)
      });
      return response;
    };

    // Panggil model utama gemini-1.5-flash
    let geminiRes = await callGemini(primaryUrl);

    // Fallback otomatis ke gemini-flash-lite-latest jika model 1.5-flash tidak tersedia / 404
    if (!geminiRes.ok && geminiRes.status === 404) {
      const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`;
      geminiRes = await callGemini(fallbackUrl);
    }

    if (!geminiRes.ok) {
      const errorText = await geminiRes.text();
      let parsedError = null;
      try {
        parsedError = JSON.parse(errorText);
      } catch (e) {
        parsedError = errorText;
      }

      console.error('Gemini API Error:', geminiRes.status, parsedError);
      return res.status(geminiRes.status).json({
        error: 'Gagal memproses jawaban dari Gemini AI.',
        statusCode: geminiRes.status,
        details: parsedError
      });
    }

    const data = await geminiRes.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      return res.status(502).json({
        error: 'Format balasan Gemini tidak valid atau kosong.',
        details: data
      });
    }

    return res.status(200).json({ reply: reply.trim() });
  } catch (error) {
    console.error('KodiKids Chat API Server Error:', error);
    return res.status(500).json({
      error: 'Terjadi kesalahan internal pada server.',
      message: error.message || 'Unknown server error'
    });
  }
}
