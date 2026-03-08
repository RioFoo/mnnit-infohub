import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeKey = 'neon-cyan' | 'crimson' | 'emerald' | 'gold' | 'arctic' | 'professional';

interface ThemeInfo {
  key: ThemeKey;
  name: string;
  className: string;
  primaryColor: string;
}

export const THEMES: ThemeInfo[] = [
  { key: 'neon-cyan', name: 'Neon Cyan', className: '', primaryColor: '#22d3ee' },
  { key: 'crimson', name: 'Crimson Blade', className: 'theme-crimson', primaryColor: '#fb7185' },
  { key: 'emerald', name: 'Emerald Matrix', className: 'theme-emerald', primaryColor: '#34d399' },
  { key: 'gold', name: 'Royal Gold', className: 'theme-gold', primaryColor: '#facc15' },
  { key: 'arctic', name: 'Arctic Aurora', className: 'theme-arctic', primaryColor: '#0284c7' },
  { key: 'professional', name: 'Professional Day', className: 'theme-professional', primaryColor: '#2563eb' },
];

interface ThemeContextType {
  theme: ThemeKey;
  setTheme: (t: ThemeKey) => void;
  themeInfo: ThemeInfo;
}

const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);
export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeKey>(() => {
    return (localStorage.getItem('infohub-theme') as ThemeKey) || 'neon-cyan';
  });

  const themeInfo = THEMES.find(t => t.key === theme) || THEMES[0];

  useEffect(() => {
    localStorage.setItem('infohub-theme', theme);
    const root = document.documentElement;
    THEMES.forEach(t => {
      if (t.className) root.classList.remove(t.className);
    });
    if (themeInfo.className) root.classList.add(themeInfo.className);
  }, [theme, themeInfo]);

  const setTheme = (t: ThemeKey) => setThemeState(t);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themeInfo }}>
      {children}
    </ThemeContext.Provider>
  );
};
