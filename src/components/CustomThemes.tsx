import React, { useState, useEffect } from 'react';
import { Palette, Sun, Moon, Monitor, Check } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
  };
}

const themes: Theme[] = [
  {
    id: 'dark',
    name: 'Giza (Default)',
    colors: {
      primary: '#6366f1',
      secondary: '#9333ea',
      background: '#0b0f19',
      surface: '#121826',
      text: '#f8fafc',
      textSecondary: '#94a3b8',
      border: 'rgba(51, 65, 85, 0.3)',
    },
  },
  {
    id: 'light',
    name: 'Mwanga',
    colors: {
      primary: '#6366f1',
      secondary: '#9333ea',
      background: '#f8fafc',
      surface: '#ffffff',
      text: '#0f172a',
      textSecondary: '#64748b',
      border: '#e2e8f0',
    },
  },
  {
    id: 'ocean',
    name: 'Bahari',
    colors: {
      primary: '#0ea5e9',
      secondary: '#06b6d4',
      background: '#0c4a6e',
      surface: '#075985',
      text: '#f0f9ff',
      textSecondary: '#bae6fd',
      border: 'rgba(14, 165, 233, 0.3)',
    },
  },
  {
    id: 'forest',
    name: 'Msitu',
    colors: {
      primary: '#10b981',
      secondary: '#059669',
      background: '#064e3b',
      surface: '#065f46',
      text: '#f0fdf4',
      textSecondary: '#a7f3d0',
      border: 'rgba(16, 185, 129, 0.3)',
    },
  },
  {
    id: 'sunset',
    name: 'Jua Kupuna',
    colors: {
      primary: '#f97316',
      secondary: '#ea580c',
      background: '#7c2d12',
      surface: '#9a3412',
      text: '#fff7ed',
      textSecondary: '#fed7aa',
      border: 'rgba(249, 115, 22, 0.3)',
    },
  },
  {
    id: 'purple',
    name: 'Zambarau',
    colors: {
      primary: '#a855f7',
      secondary: '#9333ea',
      background: '#581c87',
      surface: '#6b21a8',
      text: '#faf5ff',
      textSecondary: '#e9d5ff',
      border: 'rgba(168, 85, 247, 0.3)',
    },
  },
  {
    id: 'rose',
    name: 'Waridi',
    colors: {
      primary: '#f43f5e',
      secondary: '#e11d48',
      background: '#881337',
      surface: '#9f1239',
      text: '#fff1f2',
      textSecondary: '#fecdd3',
      border: 'rgba(244, 63, 94, 0.3)',
    },
  },
  {
    id: 'amber',
    name: 'Dhahabu',
    colors: {
      primary: '#f59e0b',
      secondary: '#d97706',
      background: '#78350f',
      surface: '#92400e',
      text: '#fffbeb',
      textSecondary: '#fde68a',
      border: 'rgba(245, 158, 11, 0.3)',
    },
  },
];

export const CustomThemes: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState<string>(theme);

  useEffect(() => {
    setSelectedTheme(theme);
  }, [theme]);

  const handleThemeChange = (themeId: string) => {
    setSelectedTheme(themeId);
    if (themeId === 'light' || themeId === 'dark' || themeId === 'system') {
      setTheme(themeId as any);
    } else {
      const customTheme = themes.find(t => t.id === themeId);
      if (customTheme) {
        setTheme('dark');
        const root = document.documentElement;
        root.style.setProperty('--theme-primary', customTheme.colors.primary);
        root.style.setProperty('--theme-secondary', customTheme.colors.secondary);
      }
    }
  };

  return (
    <div className="glass-card" style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <Palette size={24} color="var(--border-focus)" />
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0, color: 'var(--text-main)' }}>Mandhari Maalum</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
            Chagua mandhari unayopenda
          </p>
        </div>
      </div>

      {/* Quick Theme Switcher */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <button
          onClick={() => handleThemeChange('dark')}
          style={{
            flex: 1,
            padding: 16,
            borderRadius: 12,
            background: theme === 'dark' ? 'var(--btn-ghost-bg)' : 'var(--bg-subtle)',
            border: `1px solid ${theme === 'dark' ? 'var(--border-focus)' : 'var(--border-app)'}`,
            color: theme === 'dark' ? 'var(--border-focus)' : 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.2s ease',
          }}
        >
          <Moon size={24} />
          <span style={{ fontSize: 13, fontWeight: 500 }}>Giza</span>
        </button>
        <button
          onClick={() => handleThemeChange('light')}
          style={{
            flex: 1,
            padding: 16,
            borderRadius: 12,
            background: theme === 'light' ? 'var(--btn-ghost-bg)' : 'var(--bg-subtle)',
            border: `1px solid ${theme === 'light' ? 'var(--border-focus)' : 'var(--border-app)'}`,
            color: theme === 'light' ? 'var(--border-focus)' : 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.2s ease',
          }}
        >
          <Sun size={24} />
          <span style={{ fontSize: 13, fontWeight: 500 }}>Mwanga</span>
        </button>
        <button
          onClick={() => handleThemeChange('system')}
          style={{
            flex: 1,
            padding: 16,
            borderRadius: 12,
            background: theme === 'system' ? 'var(--btn-ghost-bg)' : 'var(--bg-subtle)',
            border: `1px solid ${theme === 'system' ? 'var(--border-focus)' : 'var(--border-app)'}`,
            color: theme === 'system' ? 'var(--border-focus)' : 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.2s ease',
          }}
        >
          <Monitor size={24} />
          <span style={{ fontSize: 13, fontWeight: 500 }}>System</span>
        </button>
      </div>

      {/* Theme Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => handleThemeChange(theme.id)}
            style={{
              padding: 16,
              borderRadius: 12,
              background: theme.colors.surface,
              border: `2px solid ${selectedTheme === theme.id ? theme.colors.primary : 'transparent'}`,
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (selectedTheme !== theme.id) {
                e.currentTarget.style.borderColor = theme.colors.primary + '60';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedTheme !== theme.id) {
                e.currentTarget.style.borderColor = 'transparent';
              }
            }}
          >
            {selectedTheme === theme.id && (
              <div style={{
                position: 'absolute',
                top: 8,
                right: 8,
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: theme.colors.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Check size={14} color="white" />
              </div>
            )}

            {/* Color Preview */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
              <div style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                background: theme.colors.primary,
              }} />
              <div style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                background: theme.colors.secondary,
              }} />
              <div style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                background: theme.colors.background,
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }} />
            </div>

            <p style={{
              fontSize: 13,
              fontWeight: 500,
              color: theme.colors.text,
              margin: 0,
              textAlign: 'left',
            }}>
              {theme.name}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};
