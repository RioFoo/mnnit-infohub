// Notification alert: plays a short sound + vibrates if supported

const NOTIF_SOUND_FREQ = 880; // A5 note
const NOTIF_SOUND_DURATION = 120; // ms

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

export function playNotificationAlert() {
  // Vibrate (mobile)
  if (navigator.vibrate) {
    navigator.vibrate([80, 40, 80]);
  }

  // Play a short tone
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(NOTIF_SOUND_FREQ, ctx.currentTime);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + NOTIF_SOUND_DURATION / 1000);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + NOTIF_SOUND_DURATION / 1000);
  } catch {
    // Silent fail — audio may be blocked by browser policy
  }
}
