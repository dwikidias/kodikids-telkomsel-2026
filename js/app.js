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
// 4. TANYA KODI (AI LOGIC ASSISTANT)
// ====================================================================

const KODI_KB = {
  koding: "Koding adalah cara kita memberi tahu komputer apa yang harus dilakukan menggunakan bahasa instruksi khusus yang dimengerti komputer!",
  algoritma: "Algoritma adalah resep atau urutan langkah demi langkah yang rapi untuk menyelesaikan suatu masalah, seperti resep memasak!",
  bug: "Bug adalah kesalahan dalam kode komputer yang membuat program bertingkah aneh. Memperbaiki bug disebut Debugging!",
  loop: "Loop (Perulangan) menyuruh komputer mengulang aksi berkali-kali tanpa capek!",
  perulangan: "Loop (Perulangan) menyuruh komputer mengulang aksi berkali-kali tanpa capek!",
  sekuens: "Sekuens adalah mengerjakan instruksi secara urut dari baris pertama sampai terakhir tanpa lompat-lompat.",
  variabel: "Variabel seperti kotak mainan berpita nama, tempat menyimpan data seperti skor bintang atau nama pemain!"
};

function askPreset(question) {
  const input = document.getElementById('chat-input-text');
  if (input) {
    input.value = question;
    handleChatSubmit(new Event('submit'));
  }
}

function resetChat() {
  const messagesContainer = document.getElementById('chat-messages');
  if (!messagesContainer) return;
  messagesContainer.innerHTML = `
    <div class="flex items-start gap-2.5">
      <div class="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-sm">🤖</div>
      <div class="max-w-[85%] bg-white p-3 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm text-xs sm:text-sm text-slate-800 space-y-0.5">
        <p class="font-bold text-blue-600 text-[11px]">Kodi</p>
        <p>Chat telah dibersihkan! Mau tanya apa lagi seputar koding anak pintar?</p>
      </div>
    </div>
  `;
  if (window.SoundEngine) window.SoundEngine.playPop(300, 'sine', 0.08);
}

function handleChatSubmit(e) {
  if (e) e.preventDefault();
  const input = document.getElementById('chat-input-text');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;

  appendChatMessage(text, 'user');
  input.value = '';
  if (window.SoundEngine) window.SoundEngine.playPop(500, 'sine', 0.05);

  setTimeout(() => {
    let reply = "Pertanyaan hebat! Komputer bekerja dengan menyusun instruksi logika kecil yang teratur. Kamu bisa mencobanya langsung di Arena Koding!";
    const lower = text.toLowerCase();

    if (lower.includes('koding')) reply = KODI_KB.koding;
    else if (lower.includes('algoritma')) reply = KODI_KB.algoritma;
    else if (lower.includes('bug')) reply = KODI_KB.bug;
    else if (lower.includes('loop') || lower.includes('perulangan')) reply = KODI_KB.loop;
    else if (lower.includes('sekuens') || lower.includes('urutan')) reply = KODI_KB.sekuens;
    else if (lower.includes('variabel')) reply = KODI_KB.variabel;
    else if (lower.includes('halo') || lower.includes('hai')) reply = "Halo sahabat kecil! Siap memecahkan teka-teki logika bersama Kodi hari ini?";
    else if (lower.includes('bintang')) reply = "Kumpulkan bintang dengan menyelesaikan level labirin dan menjawab 5 soal kuis logika ya!";

    appendChatMessage(reply, 'kodi');
    if (window.SoundEngine) window.SoundEngine.playPop(620, 'triangle', 0.1);
  }, 400);
}

function appendChatMessage(msg, sender) {
  const container = document.getElementById('chat-messages');
  if (!container) return;
  const row = document.createElement('div');

  if (sender === 'user') {
    row.className = "flex items-start justify-end gap-2.5";
    row.innerHTML = `
      <div class="max-w-[85%] bg-blue-600 text-white p-3 rounded-2xl rounded-tr-none shadow-sm text-xs sm:text-sm space-y-0.5">
        <p class="font-bold text-blue-100 text-[10px] text-right">Kamu</p>
        <p>${msg}</p>
      </div>
      <div class="w-8 h-8 rounded-xl bg-amber-500 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-sm">👦</div>
    `;
  } else {
    row.className = "flex items-start gap-2.5";
    row.innerHTML = `
      <div class="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-sm">🤖</div>
      <div class="max-w-[85%] bg-white p-3 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm text-xs sm:text-sm text-slate-800 space-y-0.5">
        <p class="font-bold text-blue-600 text-[11px]">Kodi</p>
        <p>${msg}</p>
      </div>
    `;
  }
  container.appendChild(row);
  container.scrollTop = container.scrollHeight;
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
