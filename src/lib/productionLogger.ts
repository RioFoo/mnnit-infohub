/**
 * Production logger
 *
 * Captures runtime errors, unhandled rejections, and React render errors
 * with a correlation ID so blank-screen / crash reports can be traced
 * end-to-end on the published site.
 *
 * - Always-on (dev + prod) so behavior is identical in Lovable preview and Vercel.
 * - Stores the last 50 entries in localStorage under `__infohub_logs`.
 * - Exposes `window.__infohubLogs` and `window.__copyInfohubLogs()` helpers.
 */

export interface LogEntry {
  id: string;
  ts: string;
  level: 'error' | 'warn' | 'info';
  source: string;
  message: string;
  stack?: string;
  url: string;
  ua: string;
  release: string;
}

const STORAGE_KEY = '__infohub_logs';
const MAX_ENTRIES = 50;
const RELEASE = (import.meta.env.VITE_APP_VERSION as string) || 'dev';

const sessionId = (() => {
  try {
    const existing = sessionStorage.getItem('__infohub_session');
    if (existing) return existing;
    const id = `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    sessionStorage.setItem('__infohub_session', id);
    return id;
  } catch {
    return `s_${Math.random().toString(36).slice(2, 10)}`;
  }
})();

export const getSessionId = () => sessionId;

export const newCorrelationId = () =>
  `e_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const safeRead = (): LogEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LogEntry[]) : [];
  } catch {
    return [];
  }
};

const safeWrite = (entries: LogEntry[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(-MAX_ENTRIES)));
  } catch {
    // quota / private mode — ignore
  }
};

export const logEvent = (
  level: LogEntry['level'],
  source: string,
  message: string,
  stack?: string,
): LogEntry => {
  const entry: LogEntry = {
    id: newCorrelationId(),
    ts: new Date().toISOString(),
    level,
    source,
    message: String(message).slice(0, 2000),
    stack: stack ? String(stack).slice(0, 4000) : undefined,
    url: typeof location !== 'undefined' ? location.href : '',
    ua: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    release: RELEASE,
  };

  const entries = safeRead();
  entries.push(entry);
  safeWrite(entries);

  // Always echo to console so it's visible in prod devtools too.
  // eslint-disable-next-line no-console
  console[level === 'warn' ? 'warn' : level === 'info' ? 'info' : 'error'](
    `[infohub:${level}] ${source} id=${entry.id} session=${sessionId}`,
    message,
    stack ?? '',
  );

  return entry;
};

let installed = false;

export const installProductionLogger = () => {
  if (installed || typeof window === 'undefined') return;
  installed = true;

  window.addEventListener('error', (e: ErrorEvent) => {
    logEvent(
      'error',
      'window.onerror',
      e.message || 'Unknown error',
      e.error?.stack || `${e.filename}:${e.lineno}:${e.colno}`,
    );
  });

  window.addEventListener('unhandledrejection', (e: PromiseRejectionEvent) => {
    const reason = e.reason;
    const msg =
      reason instanceof Error
        ? reason.message
        : typeof reason === 'string'
        ? reason
        : (() => {
            try {
              return JSON.stringify(reason);
            } catch {
              return 'Unhandled promise rejection';
            }
          })();
    logEvent(
      'error',
      'unhandledrejection',
      msg,
      reason instanceof Error ? reason.stack : undefined,
    );
  });

  // Helpers for support / debugging from devtools.
  const w = window as unknown as Record<string, unknown>;
  w.__infohubLogs = () => safeRead();
  w.__infohubSession = sessionId;
  w.__infohubRelease = RELEASE;
  w.__copyInfohubLogs = async () => {
    const payload = JSON.stringify(
      { session: sessionId, release: RELEASE, entries: safeRead() },
      null,
      2,
    );
    try {
      await navigator.clipboard.writeText(payload);
      // eslint-disable-next-line no-console
      console.info('[infohub] logs copied to clipboard');
    } catch {
      // eslint-disable-next-line no-console
      console.info('[infohub] copy failed — payload below');
      // eslint-disable-next-line no-console
      console.log(payload);
    }
    return payload;
  };

  logEvent('info', 'boot', `App booted (release=${RELEASE})`);
};

export const readLogs = safeRead;
