import React, { useState, useEffect } from 'react';
import { Palette, Sun, Moon, Monitor, Check } from 'lucide-react';

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
      background: '#0f0f23',
      surface: '#1a1a2e',
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
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#0f172a',
      textSecondary: '#64748b',
      border: 'rgba(226, 232, 240, 1)',
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
  const [selectedTheme, setSelectedTheme] = useState<string>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('selected_theme');
    if (saved) {
      setSelectedTheme(saved);
      applyTheme(saved);
    }
  }, []);

  const applyTheme = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (!theme) return;

    // Apply CSS variables
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', theme.colors.primary);
    root.style.setProperty('--theme-secondary', theme.colors.secondary);
    root.style.setProperty('--theme-background', theme.colors.background);
    root.style.setProperty('--theme-surface', theme.colors.surface);
    root.style.setProperty('--theme-text', theme.colors.text);
    root.style.setProperty('--theme-text-secondary', theme.colors.textSecondary);
    root.style.setProperty('--theme-border', theme.colors.border);

    // Apply to body
    document.body.style.background = theme.colors.background;
    document.body.style.color = theme.colors.text;
  };

  const handleThemeChange = (themeId: string) => {
    setSelectedTheme(themeId);
    localStorage.setItem('selected_theme', themeId);
    applyTheme(themeId);
  };

  return (
    <div className="glass-card" style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <Palette size={24} color="#a5b4fc" />
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Mandhari Maalum</h3>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
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
            background: selectedTheme === 'dark' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(30, 41, 59, 0.3)',
            border: `1px solid ${selectedTheme === 'dark' ? 'rgba(99, 102, 241, 0.5)' : 'rgba(51, 65, 85, 0.3)'}`,
            color: selectedTheme === 'dark' ? '#a5b4fc' : '#94a3b8',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Moon size={24} />
          <span style={{ fontSize: 13 }}>Giza</span>
        </button>
        <button
          onClick={() => handleThemeChange('light')}
          style={{
            flex: 1,
            padding: 16,
            borderRadius: 12,
            background: selectedTheme === 'light' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(30, 41, 59, 0.3)',
            border: `1px solid ${selectedTheme === 'light' ? 'rgba(99, 102, 241, 0.5)' : 'rgba(51, 65, 85, 0.3)'}`,
            color: selectedTheme === 'light' ? '#a5b4fc' : '#94a3b8',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Sun size={24} />
          <span style={{ fontSize: 13 }}>Mwanga</span>
        </button>
        <button
          onClick={() => handleThemeChange('dark')}
          style={{
            flex: 1,
            padding: 16,
            borderRadius: 12,
            background: selectedTheme === 'system' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(30, 41, 59, 0.3)',
            border: `1px solid ${selectedTheme === 'system' ? 'rgba(99, 102, 241, 0.5)' : 'rgba(51, 65, 85, 0.3)'}`,
            color: selectedTheme === 'system' ? '#a5b4fc' : '#94a3b8',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Monitor size={24} />
          <span style={{ fontSize: 13 }}>System</span>
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
