/**
 * ====================================================================
 * KodiKids Procedural Web Audio API Synthesizer
 * ====================================================================
 * Menghasilkan efek suara murni dengan sintesis osilator Web Audio API
 * tanpa memerlukan berkas audio eksternal (.mp3/.wav).
 */

const SoundEngine = {
  ctx: null,
  soundEnabled: true,

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },

  /**
   * Main generic pop sound
   */
  playPop(freq = 440, type = 'sine', duration = 0.08, volume = 0.2) {
    if (!this.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  },

  /**
   * 1. Suara robot melangkah maju (playStep)
   */
  playStep() {
    if (!this.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(620, now + 0.07);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {
      console.warn('playStep error:', e);
    }
  },

  /**
   * 2. Suara robot berputar 90 derajat (playTurn)
   */
  playTurn() {
    if (!this.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(360, now);
      osc.frequency.linearRampToValueAtTime(520, now + 0.06);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch (e) {
      console.warn('playTurn error:', e);
    }
  },

  /**
   * 3. Suara benturan dinding atau rintangan batu (playBump)
   */
  playBump() {
    if (!this.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.16);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.16);
    } catch (e) {
      console.warn('playBump error:', e);
    }
  },

  /**
   * 4. Suara keberhasilan mencapai bintang & menang (playWin)
   */
  playWin() {
    if (!this.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          this.playPop(freq, 'triangle', idx === 3 ? 0.35 : 0.1, 0.25);
        }, idx * 110);
      });
    } catch (e) {
      console.warn('playWin error:', e);
    }
  },

  /**
   * 5. Saklar suara mengambang (toggleSound)
   */
  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    const floatIcon = document.getElementById('floating-audio-icon');

    if (this.soundEnabled) {
      if (floatIcon) floatIcon.innerText = '🔊';
      this.playPop(580, 'sine', 0.1);
    } else {
      if (floatIcon) floatIcon.innerText = '🔇';
    }
    return this.soundEnabled;
  },

  playSuccess() {
    this.playWin();
  },

  playError() {
    this.playBump();
  },

  playVictoryFanfare() {
    this.playWin();
  }
};

// Aliaskan ke window untuk fleksibilitas kode
window.SoundEngine = SoundEngine;
window.AudioEngine = SoundEngine;
window.toggleSound = () => SoundEngine.toggleSound();
window.playStep = () => SoundEngine.playStep();
window.playTurn = () => SoundEngine.playTurn();
window.playBump = () => SoundEngine.playBump();
window.playWin = () => SoundEngine.playWin();
