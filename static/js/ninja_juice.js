// ============================================================================
// NINJATSU CORE ENGINE: NATURE BGM, SFX, SENSEI VOICE & MANUAL DAY/NIGHT THEME
// ============================================================================

window.NinjaAudio = (() => {
  let audioCtx = null;
  let bgmAudio = null;
  let isBgmActive = false;

  // Sound settings (default to true if not set)
  let sfxEnabled = localStorage.getItem('ninja_sfx_enabled') !== 'false';
  let bgmEnabled = localStorage.getItem('ninja_bgm_enabled') !== 'false';

  function getAudioCtx() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // --- MANUAL THEME SELECTION (USER CONTROLLED) ---
  function getSavedTheme() {
    return localStorage.getItem('ninja_theme') || 'day';
  }

  function isNightMode() {
    return getSavedTheme() === 'night';
  }

  // --- 1. PROCEDURAL SOUND EFFECTS ---
  function playTap() {
    if (!sfxEnabled) return;
    try {
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch (e) {}
  }

  function playWhoosh() {
    if (!sfxEnabled) return;
    try {
      const ctx = getAudioCtx();
      const bufferSize = ctx.sampleRate * 0.16;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(600, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(2400, ctx.currentTime + 0.07);
      filter.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.16);
      filter.Q.value = 2.5;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
    } catch (e) {}
  }

  function playWin() {
    if (!sfxEnabled) return;
    try {
      const ctx = getAudioCtx();
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);

        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.06 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.06);
        osc.stop(ctx.currentTime + idx * 0.06 + 0.35);
      });
    } catch (e) {}
  }

  function playLoss() {
    if (!sfxEnabled) return;
    try {
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(130, ctx.currentTime + 0.28);

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.28);
    } catch (e) {}
  }

  // --- 2. CUSTOM SOUNDTRACK AMBIENCE ---
  const DAY_BGM_SRC = "/static/video/morning_sound.mp3";
  const NIGHT_BGM_SRC = "../static/video/night_sound.mp3";

  function getTargetSrc() {
    return isNightMode() ? NIGHT_BGM_SRC : DAY_BGM_SRC;
  }

  function startForestAmbience() {
    if (!bgmEnabled) return;

    const targetSrc = getTargetSrc();

    // Create persistent Audio element if not already initialized
    if (!bgmAudio) {
      bgmAudio = new Audio();
      bgmAudio.loop = true;
      bgmAudio.volume = 0.4;
    }

    // Update track source if switched between Day/Night
    if (!bgmAudio.src.endsWith(targetSrc)) {
      bgmAudio.src = targetSrc;
      bgmAudio.load();
    }

    // Play track
    bgmAudio.play()
      .then(() => {
        isBgmActive = true;
      })
      .catch((err) => {
        // Handled: Waits for first physical interaction click
        isBgmActive = false;
      });
  }

  function stopForestAmbience() {
    isBgmActive = false;
    if (bgmAudio) {
      bgmAudio.pause();
    }
  }

  // --- 3. SOFT SENSEI VOICE ---
  function speak(text) {
    if (!sfxEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.95;
    utter.pitch = 1.35;

    const voices = window.speechSynthesis.getVoices();
    const friendlyVoice = voices.find(v => 
      v.name.includes('Google UK English Female') || 
      v.name.includes('Samantha') || 
      v.name.includes('Natural') ||
      (v.lang.startsWith('en') && v.name.includes('Female'))
    );
    if (friendlyVoice) utter.voice = friendlyVoice;

    window.speechSynthesis.speak(utter);
  }

  const cheers = ["Great move, hero!", "Awesome slice!", "Super ninja speed!", "Spot on!"];
  const comforts = ["Almost there! Try again!", "You can do it, ninja!", "Nice try!"];

  function cheer() {
    playWin();
    speak(cheers[Math.floor(Math.random() * cheers.length)]);
  }

  function comfort() {
    playLoss();
    speak(comforts[Math.floor(Math.random() * comforts.length)]);
  }

  // --- 4. MANUAL DAY/NIGHT DOM THEME APPLY ---
  function applyTheme(theme) {
    const body = document.body;
    if (!body) return;

    if (theme === 'night') {
      body.classList.remove('theme-day');
      body.classList.add('theme-night');
    } else {
      body.classList.remove('theme-night');
      body.classList.add('theme-day');
    }

    // Dynamic Video Background switcher (if present)
    const videoSrc = document.getElementById('bg-video-source');
    const videoEl = document.getElementById('bg-video');
    if (videoSrc && videoEl) {
      const targetVideo = theme === 'night' ? "/static/video/night_sound.mp3" : "/static/video/morning_sound.mp3";
      if (videoSrc.getAttribute('src') !== targetVideo) {
        videoSrc.setAttribute('src', targetVideo);
        videoEl.load();
        videoEl.play().catch(() => {});
      }
    }

    // Switch soundtrack track
    if (bgmEnabled) {
      startForestAmbience();
    }
  }

  function setTheme(theme) {
    localStorage.setItem('ninja_theme', theme);
    applyTheme(theme);
  }

  return {
    playTap,
    playWhoosh,
    playWin,
    playLoss,
    cheer,
    comfort,
    speak,
    startForestAmbience,
    stopForestAmbience,
    applyTheme: () => applyTheme(getSavedTheme()),
    setTheme,
    getSavedTheme,
    isNightMode,
    setSfx: (val) => {
      sfxEnabled = val;
      localStorage.setItem('ninja_sfx_enabled', val);
      if (!val && 'speechSynthesis' in window) window.speechSynthesis.cancel();
    },
    setBgm: (val) => {
      bgmEnabled = val;
      localStorage.setItem('ninja_bgm_enabled', val);
      if (val) startForestAmbience();
      else stopForestAmbience();
    },
    isSfxEnabled: () => sfxEnabled,
    isBgmEnabled: () => bgmEnabled
  };
})();

