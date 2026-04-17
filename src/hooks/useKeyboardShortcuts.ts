import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * "g + key" Vim-style navigation shortcuts + "?" to open the shortcuts dialog.
 * Press 'g' then within 1.2s press one of:
 *   f → Feed (/)         e → Explore        c → Campus
 *   t → Timetable        r → Grades (Results)
 *   l → Library          n → Notifications  p → Profile
 *   s → Settings         h → Calendar
 * '?' (Shift+/) opens the shortcuts cheat sheet.
 */
export const SHORTCUTS = [
  { combo: 'g f', label: 'Feed', path: '/' },
  { combo: 'g e', label: 'Explore', path: '/explore' },
  { combo: 'g c', label: 'Campus', path: '/campus' },
  { combo: 'g h', label: 'Calendar', path: '/calendar' },
  { combo: 'g t', label: 'Timetable', path: '/timetable' },
  { combo: 'g r', label: 'Grades', path: '/grades' },
  { combo: 'g l', label: 'Library', path: '/resources' },
  { combo: 'g n', label: 'Notifications', path: '/notifications' },
  { combo: 'g p', label: 'Profile', path: '/profile' },
  { combo: 'g s', label: 'Settings', path: '/settings' },
] as const;

const keyMap: Record<string, string> = {
  f: '/', e: '/explore', c: '/campus', h: '/calendar', t: '/timetable',
  r: '/grades', l: '/resources', n: '/notifications', p: '/profile', s: '/settings',
};

const isTypingTarget = (el: EventTarget | null) => {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (el.isContentEditable) return true;
  return false;
};

export const useKeyboardShortcuts = (onOpenHelp: () => void) => {
  const navigate = useNavigate();
  const pendingG = useRef(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;

      // Help dialog: '?' (Shift+/)
      if (e.key === '?') {
        e.preventDefault();
        onOpenHelp();
        return;
      }

      const key = e.key.toLowerCase();

      if (pendingG.current) {
        const path = keyMap[key];
        pendingG.current = false;
        if (timerRef.current) {
          window.clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        if (path) {
          e.preventDefault();
          navigate(path);
        }
        return;
      }

      if (key === 'g') {
        pendingG.current = true;
        if (timerRef.current) window.clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(() => {
          pendingG.current = false;
          timerRef.current = null;
        }, 1200);
      }
    };

    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [navigate, onOpenHelp]);
};
