/**
 * ====================================================================
 * KodiKids 6x6 Maze Engine & Code Sequencer
 * ====================================================================
 * Mengontrol arena labirin 6x6, orientasi robot Kodi dengan panah kuning,
 * eksekusi kode sekuensial langkah demi langkah, dan modal kemenangan.
 */

// 0 = Utara (Atas), 1 = Timur (Kanan), 2 = Selatan (Bawah), 3 = Barat (Kiri)
const DIRECTION_NAMES = ['Utara (Atas)', 'Timur (Kanan)', 'Selatan (Bawah)', 'Barat (Kiri)'];
const DIRECTION_ROTATIONS = [0, 90, 180, 270];

const LEVEL_CONFIGS = {
  1: {
    title: "Level 1: Garis Lurus",
    gridSize: 6,
    robotStart: { x: 1, y: 3, dir: 1 }, // hadap Timur
    star: { x: 4, y: 3 },
    obstacles: [
      { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 },
      { x: 1, y: 4 }, { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 4, y: 4 },
      { x: 0, y: 3 }
    ]
  },
  2: {
    title: "Level 2: Belok Santai",
    gridSize: 6,
    robotStart: { x: 1, y: 4, dir: 0 }, // hadap Utara
    star: { x: 4, y: 2 },
    obstacles: [
      { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 },
      { x: 2, y: 3 }, { x: 2, y: 4 }, { x: 3, y: 3 },
      { x: 4, y: 1 }, { x: 5, y: 2 }
    ]
  },
  3: {
    title: "Level 3: Labirin Emas",
    gridSize: 6,
    robotStart: { x: 0, y: 4, dir: 0 }, // hadap Utara
    star: { x: 4, y: 1 },
    obstacles: [
      { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 },
      { x: 3, y: 4 }, { x: 3, y: 3 },
      { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 5, y: 1 }
    ]
  },
  4: {
    title: "Level 4: Tikungan Ganda",
    gridSize: 6,
    robotStart: { x: 0, y: 5, dir: 0 }, // hadap Utara
    star: { x: 5, y: 1 },
    obstacles: [
      { x: 1, y: 4 }, { x: 1, y: 3 }, { x: 1, y: 2 },
      { x: 3, y: 5 }, { x: 3, y: 4 }, { x: 3, y: 3 },
      { x: 3, y: 1 }, { x: 4, y: 1 },
      { x: 1, y: 0 }, { x: 2, y: 0 }
    ]
  },
  5: {
    title: "Level 5: Labirin Juara",
    gridSize: 6,
    robotStart: { x: 0, y: 5, dir: 0 }, // hadap Utara
    star: { x: 2, y: 3 },
    obstacles: [
      { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 },
      { x: 1, y: 2 }, { x: 1, y: 3 }, { x: 1, y: 4 },
      { x: 4, y: 2 }, { x: 3, y: 3 }, { x: 4, y: 3 },
      { x: 1, y: 5 }, { x: 2, y: 5 }, { x: 3, y: 5 }, { x: 4, y: 5 }, { x: 5, y: 5 }
    ]
  }
};

let currentLevel = 1;
let robot = { x: 1, y: 3, dir: 1 };
let commandSequence = [];
let isRunningProgram = false;
let nextLevelTarget = 2;
const completedLevels = new Set();

function initMazeBoard() {
  const cfg = LEVEL_CONFIGS[currentLevel];
  robot = { ...cfg.robotStart };
  
  const titleEl = document.getElementById('maze-level-title');
  if (titleEl) titleEl.innerText = cfg.title;

  renderGrid();
  updateStatusText("Kodi siap! Susun balok kodingmu.");
  updateDirectionBadge();
}

function selectLevel(lvl) {
  if (isRunningProgram) return;
  currentLevel = lvl;

  for (let i = 1; i <= 5; i++) {
    const btn = document.getElementById(`lvl-btn-${i}`);
    if (btn) {
      if (i === lvl) {
        btn.className = "bg-blue-600 text-white font-bold px-3.5 py-1.5 rounded-full shadow-md text-xs shrink-0 transition-all scale-105";
      } else {
        btn.className = "bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-slate-200 shrink-0 transition-all";
      }
    }
  }

  commandSequence = [];
  renderCommandList();
  initMazeBoard();
  if (window.SoundEngine) window.SoundEngine.playPop(520, 'triangle', 0.09);
}

