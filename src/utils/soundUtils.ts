/**
 * Sound Utilities using Web Audio API for subtle, elegant iOS-style notification chimes.
 * Requires no external audio assets, works offline, and produces pristine harmonic tones.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch (e) {
    console.debug('AudioContext initialization ignored:', e);
    return null;
  }
}

/**
 * Plays a subtle, elegant Apple Dynamic Island notification chime.
 * A dual-frequency harmonic chime (E5 -> A5) with gentle exponential decay.
 */
export function playNotificationChime(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    
    // Master Gain (Gentle, non-intrusive volume)
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.12, now);
    masterGain.connect(ctx.destination);

    // Primary Tone: High crystal sine note (880 Hz - A5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880.0, now + 0.08); // slides up cleanly to A5

    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.35, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc1.connect(gain1);
    gain1.connect(masterGain);

    // Harmonic Shimmer Tone (1318.5 Hz - E6)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1318.51, now + 0.05);

    gain2.gain.setValueAtTime(0, now);
    gain2.gain.setValueAtTime(0, now + 0.04);
    gain2.gain.linearRampToValueAtTime(0.2, now + 0.07);
    gain2.gain.exponentialRampToValueAtTime(0.0005, now + 0.55);

    osc2.connect(gain2);
    gain2.connect(masterGain);

    // Start & Stop
    osc1.start(now);
    osc1.stop(now + 0.5);

    osc2.start(now + 0.04);
    osc2.stop(now + 0.6);
  } catch (err) {
    console.debug('Failed to play notification chime:', err);
  }
}
