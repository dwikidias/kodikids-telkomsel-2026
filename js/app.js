/**
 * ====================================================================
 * KodiKids Main Application Controller (js/app.js)
 * ====================================================================
 * Menangani:
 * 1. Manajemen Bintang & Status Buka Kunci Sertifikat (5 Bintang)
 * 2. Pop-up Modal Autentikasi (Masuk, Daftar, Intip Mata Password, Tamu)
 * 3. Kuis Logika Detektif Cilik (5 Soal Bergambar & Gamifikasi)
 * 4. Tanya Kodi (AI Assistant Sederhana)
 * 5. Navigasi Tab & FAB Suara
 */

let earnedStars = 0;

// ====================================================================
// 1. MANAJEMEN BINTANG & BUKA KUNCI SERTIFIKAT
// ====================================================================

function addStars(amount) {
  earnedStars += amount;
  const headerCount = document.getElementById('header-star-count');
  if (headerCount) headerCount.innerText = earnedStars;

  updateCertificateState();
}

function updateCertificateState() {
  const lockedCard = document.getElementById('cert-locked-card');
  const unlockedForm = document.getElementById('cert-unlocked-form');
  const certOverlay = document.getElementById('cert-locked-overlay');
  const certPrintArea = document.getElementById('certificate-printable-area');
  const countEl = document.getElementById('cert-stars-count');
  const progressFill = document.getElementById('cert-lock-progress-fill');

  if (countEl) countEl.innerText = Math.min(earnedStars, 5);
  if (progressFill) {
    const pct = Math.min(100, Math.round((earnedStars / 5) * 100));
    progressFill.style.width = `${pct}%`;
  }

  // Syarat kelulusan: minimal 5 bintang terkumpul
  if (earnedStars >= 5) {
    if (lockedCard) lockedCard.classList.add('hidden');
    if (unlockedForm) unlockedForm.classList.remove('hidden');
    if (certOverlay) certOverlay.classList.add('hidden');
    if (certPrintArea) {
      certPrintArea.className = "filter-none opacity-100 transition-all duration-500 bg-gradient-to-b from-white to-amber-50/20 p-4 sm:p-8 rounded-3xl border-4 sm:border-8 border-blue-600 shadow-2xl relative overflow-hidden";
    }
  } else {
    if (lockedCard) lockedCard.classList.remove('hidden');
    if (unlockedForm) unlockedForm.classList.add('hidden');
    if (certOverlay) certOverlay.classList.remove('hidden');
    if (certPrintArea) {
      certPrintArea.className = "filter blur-md pointer-events-none select-none opacity-40 transition-all duration-500 bg-gradient-to-b from-white to-amber-50/20 p-4 sm:p-8 rounded-3xl border-4 sm:border-8 border-blue-600 shadow-xl relative overflow-hidden";
    }
  }
}

function updateCertificateName() {
  const input = document.getElementById('student-name-input');
  const disp = document.getElementById('cert-display-name');
  if (input && disp && input.value.trim()) {
    disp.innerText = input.value.trim();
    if (window.SoundEngine) window.SoundEngine.playPop(520, 'triangle', 0.1);
  }
}

// ====================================================================
// 2. MODAL AUTENTIKASI LENGKAP & PASSWORD INTIP MATA
// ====================================================================

function openAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) modal.classList.remove('hidden');
  if (window.SoundEngine) window.SoundEngine.playPop(480, 'triangle', 0.08);
}

function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) modal.classList.add('hidden');
  if (window.SoundEngine) window.SoundEngine.playPop(300, 'sine', 0.08);
}

function switchAuthTab(tab) {
  const btnLogin = document.getElementById('tab-btn-login');
  const btnReg = document.getElementById('tab-btn-register');
  const submitBtn = document.getElementById('auth-submit-btn');
  const repeatPassGroup = document.getElementById('auth-repeat-pass-group');

  if (tab === 'login') {
    btnLogin.className = "flex-1 py-2 text-xs font-bold rounded-lg transition-all bg-white text-blue-600 shadow-sm";
    btnReg.className = "flex-1 py-2 text-xs font-bold rounded-lg transition-all text-slate-600 hover:text-slate-900";
    submitBtn.innerHTML = "<span>Masuk Sekarang</span><span>🚀</span>";
    if (repeatPassGroup) repeatPassGroup.classList.add('hidden');
  } else {
    btnReg.className = "flex-1 py-2 text-xs font-bold rounded-lg transition-all bg-white text-blue-600 shadow-sm";
    btnLogin.className = "flex-1 py-2 text-xs font-bold rounded-lg transition-all text-slate-600 hover:text-slate-900";
    submitBtn.innerHTML = "<span>Daftar Akun Baru</span><span>⭐</span>";
    if (repeatPassGroup) repeatPassGroup.classList.remove('hidden');
  }
  if (window.SoundEngine) window.SoundEngine.playPop(420, 'sine', 0.05);
}

