import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AcademicNotice {
  id: string;
  title: string;
  date: string;
  link: string | null;
  body: string;
}

const SEEN_KEY = 'infohub:academics-notices:seen';
const POLL_MS = 3 * 60 * 1000; // 3 minutes

function loadSeen(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch { return new Set(); }
}
function saveSeen(seen: Set<string>) {
  try {
    // Keep only last 200 to avoid unbounded growth
    const arr = Array.from(seen).slice(-200);
    localStorage.setItem(SEEN_KEY, JSON.stringify(arr));
  } catch {}
}

async function pushBrowserNotification(n: AcademicNotice) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  try {
    const notif = new Notification('MNNIT Academics Notice', {
      body: `${n.title} — ${n.date}`,
      icon: '/infohub-logo-192.webp',
      badge: '/infohub-logo-64.webp',
      tag: `academics-${n.id}`,
    });
    notif.onclick = () => {
      window.focus();
      if (n.link) window.open(n.link, '_blank', 'noopener');
    };
  } catch {}
}

export function useAcademicsNotices() {
  const [notices, setNotices] = useState<AcademicNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const seenRef = useRef<Set<string>>(loadSeen());
  const firstLoadRef = useRef(true);

  const fetchOnce = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('academics-notices', { method: 'GET' });
      if (error) throw error;
      const list: AcademicNotice[] = (data as any)?.notices ?? [];
      setNotices(list);
      setFetchedAt((data as any)?.fetchedAt ?? new Date().toISOString());
      setError(null);

      // Detect new ones vs. seen set
      const fresh = new Set<string>();
      for (const n of list) if (!seenRef.current.has(n.id)) fresh.add(n.id);

      if (firstLoadRef.current) {
        // First ever load: seed seen but don't spam notifications
        for (const n of list) seenRef.current.add(n.id);
        saveSeen(seenRef.current);
        firstLoadRef.current = false;
      } else if (fresh.size > 0) {
        setNewIds(prev => new Set([...prev, ...fresh]));
        // Fire browser notifications for new items (cap 3 to avoid burst)
        const freshItems = list.filter(n => fresh.has(n.id)).slice(0, 3);
        for (const n of freshItems) pushBrowserNotification(n);
        for (const id of fresh) seenRef.current.add(id);
        saveSeen(seenRef.current);
      }
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load notices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOnce();
    const t = setInterval(fetchOnce, POLL_MS);
    const onVis = () => { if (document.visibilityState === 'visible') fetchOnce(); };
    document.addEventListener('visibilitychange', onVis);
    return () => { clearInterval(t); document.removeEventListener('visibilitychange', onVis); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markSeen = (id: string) => {
    setNewIds(prev => { const n = new Set(prev); n.delete(id); return n; });
  };

  return { notices, loading, error, fetchedAt, newIds, refresh: fetchOnce, markSeen };
}

export async function requestNoticePermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'denied';
  if (Notification.permission === 'granted' || Notification.permission === 'denied') return Notification.permission;
  try { return await Notification.requestPermission(); } catch { return 'denied'; }
}
