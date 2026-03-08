// Notification alert: plays a short sound + vibrates if supported

const NOTIF_SOUND_FREQ = 880;
const NOTIF_SOUND_DURATION = 120;
const STORAGE_KEY = 'infohub_notif_prefs';

interface NotifPrefs {
  sound: boolean;
  vibration: boolean;
}

export function getNotifPrefs(): NotifPrefs {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { sound: true, vibration: true };
}

export function setNotifPrefs(prefs: NotifPrefs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

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
  const prefs = getNotifPrefs();

  if (prefs.vibration && navigator.vibrate) {
    navigator.vibrate([80, 40, 80]);
  }

  if (!prefs.sound) return;

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
  } catch {}
}
