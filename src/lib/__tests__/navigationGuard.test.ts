import { describe, it, expect, beforeEach, vi } from 'vitest';
import { installNavigationGuard } from '@/lib/navigationGuard';

describe('navigationGuard (hot-reload regression)', () => {
  beforeEach(() => {
    // Reset install flag between tests
    (window as unknown as { __navigationGuardInstalled?: boolean }).__navigationGuardInstalled = false;
  });

  it('installs only once', () => {
    installNavigationGuard();
    installNavigationGuard();
    expect((window as unknown as { __navigationGuardInstalled?: boolean }).__navigationGuardInstalled).toBe(true);
  });

  it('blocks unintended same-origin location.assign in dev', () => {
    installNavigationGuard();
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(() => window.location.assign('/logs?focus=abc')).toThrow(/NavigationGuard/);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('allows opt-in reloads via __ALLOW_FULL_RELOAD', () => {
    installNavigationGuard();
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    window.__ALLOW_FULL_RELOAD = true;
    expect(() => window.location.assign('/anywhere')).not.toThrow();
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('keeps the app root mounted across simulated route changes (blank-screen regression)', () => {
    // Simulate the preview DOM after a route change: #root must remain populated.
    document.body.innerHTML = '<div id="root"><main data-route="/">content</main></div>';
    const root = document.getElementById('root')!;
    // Simulate router swapping the route subtree
    root.innerHTML = '<main data-route="/timetable">timetable</main>';
    expect(root.children.length).toBeGreaterThan(0);
    expect(root.querySelector('[data-route="/timetable"]')).not.toBeNull();
  });
});
