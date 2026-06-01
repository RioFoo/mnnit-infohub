import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import { installProductionLogger } from "./lib/productionLogger";
import { installNavigationGuard } from "./lib/navigationGuard";

console.log('InfoHub v2 loaded');

installProductionLogger();
installNavigationGuard();

window.onerror = (msg, src, line, col, err) => {
  document.body.style.cssText = 'background:#0a0a0a;color:#ff4444;font-family:monospace;padding:40px';
  document.body.innerHTML = `<h2 style="color:#ff4444">⚠ App Error</h2><pre style="color:#ff6666;font-size:13px;white-space:pre-wrap">${msg}\n${src}:${line}:${col}\n${err?.stack || ''}</pre><button onclick="location.reload()" style="margin-top:20px;padding:10px 20px;background:#1a1a1a;color:#00ff88;border:1px solid #00ff88;border-radius:8px;cursor:pointer;font-family:monospace">↻ Reload</button>`;
};
window.addEventListener('unhandledrejection', (e) => {
  document.body.style.cssText = 'background:#0a0a0a;color:#ff4444;font-family:monospace;padding:40px';
  document.body.innerHTML = `<h2 style="color:#ff4444">⚠ Unhandled Promise Error</h2><pre style="color:#ff6666;font-size:13px;white-space:pre-wrap">${e.reason?.message || e.reason}\n${e.reason?.stack || ''}</pre><button onclick="location.reload()" style="margin-top:20px;padding:10px 20px;background:#1a1a1a;color:#00ff88;border:1px solid #00ff88;border-radius:8px;cursor:pointer;font-family:monospace">↻ Reload</button>`;
});

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
