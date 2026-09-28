import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    // If currently dark or system dark, switch to light; otherwise switch to dark
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setTheme(isDark ? 'light' : 'dark');
  };

  const isCurrentDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <button
      onClick={toggleTheme}
      className="btn-ghost"
      style={{
        width: 38,
        height: 38,
        padding: 0,
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-subtle)',
        border: '1px solid var(--border-app)',
        color: 'var(--text-main)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        flexShrink: 0
      }}
      title={isCurrentDark ? 'Washa Muundo wa Mwanga (Light Mode)' : 'Washa Muundo wa Giza (Dark Mode)'}
      type="button"
      aria-label="Toggle theme"
    >
      {isCurrentDark ? (
        <Sun size={18} style={{ color: '#f59e0b', transition: 'transform 0.3s ease' }} />
      ) : (
        <Moon size={18} style={{ color: '#6366f1', transition: 'transform 0.3s ease' }} />
      )}
    </button>
  );
};
