import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import { installProductionLogger } from "./lib/productionLogger";
import { installNavigationGuard } from "./lib/navigationGuard";

console.log('InfoHub v2 loaded');

installProductionLogger();
installNavigationGuard();

const renderFatalError = (title: string, detailText: string) => {
  document.body.style.cssText = 'background:#0a0a0a;color:#ff4444;font-family:monospace;padding:40px';
  // Build DOM safely using textContent — never interpolate untrusted strings into innerHTML
  document.body.replaceChildren();
  const h2 = document.createElement('h2');
  h2.style.color = '#ff4444';
  h2.textContent = title;
  const pre = document.createElement('pre');
  pre.style.cssText = 'color:#ff6666;font-size:13px;white-space:pre-wrap';
  pre.textContent = detailText;
  const btn = document.createElement('button');
  btn.style.cssText = 'margin-top:20px;padding:10px 20px;background:#1a1a1a;color:#00ff88;border:1px solid #00ff88;border-radius:8px;cursor:pointer;font-family:monospace';
  btn.textContent = '↻ Reload';
  btn.addEventListener('click', () => location.reload());
  document.body.append(h2, pre, btn);
};

window.onerror = (msg, src, line, col, err) => {
  renderFatalError('⚠ App Error', `${msg}\n${src}:${line}:${col}\n${err?.stack || ''}`);
};
window.addEventListener('unhandledrejection', (e) => {
  renderFatalError('⚠ Unhandled Promise Error', `${e.reason?.message || e.reason}\n${e.reason?.stack || ''}`);
});

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
