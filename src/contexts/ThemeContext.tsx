import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        return saved as Theme;
      }
    } catch (e) {}
    return 'light'; // Default to light or saved theme
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  const applyThemeToDOM = (resolved: 'light' | 'dark') => {
    setResolvedTheme(resolved);
    const root = document.documentElement;
    const body = document.body;

    root.setAttribute('data-theme', resolved);
    if (body) {
      body.setAttribute('data-theme', resolved);
    }
    root.style.colorScheme = resolved;
    
    // Also remove any hardcoded direct background styles on body
    if (body) {
      body.style.removeProperty('background');
      body.style.removeProperty('color');
      body.style.removeProperty('background-color');
    }
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const resolveAndApply = (current: Theme) => {
      let resolved: 'light' | 'dark' = 'light';
      if (current === 'system') {
        resolved = mediaQuery.matches ? 'dark' : 'light';
      } else {
        resolved = current;
      }
      applyThemeToDOM(resolved);
    };

    resolveAndApply(theme);
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {}

    const handleSystemChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        applyThemeToDOM(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