// Automatic Sitewide Setup
document.addEventListener("DOMContentLoaded", () => {
  // 1. Apply theme
  NinjaAudio.applyTheme();

  // 2. Clear browser autoplay blocks: Start BGM on the first user interaction
  const triggerAudioPlayback = () => {
    NinjaAudio.startForestAmbience();
  };

  // Listen to document clicks
  document.addEventListener('click', triggerAudioPlayback, { once: true });
  document.addEventListener('keydown', triggerAudioPlayback, { once: true });

  // 3. Click sounds for interactive buttons
  document.addEventListener('click', (e) => {
    const target = e.target.closest('button, .btn, .scroll-btn, .letter-btn, .game-card, .answer-btn, .target-item, .memory-card');
    if (target) {
      NinjaAudio.playTap();
      target.style.transform = 'scale(0.95)';
      setTimeout(() => target.style.transform = '', 90);
    }
  }, true);

  // 4. Page change navigation sounds
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (link && !link.getAttribute('href').startsWith('#') && !link.getAttribute('href').startsWith('javascript:')) {
      NinjaAudio.playWhoosh();
    }
  });
});

// Dynamic Social Sharing
function setupSocialSharing(userXp = 0, belt = 'White Belt') {
  const shareText = encodeURIComponent(
    `🥷 I just unlocked the ${belt} with ${userXp} Star XP in Ninjatsu Dojo! Can you beat my score? Train with me:`
  );
  const shareUrl = encodeURIComponent(window.location.origin);

  const waBtn = document.getElementById('shareWhatsApp');
  if (waBtn) waBtn.href = `https://api.whatsapp.com/send?text=${shareText}%20${shareUrl}`;

  const twBtn = document.getElementById('shareTwitter');
  if (twBtn) twBtn.href = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`;
}

// Native Mobile Web Share API
async function triggerWebShare() {
  const shareData = {
    title: 'Ninjatsu Dojo',
    text: 'Train like a ninja with math and word puzzles! 🥷',
    url: window.location.origin
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch (err) {}
  } else {
    navigator.clipboard.writeText(window.location.origin);
    alert('Dojo invite link copied to clipboard! 📋');
  }
}