function renderGrid() {
  const board = document.getElementById('grid-board');
  if (!board) return;
  board.innerHTML = '';

  const cfg = LEVEL_CONFIGS[currentLevel];
  const size = cfg.gridSize || 6;

  // Pastikan grid 6 kolom
  board.className = "grid grid-cols-6 gap-1 sm:gap-1.5 w-full h-full";

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const tile = document.createElement('div');
      tile.className = "aspect-square w-full h-full min-w-0 min-h-0 rounded-lg sm:rounded-xl flex items-center justify-center bg-white border border-slate-200 sm:border-2 shadow-sm relative overflow-hidden select-none transition-colors";

      // Cek Rintangan Batu
      const isRock = cfg.obstacles.some(o => (o.x === x && o.y === y) || (o.c === x && o.r === y));
      if (isRock) {
        tile.classList.add('bg-slate-300', 'border-slate-400');
        tile.innerHTML = `<span class="text-base sm:text-lg select-none" title="Rintangan Batu">🪨</span>`;
      }

      // Cek Bintang Target
      const isStar = (cfg.star.x === x && cfg.star.y === y) || (cfg.star.c === x && cfg.star.r === y);
      if (isStar) {
        const starSpan = document.createElement('span');
        starSpan.className = "text-base sm:text-lg animate-sparkle select-none";
        starSpan.innerText = '⭐';
        starSpan.title = 'Bintang Target!';
        tile.appendChild(starSpan);
      }

      // Cek Posisi Robot Kodi
      const isRobotHere = (robot.x !== undefined ? robot.x === x && robot.y === y : robot.c === x && robot.r === y);
      if (isRobotHere) {
        const botEl = document.createElement('div');
        botEl.className = "relative flex items-center justify-center transition-transform duration-300 ease-out";
        botEl.style.transform = `rotate(${DIRECTION_ROTATIONS[robot.dir]}deg)`;
        botEl.title = `Kodi - Hadap ${DIRECTION_NAMES[robot.dir]}`;

        botEl.innerHTML = `
          <svg class="w-6 h-6 sm:w-8 sm:h-8 filter drop-shadow" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Panah Kuning Penunjuk Arah Maju di Atas Kepala Robot -->
            <polygon points="24,1 32,12 16,12" fill="#F59E0B" stroke="#B45309" stroke-width="2" stroke-linejoin="round"/>
            <!-- Kepala & Tubuh Robot Kodi -->
            <rect x="8" y="13" width="32" height="30" rx="8" fill="#2563EB" stroke="#1D4ED8" stroke-width="2"/>
            <rect x="12" y="18" width="24" height="15" rx="4" fill="#0F172A"/>
            <!-- Mata Sensor Mint Ceria -->
            <circle cx="18" cy="25" r="3" fill="#10B981"/>
            <circle cx="19" cy="24" r="1" fill="#FFFFFF"/>
            <circle cx="30" cy="25" r="3" fill="#10B981"/>
            <circle cx="31" cy="24" r="1" fill="#FFFFFF"/>
            <!-- Senyum Robot -->
            <path d="M21 29 Q24 32 27 29" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/>
            <!-- Antena Telinga -->
            <rect x="5" y="23" width="3" height="8" rx="1" fill="#93C5FD"/>
            <rect x="40" y="23" width="3" height="8" rx="1" fill="#93C5FD"/>
            <circle cx="24" cy="38" r="2.5" fill="#38BDF8"/>
          </svg>
        `;
        tile.appendChild(botEl);
      }

      board.appendChild(tile);
    }
  }
}

function updateDirectionBadge() {
  const el = document.getElementById('facing-indicator');
  if (el) el.innerText = `Menghadap: ${DIRECTION_NAMES[robot.dir]}`;
}

function updateStatusText(txt, isError = false) {
  const statusEl = document.getElementById('action-status-text');
  if (!statusEl) return;
  statusEl.innerText = txt;
  if (isError) {
    statusEl.className = "text-xs sm:text-sm font-extrabold text-rose-600 truncate";
  } else {
    statusEl.className = "text-xs sm:text-sm font-extrabold text-blue-600 truncate";
  }
}

function addCommand(type) {
  if (isRunningProgram) return;
  if (commandSequence.length >= 24) {
    updateStatusText("Maksimal 24 balok perintah!", true);
    if (window.SoundEngine) window.SoundEngine.playBump();
    return;
  }
  commandSequence.push(type);
  renderCommandList();
  if (window.SoundEngine) window.SoundEngine.playPop(480, 'sine', 0.08);
}

