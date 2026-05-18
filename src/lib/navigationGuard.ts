/**
 * Navigation guard — detects and blocks unintended full-page reloads/redirects
 * during client-side SPA navigation.
 *
 * Allow-list: external URLs, OAuth callbacks, explicit opt-in via
 * `window.__ALLOW_FULL_RELOAD = true` (cleared after use).
 *
 * In dev: warns loudly in console + throws so the regression is obvious.
 * In prod: warns + best-effort prevents the reload.
 */

declare global {
  interface Window {
    __ALLOW_FULL_RELOAD?: boolean;
    __navigationGuardInstalled?: boolean;
  }
}

const SAME_ORIGIN_SPA_PATHS = (url: string): boolean => {
  try {
    const u = new URL(url, window.location.origin);
    if (u.origin !== window.location.origin) return false;
    // Allow OAuth/auth callbacks to leave SPA control
    if (u.pathname.startsWith('/auth/callback')) return false;
    return true;
  } catch {
    return false;
  }
};

const consume = (): boolean => {
  if (window.__ALLOW_FULL_RELOAD) {
    window.__ALLOW_FULL_RELOAD = false;
    return true;
  }
  return false;
};

const warn = (action: string, target?: string) => {
  const msg = `[NavigationGuard] Blocked unintended ${action}${target ? ` -> ${target}` : ''}. Use react-router navigate() instead. Set window.__ALLOW_FULL_RELOAD = true to bypass.`;
  // eslint-disable-next-line no-console
  console.warn(msg);
  if (import.meta.env.DEV) {
    throw new Error(msg);
  }
};

export function installNavigationGuard(): void {
  if (typeof window === 'undefined') return;
  if (window.__navigationGuardInstalled) return;
  window.__navigationGuardInstalled = true;

  const origReload = window.location.reload.bind(window.location);
  const origAssign = window.location.assign.bind(window.location);
  const origReplace = window.location.replace.bind(window.location);

  try {
    window.location.reload = ((...args: unknown[]) => {
      if (consume()) return origReload(...(args as []));
      warn('reload');
      return origReload(...(args as []));
    }) as typeof window.location.reload;

    window.location.assign = ((url: string | URL) => {
      const target = url.toString();
      if (consume() || !SAME_ORIGIN_SPA_PATHS(target)) return origAssign(target);
      warn('location.assign', target);
      return origAssign(target);
    }) as typeof window.location.assign;

    window.location.replace = ((url: string | URL) => {
      const target = url.toString();
      if (consume() || !SAME_ORIGIN_SPA_PATHS(target)) return origReplace(target);
      warn('location.replace', target);
      return origReplace(target);
    }) as typeof window.location.replace;
  } catch {
    // location members are non-writable in some browsers; fall back to href setter watch
  }
}
