import { useEffect, useState } from 'react';
import { Copy, Trash2, RefreshCw, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { readLogs, getSessionId, type LogEntry } from '@/lib/productionLogger';

const STORAGE_KEY = '__infohub_logs';

const levelIcon = (level: LogEntry['level']) => {
  if (level === 'error') return <AlertCircle className="w-4 h-4 text-destructive" />;
  if (level === 'warn') return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
  return <Info className="w-4 h-4 text-primary" />;
};

const LogViewer = () => {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const session = getSessionId();

  const refresh = () => setEntries(readLogs().slice().reverse());

  useEffect(() => {
    refresh();
    const id = window.setInterval(refresh, 2000);
    return () => window.clearInterval(id);
  }, []);

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
    const payload = `id=${e.id}\nsession=${session}\nts=${e.ts}\nlevel=${e.level}\nsource=${e.source}\nurl=${e.url}\nmessage=${e.message}\nstack=${e.stack || ''}`;
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

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold">Log Viewer</h1>
          <p className="text-xs text-muted-foreground font-mono mt-1">
            session={session} · {entries.length}/50 entries
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

      {entries.length === 0 ? (
        <div className="p-8 rounded-2xl border border-border bg-muted/20 text-center text-sm text-muted-foreground">
          No events captured yet. Errors, warnings, and unhandled rejections will appear here.
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((e) => (
            <div
              key={e.id}
              className="p-3 rounded-xl border border-border bg-card/60 backdrop-blur-sm"
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
                    </div>
                    <div className="mt-1 text-sm break-words">{e.message}</div>
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