// Fitur Intip Mata Kata Sandi (Toggle Password Visibility)
function togglePasswordVisibility(inputId, btnEl) {
  const input = document.getElementById(inputId);
  if (!input) return;

  if (input.type === 'password') {
    input.type = 'text';
    btnEl.innerText = '🙈';
    btnEl.title = 'Sembunyikan kata sandi';
  } else {
    input.type = 'password';
    btnEl.innerText = '👁️';
    btnEl.title = 'Lihat kata sandi';
  }
  if (window.SoundEngine) window.SoundEngine.playPop(500, 'sine', 0.05);
}

function handleAuthSubmit(e) {
  if (e) e.preventDefault();
  const nameInput = document.getElementById('auth-name-input');
  const val = nameInput ? nameInput.value.trim() : '';

  if (val) {
    const studentNameInput = document.getElementById('student-name-input');
    if (studentNameInput) studentNameInput.value = val;
    const certDisp = document.getElementById('cert-display-name');
    if (certDisp) certDisp.innerText = val;
  }

  closeAuthModal();
  if (window.SoundEngine) window.SoundEngine.playWin();
}

function continueAsGuest() {
  closeAuthModal();
  if (window.SoundEngine) window.SoundEngine.playPop(360, 'sine', 0.08);
}

// ====================================================================
// 3. KUIS DETEKTIF LOGIKA CILIK (5 SOAL BERGAMBAR)
// ====================================================================

const QUIZ_DATA = [
  {
    icon: "🎂",
    badge: "Tantangan 1: Sekuens",
    question: "Kodi ingin membuat kue bolu yang lezat untuk pesta robot. Manakah urutan sekuens langkah yang paling benar dan logis?",
    options: [
      "1. Makan kue bolu ➔ 2. Panggang adonan di oven ➔ 3. Campur tepung & telur",
      "1. Campur tepung & telur ➔ 2. Panggang adonan di oven ➔ 3. Hiasi krim & sajikan kue",
      "1. Nyalakan kompor kosong ➔ 2. Hiasi piring kosong ➔ 3. Beli telur di pasar"
    ],
    correct: 1,
    explanation: "Tepat sekali! Sekuens komputer harus runut dari mencampur bahan, memanggang hingga matang, lalu menghias kue."
  },
  {
    icon: "☔",
    badge: "Tantangan 2: Percabangan (If - Else)",
    question: "Aturan cuaca: 'JIKA hujan deras, bawa payung warna-warni. JIKA TIDAK, pakai topi santai.' Sore ini langit gelap dan air hujan turun deras. Benda apa yang harus dibawa?",
    options: [
      "Membawa payung warna-warni pelindung hujan",
      "Memakai kacamata hitam untuk berjemur",
      "Membawa selimut tebal ke lapangan"
    ],
    correct: 0,
    explanation: "Hebat! Karena kondisi JIKA hujan bernilai BENAR (True), maka tindakan yang dieksekusi adalah membawa payung!"
  },
  {
    icon: "🚲",
    badge: "Tantangan 3: Perulangan (Loop)",
    question: "Kodi mengayuh sepeda menuju sekolah. Jaraknya membutuhkan 20 kali kayuhan pedal kaki. Konsep koding apa yang paling efisien?",
    options: [
      "Menulis perintah 'Kayuh 1 Kali' sebanyak 20 baris melelahkan",
      "Menggunakan balok 'ULANGI 20 KALI: Kayuh pedal sepeda'",
      "Menghapus jalan menuju sekolah"
    ],
    correct: 1,
    explanation: "Pintar! Balok Perulangan (Loop) membuat komputer mengerjakan aksi berulang secara cepat tanpa lelah menulis kode panjang."
  },
  {
    icon: "🐱",
    badge: "Tantangan 4: Algoritma Navigasi",
    question: "Seekor anak kucing terperangkap di labirin. Di depannya ada dinding batu, sedangkan susu hangat ada di sebelah kanan kucing. Apa langkah tepatnya?",
    options: [
      "Terus maju menabrak dinding batu",
      "Putar Kanan 90° lalu Maju ke arah mangkuk susu",
      "Putar balik lalu tidur siang"
    ],
    correct: 1,
    explanation: "Keren! Algoritma yang cerdas selalu mencari rute bebas rintangan dengan berbelok tepat menuju target."
  },
  {
    icon: "🧦",
    badge: "Tantangan 5: Menemukan Bug (Debugging)",
    question: "Kodi memakai sepatu dulu, baru kemudian memasang kaus kaki di atas sepatunya. Apa nama kesalahan urutan dalam koding ini?",
    options: [
      "Bug (Kesalahan Logika yang harus diperbaiki/Debug)",
      "Internet Sedang Mati",
      "Komputer Hebat"
    ],
    correct: 0,
    explanation: "Luar biasa! Kesalahan instruksi atau urutan disebut 'Bug', dan memperbaikinya dinamakan proses 'Debugging'."
  }
];