function removeCommandAtIndex(idx) {
  if (isRunningProgram) return;
  commandSequence.splice(idx, 1);
  renderCommandList();
  if (window.SoundEngine) window.SoundEngine.playPop(300, 'sine', 0.05);
}

function clearCommands() {
  if (isRunningProgram) return;
  commandSequence = [];
  renderCommandList();
  resetRobotState();
  if (window.SoundEngine) window.SoundEngine.playPop(350, 'sine', 0.08);
}

function resetRobotState() {
  const cfg = LEVEL_CONFIGS[currentLevel];
  robot = { ...cfg.robotStart };
  renderGrid();
  updateDirectionBadge();
  updateStatusText("Posisi Kodi telah diatur ulang.");
}

function renderCommandList() {
  const listEl = document.getElementById('command-sequence-list');
  const badgeEl = document.getElementById('command-count-badge');
  if (!listEl) return;

  if (badgeEl) badgeEl.innerText = `${commandSequence.length} Perintah`;

  if (commandSequence.length === 0) {
    listEl.innerHTML = `
      <div id="empty-command-hint" class="h-32 flex flex-col items-center justify-center text-center text-slate-400 p-2">
        <span class="text-2xl mb-1">👈</span>
        <p class="text-xs font-semibold">Belum ada balok perintah.</p>
        <p class="text-[10px] text-slate-400 mt-0.5">Sentuh tombol balok di palet untuk menambahkan!</p>
      </div>
    `;
    return;
  }

  listEl.innerHTML = '';
  commandSequence.forEach((cmd, idx) => {
    const item = document.createElement('div');
    item.id = `cmd-item-${idx}`;
    let label = '';
    let colorClasses = '';

    if (cmd === 'MAJU') {
      label = '⬆️ Maju 1 Langkah';
      colorClasses = 'bg-blue-50 text-blue-700 border-blue-200';
    } else if (cmd === 'PUTAR_KANAN') {
      label = '↪️ Putar Kanan 90°';
      colorClasses = 'bg-indigo-50 text-indigo-700 border-indigo-200';
    } else if (cmd === 'PUTAR_KIRI') {
      label = '↩️ Putar Kiri 90°';
      colorClasses = 'bg-indigo-50 text-indigo-700 border-indigo-200';
    } else if (cmd === 'AMBIL_BINTANG') {
      label = '⭐ Ambil Bintang';
      colorClasses = 'bg-amber-50 text-amber-900 border-amber-300';
    }

    item.className = `flex items-center justify-between p-2 rounded-xl border font-fun font-bold text-xs ${colorClasses} shadow-sm transition-all`;
    item.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="w-5 h-5 bg-white/90 rounded-md flex items-center justify-center text-[10px] text-slate-700 font-mono shadow-inner">${idx + 1}</span>
        <span>${label}</span>
      </div>
      <button onclick="removeCommandAtIndex(${idx})" class="text-slate-400 hover:text-rose-600 font-bold px-1.5 py-0.5 rounded text-xs transition-colors" title="Hapus balok">✕</button>
    `;
    listEl.appendChild(item);
  });
}

async function executeProgram() {
  if (isRunningProgram) return;
  if (commandSequence.length === 0) {
    updateStatusText("Tambahkan minimal 1 balok perintah!", true);
    if (window.SoundEngine) window.SoundEngine.playBump();
    return;
  }

  isRunningProgram = true;
  resetRobotState();
  const cfg = LEVEL_CONFIGS[currentLevel];
  const size = cfg.gridSize || 6;
  let hasWon = false;

  const runBtn = document.getElementById('run-code-btn');
  if (runBtn) runBtn.classList.add('opacity-75', 'cursor-not-allowed');

  for (let i = 0; i < commandSequence.length; i++) {
    const allItems = document.querySelectorAll('#command-sequence-list > div');
    allItems.forEach(el => el.classList.remove('ring-2', 'ring-blue-500'));
    const activeItem = document.getElementById(`cmd-item-${i}`);
    if (activeItem) {
      activeItem.classList.add('ring-2', 'ring-blue-500');
      activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    const cmd = commandSequence[i];

    if (cmd === 'PUTAR_KANAN') {
      robot.dir = (robot.dir + 1) % 4;
      updateStatusText(`Langkah ${i + 1}: Putar Kanan 90°`);
      if (window.SoundEngine) window.SoundEngine.playTurn();
    } else if (cmd === 'PUTAR_KIRI') {
      robot.dir = (robot.dir + 3) % 4;
      updateStatusText(`Langkah ${i + 1}: Putar Kiri 90°`);
      if (window.SoundEngine) window.SoundEngine.playTurn();
    } else if (cmd === 'MAJU') {
      let nextX = robot.x !== undefined ? robot.x : robot.c;
      let nextY = robot.y !== undefined ? robot.y : robot.r;

      if (robot.dir === 0) nextY--;      // Utara
      else if (robot.dir === 1) nextX++; // Timur
      else if (robot.dir === 2) nextY++; // Selatan
      else if (robot.dir === 3) nextX--; // Barat

      // Cek Batas Arena 6x6
      if (nextX < 0 || nextX >= size || nextY < 0 || nextY >= size) {
        updateStatusText(`Oops! Kodi menabrak dinding batas!`, true);
        if (window.SoundEngine) window.SoundEngine.playBump();
        isRunningProgram = false;
        if (runBtn) runBtn.classList.remove('opacity-75', 'cursor-not-allowed');
        return;
      }

      // Cek Rintangan Bebatuan
      const hitRock = cfg.obstacles.some(o => (o.x === nextX && o.y === nextY) || (o.c === nextX && o.r === nextY));
      if (hitRock) {
        updateStatusText(`Aduh! Kodi terhalang bebatuan!`, true);
        if (window.SoundEngine) window.SoundEngine.playBump();
        isRunningProgram = false;
        if (runBtn) runBtn.classList.remove('opacity-75', 'cursor-not-allowed');
        return;
      }

      robot.x = nextX;
      robot.y = nextY;
      updateStatusText(`Langkah ${i + 1}: Maju 1 langkah`);
      if (window.SoundEngine) window.SoundEngine.playStep();
    } else if (cmd === 'AMBIL_BINTANG') {
      const targetX = cfg.star.x !== undefined ? cfg.star.x : cfg.star.c;
      const targetY = cfg.star.y !== undefined ? cfg.star.y : cfg.star.r;
      const currX = robot.x !== undefined ? robot.x : robot.c;
      const currY = robot.y !== undefined ? robot.y : robot.r;

      if (currX === targetX && currY === targetY) {
        hasWon = true;
        updateStatusText(`Hebat! Bintang emas berhasil diambil! ⭐`, false);
        if (window.SoundEngine) window.SoundEngine.playWin();
      } else {
        updateStatusText(`Belum ada bintang di petak ini!`, true);
        if (window.SoundEngine) window.SoundEngine.playPop(300, 'sine', 0.08);
      }
    }

    renderGrid();
    updateDirectionBadge();
    await new Promise(r => setTimeout(r, 450));
  }

  const targetX = cfg.star.x !== undefined ? cfg.star.x : cfg.star.c;
  const targetY = cfg.star.y !== undefined ? cfg.star.y : cfg.star.r;
  const currX = robot.x !== undefined ? robot.x : robot.c;
  const currY = robot.y !== undefined ? robot.y : robot.r;

  if (hasWon || (currX === targetX && currY === targetY)) {
    completedLevels.add(currentLevel);
    updateStatusText(`Hore! Misi ${cfg.title} Sukses Sempurna! 🎉`);
    const nextLvl = currentLevel < 5 ? currentLevel + 1 : 1;
    setTimeout(() => {
      showVictoryModal(currentLevel, commandSequence, nextLvl);
    }, 350);
  } else {
    updateStatusText(`Kodi belum sampai di bintang target. Coba atur ulang baloknya ya!`);
  }

  const allItems = document.querySelectorAll('#command-sequence-list > div');
  allItems.forEach(el => el.classList.remove('ring-2', 'ring-blue-500'));

  isRunningProgram = false;
  if (runBtn) runBtn.classList.remove('opacity-75', 'cursor-not-allowed');
}

function showVictoryModal(lvl, codeLinesArray, nextLvl) {
  nextLevelTarget = nextLvl;
  const modal = document.getElementById('victoryModal');
  const codeBlock = document.getElementById('victoryCodeBlock');
  const promptEl = document.getElementById('victoryNextLevelPrompt');
  const actionBtnLabel = document.getElementById('btnNextLevelActionLabel');

  let htmlLines = '';
  const activeCommands = (codeLinesArray && codeLinesArray.length > 0)
    ? codeLinesArray
    : ['MAJU', 'MAJU', 'PUTAR_KANAN', 'MAJU', 'AMBIL_BINTANG'];

  activeCommands.forEach((cmd, idx) => {
    let codeSnippet = '';
    let commentText = '';

    if (cmd === 'MAJU') {
      codeSnippet = `<span class="text-amber-300 font-semibold">kodi.maju()</span>;`;
      commentText = `<span class="text-slate-400 italic ml-2">// maju 1 langkah</span>`;
    } else if (cmd === 'PUTAR_KANAN') {
      codeSnippet = `<span class="text-amber-300 font-semibold">kodi.putarKanan()</span>;`;
      commentText = `<span class="text-slate-400 italic ml-2">// putar kanan 90°</span>`;
    } else if (cmd === 'PUTAR_KIRI') {
      codeSnippet = `<span class="text-amber-300 font-semibold">kodi.putarKiri()</span>;`;
      commentText = `<span class="text-slate-400 italic ml-2">// putar kiri 90°</span>`;
    } else if (cmd === 'AMBIL_BINTANG') {
      codeSnippet = `<span class="text-emerald-400 font-bold">kodi.ambilBintang()</span>;`;
      commentText = `<span class="text-slate-400 italic ml-2">// ambil bintang sasaran</span>`;
    }

    htmlLines += `
      <div class="flex items-start">
        <span class="w-5 text-slate-500 text-right pr-2 select-none">${idx + 1}</span>
        <div class="flex-1">${codeSnippet} ${commentText}</div>
      </div>
    `;
  });

  if (codeBlock) codeBlock.innerHTML = htmlLines;

  if (promptEl && actionBtnLabel) {
    if (lvl === 1) {
      promptEl.innerText = "Apakah kamu siap lanjut ke Level 2: Belok Santai?";
      actionBtnLabel.innerText = "Lanjut ke Level 2 🚀";
    } else if (lvl === 2) {
      promptEl.innerText = "Keren sekali! Siap lanjut ke Level 3: Labirin Emas?";
      actionBtnLabel.innerText = "Lanjut ke Level 3 🚀";
    } else if (lvl === 3) {
      promptEl.innerText = "Luar biasa! Sekarang tantangan baru: Level 4: Tikungan Ganda?";
      actionBtnLabel.innerText = "Lanjut ke Level 4 🚀";
    } else if (lvl === 4) {
      promptEl.innerText = "Hebat! Siap menaklukkan tantangan puncak: Level 5: Labirin Juara?";
      actionBtnLabel.innerText = "Lanjut ke Level 5 🚀";
    } else {
      promptEl.innerText = "Luar Biasa! Semua level tuntas. Siap cetak Sertifikat Prestasimu?";
      actionBtnLabel.innerText = "Klaim Sertifikat Juara 🏆";
    }
  }

  if (window.addStars) window.addStars(1);
  if (window.SoundEngine) window.SoundEngine.playWin();
  if (modal) modal.classList.remove('hidden');
}

