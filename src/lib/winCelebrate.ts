/**
 * Global win celebration trigger.
 *
 * Call `celebrateWin()` from any game (or from GameSessionProvider
 * completeSession) and the <WinCelebration/> component mounted in the
 * root layout will fire confetti + a soft chime. The event is debounced
 * so rapid-fire wins don't stack animations.
 */

export const WIN_EVENT = 'lovedove:win';

let lastFired = 0;

export function celebrateWin(message?: string) {
  if (typeof window === 'undefined') return;
  const now = Date.now();
  if (now - lastFired < 2500) return; // debounce: one celebration at a time
  lastFired = now;
  window.dispatchEvent(
    new CustomEvent(WIN_EVENT, { detail: { message } })
  );
}

/** A soft two-note "ta-da" chime, synthesized with WebAudio (no asset needed). */
export function playWinChime() {
  if (typeof window === 'undefined') return;
  try {
    const Ctx =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    const ctx: AudioContext = (window as any).__lovedoveAudioCtx ||= new Ctx();
    if (ctx.state === 'suspended') void ctx.resume();
    const t = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t + i * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.12, t + i * 0.09 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.09 + 0.5);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t + i * 0.09);
      osc.stop(t + i * 0.09 + 0.55);
    });
  } catch {
    /* audio blocked (autoplay policy) — confetti still shows */
  }
}
