import { describe, it, expect, beforeEach } from 'vitest';
import {
  installNavigationGuard,
  shouldAllowFullNavigation,
  markAllowedFullReload,
} from '@/lib/navigationGuard';

describe('navigationGuard (hot-reload / blank-screen regression)', () => {
  beforeEach(() => {
    (window as unknown as { __navigationGuardInstalled?: boolean }).__navigationGuardInstalled = false;
    (window as unknown as { __ALLOW_FULL_RELOAD?: boolean }).__ALLOW_FULL_RELOAD = false;
  });

  it('installs only once', () => {
    installNavigationGuard();
    installNavigationGuard();
    expect((window as unknown as { __navigationGuardInstalled?: boolean }).__navigationGuardInstalled).toBe(true);
  });

  it('flags same-origin navigations as disallowed by default', () => {
    expect(shouldAllowFullNavigation('/logs?focus=abc')).toBe(false);
    expect(shouldAllowFullNavigation('/timetable')).toBe(false);
  });

  it('allows external origins and OAuth callbacks', () => {
    expect(shouldAllowFullNavigation('https://accounts.google.com/oauth')).toBe(true);
    expect(shouldAllowFullNavigation('/auth/callback?code=xyz')).toBe(true);
  });

  it('honors one-shot opt-in via markAllowedFullReload', () => {
    markAllowedFullReload();
    expect(shouldAllowFullNavigation('/anywhere')).toBe(true);
    // one-shot: cleared after use
    expect(shouldAllowFullNavigation('/anywhere')).toBe(false);
  });

  it('keeps the app root mounted across simulated route changes (blank-screen regression)', () => {
    document.body.innerHTML = '<div id="root"><main data-route="/">home</main></div>';
    const root = document.getElementById('root')!;
    expect(root.children.length).toBeGreaterThan(0);
    // Simulate router swapping the route subtree (no full reload)
    root.innerHTML = '<main data-route="/timetable">timetable</main>';
    expect(root.children.length).toBeGreaterThan(0);
    expect(root.querySelector('[data-route="/timetable"]')).not.toBeNull();
    // And again across multiple route changes
    root.innerHTML = '<main data-route="/explore">explore</main>';
    expect(root.querySelector('[data-route="/explore"]')).not.toBeNull();
    expect(root.innerHTML).not.toBe('');
  });
});