let currentQuizIndex = 0;
let quizScore = 0;
let quizAnswered = false;

function renderQuiz() {
  const q = QUIZ_DATA[currentQuizIndex];
  quizAnswered = false;

  const stepTitle = document.getElementById('quiz-step-title');
  const progressBar = document.getElementById('quiz-progress-bar');
  const questionText = document.getElementById('quiz-question-text');
  const iconSpan = document.getElementById('quiz-question-icon');
  const badgeSpan = document.getElementById('quiz-question-badge');

  if (stepTitle) stepTitle.innerText = `Tantangan ${currentQuizIndex + 1} dari ${QUIZ_DATA.length}`;
  if (progressBar) progressBar.style.width = `${((currentQuizIndex + 1) / QUIZ_DATA.length) * 100}%`;
  if (questionText) questionText.innerText = q.question;
  if (iconSpan) iconSpan.innerText = q.icon;
  if (badgeSpan) badgeSpan.innerText = q.badge;

  const optsContainer = document.getElementById('quiz-options-container');
  if (optsContainer) {
    optsContainer.innerHTML = '';
    const letters = ['A', 'B', 'C'];
    q.options.forEach((optText, idx) => {
      const btn = document.createElement('button');
      btn.onclick = () => answerQuiz(idx);
      btn.className = "quiz-btn btn-pop w-full p-3 sm:p-4 min-h-[48px] rounded-2xl bg-white border-2 border-slate-200 hover:border-blue-500 text-left flex items-center justify-between gap-2.5 group transition-all";
      btn.innerHTML = `
        <div class="flex items-center gap-2.5">
          <span class="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 font-fun font-bold text-xs flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">${letters[idx]}</span>
          <span class="text-xs sm:text-sm font-semibold text-slate-800 leading-snug">${optText}</span>
        </div>
        <span class="text-slate-300 group-hover:text-blue-600 text-xs shrink-0 font-bold">➔</span>
      `;
      optsContainer.appendChild(btn);
    });
  }

  const feedbackBox = document.getElementById('quiz-feedback-box');
  const nextBtn = document.getElementById('quiz-next-btn');
  if (feedbackBox) feedbackBox.classList.add('hidden');
  if (nextBtn) nextBtn.classList.add('hidden');
}

