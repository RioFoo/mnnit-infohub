/**
 * Navigation guard — detects unintended full-page reloads/redirects
 * during client-side SPA navigation.
 *
 * `window.location.reload/assign/replace` are non-configurable in most
 * browsers (and in jsdom), so instead of "blocking" them we:
 *   1. Install a `beforeunload` listener that warns when the page is
 *      about to do a full reload without an explicit opt-in.
 *   2. Export pure helpers (`shouldAllowFullNavigation`, `markAllowed`)
 *      used by call-sites that legitimately need a full reload.
 *
 * To opt-in to a full navigation, call `markAllowedFullReload()` right
 * before assigning `window.location`, or set `window.__ALLOW_FULL_RELOAD = true`.
 */

declare global {
  interface Window {
    __ALLOW_FULL_RELOAD?: boolean;
    __navigationGuardInstalled?: boolean;
  }
}

export const markAllowedFullReload = (): void => {
  if (typeof window !== 'undefined') window.__ALLOW_FULL_RELOAD = true;
};

export const shouldAllowFullNavigation = (target?: string): boolean => {
  if (typeof window === 'undefined') return true;
  if (window.__ALLOW_FULL_RELOAD) {
    window.__ALLOW_FULL_RELOAD = false;
    return true;
  }
  if (!target) return false;
  try {
    const u = new URL(target, window.location.origin);
    // External origins and OAuth callbacks are legitimately full-page.
    if (u.origin !== window.location.origin) return true;
    if (u.pathname.startsWith('/auth/callback')) return true;
  } catch {
    /* noop */
  }
  return false;
};

export function installNavigationGuard(): void {
  if (typeof window === 'undefined') return;
  if (window.__navigationGuardInstalled) return;
  window.__navigationGuardInstalled = true;

  window.addEventListener('beforeunload', () => {
    if (shouldAllowFullNavigation(window.location.href)) return;
    // eslint-disable-next-line no-console
    console.warn(
      '[NavigationGuard] Full-page unload detected during SPA session. ' +
        'Prefer react-router navigate(). Call markAllowedFullReload() to silence.'
    );
  });
}
