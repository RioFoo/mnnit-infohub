import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Copy, Trash2, RefreshCw, AlertTriangle, Info, AlertCircle, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { readLogs, getSessionId, type LogEntry } from '@/lib/productionLogger';

const STORAGE_KEY = '__infohub_logs';

type LevelFilter = 'all' | LogEntry['level'];
type TimeFilter = 'all' | '5m' | '15m' | '1h' | '24h';

const TIME_WINDOWS: Record<TimeFilter, number> = {
  all: Infinity,
  '5m': 5 * 60_000,
  '15m': 15 * 60_000,
  '1h': 60 * 60_000,
  '24h': 24 * 60 * 60_000,
};

const levelIcon = (level: LogEntry['level']) => {
  if (level === 'error') return <AlertCircle className="w-4 h-4 text-destructive" />;
  if (level === 'warn') return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
  return <Info className="w-4 h-4 text-primary" />;
};

const LogViewer = () => {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const focusId = searchParams.get('focus');
  const session = getSessionId();

  const [query, setQuery] = useState('');
  const [level, setLevel] = useState<LevelFilter>('all');
  const [source, setSource] = useState<string>('all');
  const [route, setRoute] = useState<string>('all');
  const [time, setTime] = useState<TimeFilter>('all');

  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const refresh = () => setEntries(readLogs().slice().reverse());

  useEffect(() => {
    refresh();
    const id = window.setInterval(refresh, 2000);
    return () => window.clearInterval(id);
  }, []);

  const sources = useMemo(
    () => Array.from(new Set(entries.map((e) => e.source))).sort(),
    [entries],
  );
  const routes = useMemo(
    () => Array.from(new Set(entries.map((e) => e.route || '').filter(Boolean))).sort(),
    [entries],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const now = Date.now();
    const windowMs = TIME_WINDOWS[time];
    return entries.filter((e) => {
      if (level !== 'all' && e.level !== level) return false;
      if (source !== 'all' && e.source !== source) return false;
      if (route !== 'all' && (e.route || '') !== route) return false;
      if (windowMs !== Infinity && now - new Date(e.ts).getTime() > windowMs) return false;
      if (q) {
        const hay = `${e.id} ${e.message} ${e.stack || ''} ${e.url} ${e.route || ''} ${e.source}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [entries, query, level, source, route, time]);

  // Scroll to focused entry once it's in the list.
  useEffect(() => {
    if (!focusId) return;
    const el = itemRefs.current[focusId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-destructive');
      const t = window.setTimeout(() => {
        el.classList.remove('ring-2', 'ring-destructive');
      }, 3000);
      return () => window.clearTimeout(t);
    }
  }, [focusId, filtered]);

  const copyAll = async () => {
    const payload = JSON.stringify({ session, entries: readLogs() }, null, 2);
    try {
      await navigator.clipboard.writeText(payload);
      toast.success('Logs copied to clipboard');
    } catch {
      toast.error('Copy failed');
    }
  };

  const copyOne = async (e: LogEntry) => {
    const payload = `id=${e.id}\nsession=${session}\nts=${e.ts}\nlevel=${e.level}\nsource=${e.source}\nroute=${e.route || ''}\nurl=${e.url}\nmessage=${e.message}\nstack=${e.stack || ''}`;
    try {
      await navigator.clipboard.writeText(payload);
      toast.success(`Copied ${e.id}`);
    } catch {
      toast.error('Copy failed');
    }
  };

  const clearAll = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    refresh();
    toast.success('Logs cleared');
  };

  const resetFilters = () => {
    setQuery('');
    setLevel('all');
    setSource('all');
    setRoute('all');
    setTime('all');
    if (focusId) {
      const next = new URLSearchParams(searchParams);
      next.delete('focus');
      setSearchParams(next, { replace: true });
    }
  };

  const hasActiveFilters =
    query !== '' || level !== 'all' || source !== 'all' || route !== 'all' || time !== 'all';

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold">Log Viewer</h1>
          <p className="text-xs text-muted-foreground font-mono mt-1">
            session={session} · {filtered.length}/{entries.length} shown (max 50)
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refresh}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-border text-sm hover:bg-muted transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button
            onClick={copyAll}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
          >
            <Copy className="w-4 h-4" /> Copy all
          </button>
          <button
            onClick={clearAll}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-destructive/40 text-destructive text-sm hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Clear
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-3 rounded-2xl border border-border bg-card/40 backdrop-blur-sm space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search id, message, stack, url, source…"
            className="w-full pl-9 pr-9 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-muted"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as LevelFilter)}
            className="px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All levels</option>
            <option value="error">Error</option>
            <option value="warn">Warn</option>
            <option value="info">Info</option>
          </select>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All sources</option>
            {sources.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={route}
            onChange={(e) => setRoute(e.target.value)}
            className="px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All routes</option>
            {routes.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <select
            value={time}
            onChange={(e) => setTime(e.target.value as TimeFilter)}
            className="px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All time</option>
            <option value="5m">Last 5 min</option>
            <option value="15m">Last 15 min</option>
            <option value="1h">Last hour</option>
            <option value="24h">Last 24 hours</option>
          </select>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            {focusId && (
              <span className="font-mono">
                Focused: <span className="text-foreground">{focusId}</span>
              </span>
            )}
            <button
              onClick={resetFilters}
              className="ml-auto inline-flex items-center gap-1 px-2 py-1 rounded-md hover:bg-muted text-foreground"
            >
              <X className="w-3 h-3" /> Reset filters
            </button>
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="p-8 rounded-2xl border border-border bg-muted/20 text-center text-sm text-muted-foreground">
          {entries.length === 0
            ? 'No events captured yet. Errors, warnings, and unhandled rejections will appear here.'
            : 'No entries match the current filters.'}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((e) => (
            <div
              key={e.id}
              ref={(el) => {
                itemRefs.current[e.id] = el;
              }}
              className="p-3 rounded-xl border border-border bg-card/60 backdrop-blur-sm transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2 min-w-0 flex-1">
                  {levelIcon(e.level)}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                      <span className="font-mono">{e.id}</span>
                      <span>·</span>
                      <span>{new Date(e.ts).toLocaleTimeString()}</span>
                      <span>·</span>
                      <span className="text-foreground/80">{e.source}</span>
                      {e.route && (
                        <>
                          <span>·</span>
                          <span className="font-mono normal-case text-foreground/80">{e.route}</span>
                        </>
                      )}
                    </div>
                    <div className="mt-1 text-sm break-words">{e.message}</div>
                    {e.url && (
                      <div className="mt-1 text-[11px] font-mono text-muted-foreground break-all">
                        {e.url}
                      </div>
                    )}
                    {e.stack && (
                      <pre className="mt-2 p-2 rounded-md bg-muted/40 text-[11px] font-mono overflow-x-auto whitespace-pre-wrap break-words max-h-40">
                        {e.stack}
                      </pre>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => copyOne(e)}
                  className="shrink-0 p-2 rounded-lg border border-border hover:bg-muted transition-colors"
                  aria-label="Copy entry"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LogViewer;