function answerQuiz(chosenIdx) {
  if (quizAnswered) return;
  quizAnswered = true;

  const q = QUIZ_DATA[currentQuizIndex];
  const feedbackBox = document.getElementById('quiz-feedback-box');
  const headline = document.getElementById('feedback-headline');
  const detail = document.getElementById('feedback-detail');
  const nextBtn = document.getElementById('quiz-next-btn');
  const scoreBadge = document.getElementById('quiz-score-badge');

  if (feedbackBox) feedbackBox.classList.remove('hidden');

  if (chosenIdx === q.correct) {
    quizScore += 10;
    addStars(1); // Tambahkan 1 bintang per soal kuis benar
    if (feedbackBox) {
      feedbackBox.className = "p-4 rounded-2xl border-2 bg-emerald-50 border-emerald-500 text-emerald-950 space-y-1 text-xs sm:text-sm";
    }
    if (headline) headline.innerHTML = "<span>🎉</span> <span>Jawabanmu Tepat Sekali! (+1 ⭐)</span>";
    if (detail) detail.innerText = q.explanation;
    if (window.SoundEngine) window.SoundEngine.playWin();
  } else {
    if (feedbackBox) {
      feedbackBox.className = "p-4 rounded-2xl border-2 bg-rose-50 border-rose-400 text-rose-950 space-y-1 text-xs sm:text-sm";
    }
    if (headline) headline.innerHTML = "<span>🤔</span> <span>Hampir Benar! Yuk kita pelajari logikanya:</span>";
    if (detail) detail.innerText = q.explanation;
    if (window.SoundEngine) window.SoundEngine.playBump();
  }

  if (scoreBadge) scoreBadge.innerText = `Skor: +${quizScore} Poin`;

  if (nextBtn) {
    nextBtn.classList.remove('hidden');
    if (currentQuizIndex < QUIZ_DATA.length - 1) {
      nextBtn.innerHTML = `<span>Soal Selanjutnya</span> <span>👉</span>`;
      nextBtn.onclick = () => nextQuizQuestion();
    } else {
      nextBtn.innerHTML = `<span>Buka Sertifikat Kelulusan</span> <span>🏆</span>`;
      nextBtn.onclick = () => {
        window.location.hash = '#sertifikat';
      };
    }
  }
}

function nextQuizQuestion() {
  if (currentQuizIndex < QUIZ_DATA.length - 1) {
    currentQuizIndex++;
    renderQuiz();
    if (window.SoundEngine) window.SoundEngine.playPop(550, 'triangle', 0.1);
  }
}

// ====================================================================
// 4. TANYA KODI (AI LOGIC ASSISTANT - GEMINI INTEGRATION)
// ====================================================================

