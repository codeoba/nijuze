import React, { useState } from 'react';
import {
  X, User, Bell, Lock, Palette, Globe, Download, Upload,
  Trash2, Shield, Eye, Moon, Sun, Monitor, Keyboard
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useTheme } from '../contexts/ThemeContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useApp();
  const { theme, setTheme } = useTheme();
  const [activeSection, setActiveSection] = useState('account');
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    mentionNotifications: true,
    followNotifications: true,
    theme: theme,
    language: 'sw' as 'sw' | 'en' | 'fr',
    twoFactorAuth: false,
    showOnlineStatus: true,
    allowMessages: true,
  });

  const [aiDisabled, setAiDisabled] = useState(() => {
    try {
      return localStorage.getItem('nijuze_ai_disabled') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleAi = (disabled: boolean) => {
    setAiDisabled(disabled);
    try {
      localStorage.setItem('nijuze_ai_disabled', String(disabled));
    } catch {}
    window.dispatchEvent(new Event('nijuze_toggle_ai'));
  };

  if (!isOpen) return null;

  const handleExportData = () => {
    const data = {
      user: currentUser,
      posts: JSON.parse(localStorage.getItem('posts') || '[]'),
      comments: JSON.parse(localStorage.getItem('comments') || '{}'),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nijuze-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            // Import data
            if (data.posts) localStorage.setItem('posts', JSON.stringify(data.posts));
            if (data.comments) localStorage.setItem('comments', JSON.stringify(data.comments));
            alert('Data imported successfully!');
            window.location.reload();
          } catch (err) {
            alert('Failed to import data');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleClearData = () => {
    if (confirm('Are you sure? This will delete all your local data.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const sections = [
    { id: 'account', label: 'Akaunti', icon: User },
    { id: 'notifications', label: 'Arifa', icon: Bell },
    { id: 'privacy', label: 'Faragha', icon: Lock },
    { id: 'appearance', label: 'Muonekano', icon: Palette },
    { id: 'language', label: 'Lugha', icon: Globe },
    { id: 'data', label: 'Data', icon: Download },
    { id: 'security', label: 'Usalama', icon: Shield },
    { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: 900,
          height: '80vh',
          margin: '0 16px',
          display: 'flex',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sidebar */}
        <div style={{
          width: 250,
          borderRight: '1px solid var(--border-app)',
          background: 'var(--bg-subtle)',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-main)' }}>Mipangilio</h2>
            <button
              onClick={onClose}
              style={{ padding: 8, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={20} />
            </button>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  borderRadius: 10,
                  background: activeSection === section.id ? 'var(--btn-ghost-bg)' : 'transparent',
                  border: `1px solid ${activeSection === section.id ? 'var(--btn-ghost-border)' : 'transparent'}`,
                  color: activeSection === section.id ? 'var(--btn-ghost-text)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 500,
                  textAlign: 'left',
                }}
              >
                <section.icon size={18} />
                {section.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
          {activeSection === 'account' && (
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, color: 'var(--text-main)' }}>Mipangilio ya Akaunti</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-main)', marginBottom: 8, display: 'block' }}>
                    Jina
                  </label>
                  <input
                    type="text"
                    defaultValue={currentUser?.username}
                    style={{
                      width: '100%',
                      padding: 12,
                      borderRadius: 12,
                      background: 'var(--input-bg)',
                      border: '1px solid var(--input-border)',
                      color: 'var(--input-text)',
                      fontSize: 14,
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-main)', marginBottom: 8, display: 'block' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    defaultValue={currentUser?.email}
                    style={{
                      width: '100%',
                      padding: 12,
                      borderRadius: 12,
                      background: 'var(--input-bg)',
                      border: '1px solid var(--input-border)',
                      color: 'var(--input-text)',
                      fontSize: 14,
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-main)', marginBottom: 8, display: 'block' }}>
                    Bio
                  </label>
                  <textarea
                    defaultValue={currentUser?.bio}
                    style={{
                      width: '100%',
                      padding: 12,
                      borderRadius: 12,
                      background: 'var(--input-bg)',
                      border: '1px solid var(--input-border)',
                      color: 'var(--input-text)',
                      fontSize: 14,
                      resize: 'vertical',
                      minHeight: 100,
                    }}
                  />
                </div>

                <button className="btn-primary" style={{ alignSelf: 'flex-start' }}>
                  Hifadhi Mabadiliko
                </button>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Mipangilio ya Arifa</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { key: 'emailNotifications', label: 'Arifa za Email', description: 'Pata arifa kupitia email' },
                  { key: 'pushNotifications', label: 'Push Notifications', description: 'Pata arifa kwenye browser' },
                  { key: 'mentionNotifications', label: 'Mentions', description: 'Arifa za kutajwa' },
                  { key: 'followNotifications', label: 'New Followers', description: 'Arifa za wafuasi wapya' },
                ].map((item) => (
                  <div
                    key={item.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 16,
                      borderRadius: 12,
                      background: 'rgba(30, 41, 59, 0.3)',
                      border: '1px solid rgba(51, 65, 85, 0.3)',
                    }}
                  >
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{item.label}</p>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{item.description}</p>
                    </div>
                    <label style={{ position: 'relative', display: 'inline-block', width: 48, height: 24 }}>
                      <input
                        type="checkbox"
                        checked={settings[item.key as keyof typeof settings] as boolean}
                        onChange={(e) => setSettings({ ...settings, [item.key]: e.target.checked })}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span style={{
                        position: 'absolute',
                        cursor: 'pointer',
                        inset: 0,
                        background: settings[item.key as keyof typeof settings] ? '#6366f1' : 'rgba(51, 65, 85, 0.5)',
                        borderRadius: 24,
                        transition: '0.3s',
                      }}>
                        <span style={{
                          position: 'absolute',
                          height: 18,
                          width: 18,
                          left: settings[item.key as keyof typeof settings] ? 26 : 3,
                          bottom: 3,
                          background: 'white',
                          borderRadius: '50%',
                          transition: '0.3s',
                        }} />
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'appearance' && (
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, color: 'var(--text-main)' }}>Muonekano</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-main)', marginBottom: 12, display: 'block' }}>
                    Theme
                  </label>
                  <div style={{ display: 'flex', gap: 12 }}>
                    {[
                      { value: 'light', icon: Sun, label: 'Mwanga' },
                      { value: 'dark', icon: Moon, label: 'Giza' },
                      { value: 'system', icon: Monitor, label: 'System' },
                    ].map((t) => (
                      <button
                        key={t.value}
                        onClick={() => {
                          setSettings({ ...settings, theme: t.value as any });
                          setTheme(t.value as any);
                        }}
                        style={{
                          flex: 1,
                          padding: 16,
                          borderRadius: 12,
                          background: theme === t.value ? 'var(--btn-ghost-bg)' : 'var(--bg-subtle)',
                          border: `1px solid ${theme === t.value ? 'var(--border-focus)' : 'var(--border-app)'}`,
                          color: theme === t.value ? 'var(--border-focus)' : 'var(--text-muted)',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 8,
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <t.icon size={24} />
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 16,
                    borderRadius: 12,
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-app)',
                    marginTop: 8,
                  }}
                >
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: 'var(--text-main)' }}>
                      Msaidizi wa AI (AI Chatbot)
                    </p>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      Onyesha au zima kijisehemu cha Nijuze AI kinachoelea kulia chini
                    </p>
                  </div>
                  <label style={{ position: 'relative', display: 'inline-block', width: 48, height: 24, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={!aiDisabled}
                      onChange={(e) => handleToggleAi(!e.target.checked)}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      position: 'absolute',
                      inset: 0,
                      background: !aiDisabled ? '#6366f1' : 'rgba(100, 116, 139, 0.4)',
                      borderRadius: 24,
                      transition: '0.3s',
                    }}>
                      <span style={{
                        position: 'absolute',
                        height: 18,
                        width: 18,
                        left: !aiDisabled ? 26 : 3,
                        bottom: 3,
                        background: 'white',
                        borderRadius: '50%',
                        transition: '0.3s',
                      }} />
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'data' && (
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Data yako</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <button
                  onClick={handleExportData}
                  className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}
                >
                  <Download size={16} />
                  Export Data
                </button>

                <button
                  onClick={handleImportData}
                  className="btn-ghost"
                  style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}
                >
                  <Upload size={16} />
                  Import Data
                </button>

                <button
                  onClick={handleClearData}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    justifyContent: 'center',
                    padding: 12,
                    borderRadius: 12,
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#ef4444',
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  <Trash2 size={16} />
                  Futa Data Yote
                </button>
              </div>
            </div>
          )}

          {activeSection === 'shortcuts' && (
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Keyboard Shortcuts</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { keys: ['Ctrl', 'K'], action: 'Tafuta' },
                  { keys: ['Ctrl', 'N'], action: 'Post mpya' },
                  { keys: ['Ctrl', 'B'], action: 'Bookmarks' },
                  { keys: ['Ctrl', 'M'], action: 'Messages' },
                  { keys: ['Esc'], action: 'Funga modal' },
                  { keys: ['?'], action: 'Show shortcuts' },
                ].map((shortcut, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 12,
                      borderRadius: 8,
                      background: 'rgba(30, 41, 59, 0.3)',
                    }}
                  >
                    <span style={{ fontSize: 14, color: 'var(--text-body)' }}>{shortcut.action}</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {shortcut.keys.map((key, j) => (
                        <kbd
                          key={j}
                          style={{
                            padding: '4px 8px',
                            borderRadius: 6,
                            background: 'rgba(51, 65, 85, 0.5)',
                            border: '1px solid rgba(71, 85, 105, 0.5)',
                            fontSize: 12,
                            fontFamily: 'monospace',
                            color: 'var(--text-main)',
                          }}
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
