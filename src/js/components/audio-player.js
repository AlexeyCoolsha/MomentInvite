let btn, audio, overlay, enterBtn;
let isPlaying = false;
const DEFAULT_VOLUME = 0.5;
let audioCtx = null;
let gainNode = null;
let mediaSource = null;

function ensureAudioGraph() {
  if (!audio || audioCtx) return;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return;
  audioCtx = new Ctx();
  mediaSource = audioCtx.createMediaElementSource(audio);
  gainNode = audioCtx.createGain();
  gainNode.gain.value = DEFAULT_VOLUME;
  mediaSource.connect(gainNode).connect(audioCtx.destination);
}

function applyVolume() {
  if (audio) audio.volume = DEFAULT_VOLUME;
  if (gainNode) gainNode.gain.value = DEFAULT_VOLUME;
}

function resumeAudioContext() {
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
}

function init() {
  btn = document.getElementById('audioBtn');
  audio = document.getElementById('audio');
  overlay = document.getElementById('introOverlay');
  enterBtn = document.getElementById('enterBtn');

  // block scrolling while intro overlay is visible
  if (overlay && !overlay.classList.contains('hidden')) {
    document.body.classList.add('no-scroll');
  }

  attachListeners();
}

function attachListeners() {
  const hasAudio = !!audio;

  // Ensure audio is stopped during intro
  if (hasAudio) {
    audio.pause();
    audio.currentTime = 0;
    audio.muted = true;
    applyVolume();
    audio.autoplay = false;
    audio.removeAttribute('autoplay');
  }
  setPlayState();

  // Sync audio events with button state
  if (hasAudio) {
    audio.addEventListener('play', () => {
      setPauseState();
    });
    audio.addEventListener('pause', () => {
      setPlayState();
    });
  }

  // Intro open button
  if (enterBtn) {
    enterBtn.addEventListener('click', () => {
      if (overlay) overlay.classList.add('hidden');

      document.getElementById('app').style.display = 'block';
      document.body.classList.remove('intro-open');
      document.body.classList.remove('no-scroll');

      if (hasAudio) {
        ensureAudioGraph();
        resumeAudioContext();
        audio.currentTime = 0;
        audio.muted = false;
        applyVolume();
        audio.play().catch(() => {});
      }
    });
  }

  // Audio button click
  if (btn) {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();

      // Hide tooltip on first click
      const tooltip = btn.querySelector('[data-tooltip]');
      if (tooltip && !tooltip.classList.contains('hidden')) {
        tooltip.classList.add('hidden');
      }

      if (!audio) return;
      if (audio.paused) {
        ensureAudioGraph();
        resumeAudioContext();
        applyVolume();
        audio.play();
      } else {
        audio.pause();
      }
    });
  }
}

// when script loads, initialize or wait for DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function setPlayState() {
  isPlaying = false;
  if (!btn) return;
  btn.classList.remove('audio-button--pause');
  btn.classList.add('audio-button--play');
}

function setPauseState() {
  isPlaying = true;
  if (!btn) return;
  btn.classList.remove('audio-button--play');
  btn.classList.add('audio-button--pause');
}