// Polyfill selector :has-text() agar kompatibel dengan DOM standar peramban
(function polyfillHasText() {
  if (typeof Document === 'undefined') return;
  const originalQuerySelector = Document.prototype.querySelector;
  const originalQuerySelectorAll = Document.prototype.querySelectorAll;

  function findByText(tag, text, parent = document) {
    const elements = parent.getElementsByTagName(tag || '*');
    for (const el of elements) {
      if (el.textContent && el.textContent.includes(text)) return el;
    }
    return null;
  }

  function findAllByText(selectorGroup, parent = document) {
    const results = new Set();
    const parts = selectorGroup.split(',').map(s => s.trim());
    for (const part of parts) {
      const match = part.match(/^([a-zA-Z0-9_\-\.\*]*):has-text\((["']?)(.*?)\2\)$/);
      if (match) {
        const tag = match[1] || '*';
        const text = match[3];
        const elements = parent.querySelectorAll(tag || '*');
        elements.forEach(el => {
          if (el.textContent && el.textContent.includes(text)) results.add(el);
        });
      } else {
        try {
          const els = parent.querySelectorAll(part);
          els.forEach(el => results.add(el));
        } catch (_) {}
      }
    }
    return Array.from(results);
  }

  Document.prototype.querySelector = function(selector) {
    try {
      return originalQuerySelector.call(this, selector);
    } catch (e) {
      const match = typeof selector === 'string' && selector.match(/^([a-zA-Z0-9_\-\.\*]*):has-text\((["']?)(.*?)\2\)$/);
      if (match) {
        return findByText(match[1], match[3], this);
      }
      return null;
    }
  };

  Document.prototype.querySelectorAll = function(selector) {
    try {
      return originalQuerySelectorAll.call(this, selector);
    } catch (e) {
      if (typeof selector === 'string' && selector.includes(':has-text')) {
        return findAllByText(selector, this);
      }
      return [];
    }
  };
})();

// ============================================================
// LOGIKA CHAT TANYA KODI AI BUDDY (GEMINI INTEGRATION)
// ============================================================

function initKodiChat() {
  const chatBody = document.getElementById('ai-chat-body') || document.querySelector('.ai-chat-body');
  const chatInput = document.getElementById('ai-chat-input') || document.querySelector('input[placeholder*="Ketik pertanyaanmu"]');
  const sendBtn = document.getElementById('ai-btn-send') || document.querySelector('button:has-text("Kirim")') || document.querySelector('.btn-send-chat');
  const clearBtn = document.querySelector('button:has-text("Bersihkan")') || document.querySelector('.btn-clear-chat');
  const suggestionButtons = document.querySelectorAll('.prompt-suggestion-chip, button[class*="tanya-cepat"], button:has-text("Apa itu"), button:has-text("Algoritma"), button:has-text("Bug"), button:has-text("Loop")');

  if (!chatBody || !chatInput) {
    console.warn('Elemen chat Tanya Kodi tidak ditemukan pada DOM');
    return;
  }

  // 1. Fungsi Tambah Bubble Pesan ke Layar
  function appendBubble(sender, text) {
    const bubble = document.createElement('div');
    const isKodi = sender === 'kodi';
    bubble.className = `flex gap-3 mb-4 items-start ${isKodi ? 'justify-start' : 'justify-end'}`;

    if (isKodi) {
      bubble.innerHTML = `
        <div class="w-10 h-10 rounded-full bg-blue-100 border-2 border-blue-500 flex items-center justify-center text-xl shrink-0">🤖</div>
        <div class="bg-white border-2 border-slate-200 rounded-2xl rounded-tl-none p-4 max-w-[85%] shadow-sm text-slate-800 text-sm leading-relaxed">
          <div class="font-extrabold text-blue-600 text-xs mb-1">Kodi</div>
          <p>${text}</p>
        </div>
      `;
    } else {
      bubble.innerHTML = `
        <div class="bg-blue-600 text-white rounded-2xl rounded-tr-none p-4 max-w-[85%] shadow-sm text-sm leading-relaxed">
          <div class="font-extrabold text-blue-200 text-xs mb-1 text-right">Kamu</div>
          <p>${text}</p>
        </div>
        <div class="w-10 h-10 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center text-xl shrink-0">⭐</div>
      `;
    }

    chatBody.appendChild(bubble);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  // 2. Fungsi Indikator Kodi Sedang Berpikir
  function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'kodi-typing-indicator';
    indicator.className = 'flex gap-3 mb-4 items-start justify-start';
    indicator.innerHTML = `
      <div class="w-10 h-10 rounded-full bg-blue-100 border-2 border-blue-500 flex items-center justify-center text-xl shrink-0">🤖</div>
      <div class="bg-white border-2 border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm text-xs font-bold text-blue-600 flex items-center gap-1.5">
        <span>Kodi sedang berpikir</span>
        <span class="animate-bounce">.</span>
        <span class="animate-bounce [animation-delay:0.2s]">.</span>
        <span class="animate-bounce [animation-delay:0.4s]">.</span>
      </div>
    `;
    chatBody.appendChild(indicator);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function removeTypingIndicator() {
    const el = document.getElementById('kodi-typing-indicator');
    if (el) el.remove();
  }

  // 3. Fungsi Utama Kirim Pesan ke Gemini (/api/chat)
  async function handleSend(text) {
    const query = text || chatInput.value.trim();
    if (!query) return;

    // Tampilkan pesan anak dan kosongkan input
    appendBubble('user', query);
    chatInput.value = '';
    showTypingIndicator();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query })
      });

      const data = await res.json();
      removeTypingIndicator();

      if (res.ok && data.reply) {
        appendBubble('kodi', data.reply);
        if (window.soundFx) window.soundFx.playStep();
      } else {
        throw new Error(data.error || 'Gagal memuat respon');
      }
    } catch (err) {
      console.warn('Gagal memanggil API Gemini, beralih ke jawaban lokal:', err);
      removeTypingIndicator();

      // Jawaban ceria cadangan (fallback) agar chat tidak pernah macet
      const fallbacks = [
        { key: 'koding', reply: 'Koding itu seperti menulis surat resep ajaib untuk robot atau komputer agar mereka tahu apa yang harus digambar dan dimainkan! 📝🤖' },
        { key: 'algoritma', reply: 'Algoritma adalah urutan langkah rapi seperti resep membuat roti atau menyikat gigi! Kalau urutannya terbalik, rotinya bisa berantakan! 🥪✨' },
        { key: 'bug', reply: 'Bug itu artinya kesalahan kecil dalam koding, seperti kaus kaki yang tertukar kiri dan kanan! Tugas kita memperbaikinya lewat Debugging! 🐞🔍' },
        { key: 'loop', reply: 'Loop itu seperti mengayuh sepeda berulang-ulang sampai tiba di taman bermain tanpa perlu capek mengetik perintah berkali-kali! 🚲⭐' }
      ];

      const cleanQuery = query.toLowerCase();
      let fallbackText = 'Pertanyaan yang keren! Teruslah penasaran dan suka bertanya ya, programmer cilik hebat! 🌟🤖';
      for (const item of fallbacks) {
        if (cleanQuery.includes(item.key)) {
          fallbackText = item.reply;
          break;
        }
      }
      appendBubble('kodi', fallbackText);
    }
  }

  // 4. Pasang Event Listeners
  if (sendBtn) {
    sendBtn.onclick = (e) => {
      e.preventDefault();
      handleSend();
    };
  }

  chatInput.onkeydown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  // Tombol Tanya Cepat
  suggestionButtons.forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      const questionText = btn.textContent.replace(/^[^\w\s]+/, '').trim();
      handleSend(questionText);
    };
  });

  // Tombol Bersihkan Chat
  if (clearBtn) {
    clearBtn.onclick = (e) => {
      e.preventDefault();
      chatBody.innerHTML = `
        <div class="flex gap-3 mb-4 items-start justify-start">
          <div class="w-10 h-10 rounded-full bg-blue-100 border-2 border-blue-500 flex items-center justify-center text-xl shrink-0">🤖</div>
          <div class="bg-white border-2 border-slate-200 rounded-2xl rounded-tl-none p-4 max-w-[85%] shadow-sm text-slate-800 text-sm leading-relaxed">
            <div class="font-extrabold text-blue-600 text-xs mb-1">Kodi</div>
            <p>Halo sahabat kecil! Aku Kodi, robot pemandu kodingmu. Ada kata atau logika koding yang ingin kamu tanyakan hari ini? Klik tombol pertanyaan cepat di atas atau ketik langsung di bawah ya!</p>
          </div>
        </div>
      `;
    };
  }

  // Hubungkan ke window untuk interop onclick inline
  window.handleSendChat = handleSend;
  window.clearChatBody = () => { if (clearBtn) clearBtn.click(); };
}

// Inisialisasi saat dokumen selesai dimuat
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initKodiChat);
  } else {
    initKodiChat();
  }
}