function closeVictoryModal() {
  const modal = document.getElementById('victoryModal');
  if (modal) modal.classList.add('hidden');
  if (window.SoundEngine) window.SoundEngine.playPop(320, 'sine', 0.08);
}

function proceedToNextLevel() {
  closeVictoryModal();
  if (currentLevel === 5) {
    window.location.hash = '#sertifikat';
  } else {
    selectLevel(nextLevelTarget);
    window.location.hash = '#arena';
  }
}

function triggerVictoryDemo() {
  const demoCmds = commandSequence.length > 0 ? commandSequence : ['MAJU', 'MAJU', 'PUTAR_KANAN', 'MAJU', 'AMBIL_BINTANG'];
  const nextLvl = currentLevel < 5 ? currentLevel + 1 : 1;
  showVictoryModal(currentLevel, demoCmds, nextLvl);
}

// Navigasi Geser Tombol Level (Horizontal Scroll with Arrow Buttons)
function scrollLevelStrip(direction) {
  const container = document.getElementById('level-selector-strip');
  if (!container) return;
  const scrollAmount = direction === 'left' ? -120 : 120;
  container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
}

// Ekspor ke window global
window.initMazeBoard = initMazeBoard;
window.selectLevel = selectLevel;
window.renderGrid = renderGrid;
window.addCommand = addCommand;
window.removeCommandAtIndex = removeCommandAtIndex;
window.clearCommands = clearCommands;
window.resetRobotState = resetRobotState;
window.executeProgram = executeProgram;
window.showVictoryModal = showVictoryModal;
window.closeVictoryModal = closeVictoryModal;
window.proceedToNextLevel = proceedToNextLevel;
window.triggerVictoryDemo = triggerVictoryDemo;
window.scrollLevelStrip = scrollLevelStrip;
window.completedLevels = completedLevels;