// Fungsi pembantu kompatibilitas inline onclick
function askPreset(question) {
  if (typeof window.handleSendChat === 'function') {
    window.handleSendChat(question);
  } else {
    const input = document.getElementById('ai-chat-input') || document.getElementById('chat-input-text');
    if (input) {
      input.value = question;
      if (typeof window.handleChatSubmit === 'function') window.handleChatSubmit();
    }
  }
}

function resetChat() {
  const clearBtn = document.getElementById('ai-btn-clear') || document.querySelector('.btn-clear-chat');
  if (clearBtn) {
    clearBtn.click();
  } else if (typeof window.clearChatBody === 'function') {
    window.clearChatBody();
  }
}

function handleChatSubmit(e) {
  if (e && typeof e.preventDefault === 'function') e.preventDefault();
  if (typeof window.handleSendChat === 'function') {
    window.handleSendChat();
  }
}

// ====================================================================
// 5. BOOTSTRAP INITIALIZATION
// ====================================================================

window.addEventListener('DOMContentLoaded', () => {
  if (typeof initMazeBoard === 'function') initMazeBoard();
  renderQuiz();
  updateCertificateState();
});

// Ekspor ke window global
window.addStars = addStars;
window.updateCertificateState = updateCertificateState;
window.updateCertificateName = updateCertificateName;
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.switchAuthTab = switchAuthTab;
window.togglePasswordVisibility = togglePasswordVisibility;
window.handleAuthSubmit = handleAuthSubmit;
window.continueAsGuest = continueAsGuest;
window.renderQuiz = renderQuiz;
window.answerQuiz = answerQuiz;
window.nextQuizQuestion = nextQuizQuestion;
window.askPreset = askPreset;
window.resetChat = resetChat;
window.handleChatSubmit = handleChatSubmit;
window.initKodiChat = initKodiChat;
