import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { 
  User, Mail, Lock, Bell, Shield, Palette, Globe, 
  Download, Upload, Trash2, Eye, EyeOff, Check, X,
  Smartphone, Key, AlertTriangle
} from 'lucide-react';

export const AccountSettingsPage: React.FC = () => {
  const { currentUser } = useApp();
  const [activeSection, setActiveSection] = useState('profile');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  
  const [profileData, setProfileData] = useState({
    username: currentUser?.username || '',
    email: currentUser?.email || '',
    bio: currentUser?.bio || '',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    mentionNotifications: true,
    followNotifications: true,
    commentNotifications: true,
    upvoteNotifications: false,
  });

  const [privacySettings, setPrivacySettings] = useState({
    showOnlineStatus: true,
    allowMessages: true,
    showEmail: false,
    showActivity: true,
  });

  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'dark' as 'light' | 'dark' | 'system',
    language: 'sw' as 'sw' | 'en' | 'fr',
    fontSize: 'medium' as 'small' | 'medium' | 'large',
  });

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'account', label: 'Akaunti', icon: Mail },
    { id: 'security', label: 'Usalama', icon: Shield },
    { id: 'notifications', label: 'Arifa', icon: Bell },
    { id: 'privacy', label: 'Faragha', icon: Eye },
    { id: 'appearance', label: 'Muonekano', icon: Palette },
    { id: 'language', label: 'Lugha', icon: Globe },
    { id: 'data', label: 'Data', icon: Download },
  ];

  const handleSaveProfile = () => {
    // TODO: Save to backend
    alert('Profile imehifadhiwa!');
  };

  const handleChangePassword = () => {
    setShowPasswordModal(true);
  };

  const handleSetup2FA = () => {
    setShow2FAModal(true);
  };

  const handleExportData = () => {
    const data = {
      user: currentUser,
      posts: JSON.parse(localStorage.getItem('nijuze_db_posts') || '[]'),
      comments: JSON.parse(localStorage.getItem('nijuze_db_comments') || '[]'),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nijuze-data-${Date.now()}.json`;
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
            if (data.posts) localStorage.setItem('nijuze_db_posts', JSON.stringify(data.posts));
            if (data.comments) localStorage.setItem('nijuze_db_comments', JSON.stringify(data.comments));
            alert('Data imeingizwa kwa mafanikio!');
            window.location.reload();
          } catch (err) {
            alert('Hitilafu katika kuingiza data');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleDeleteAccount = () => {
    if (confirm('Una uhakika unataka kufuta akaunti yako? Hatua hii haiwezi kurudishwa!')) {
      if (confirm('Tafadhali thibitisha: Futa akaunti yangu?')) {
        localStorage.clear();
        window.location.href = '/';
      }
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 32 }}>Mipangilio ya Akaunti</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: 32 }}>
        {/* Sidebar */}
        <div>
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
                  borderRadius: 12,
                  background: activeSection === section.id ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  border: 'none',
                  color: activeSection === section.id ? '#a5b4fc' : '#94a3b8',
                  cursor: 'pointer',
                  fontSize: 15,
                  fontWeight: 500,
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                }}
              >
                <section.icon size={20} />
                {section.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div>
          {activeSection === 'profile' && (
            <div className="glass-card" style={{ padding: 32 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Taarifa za Profile</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={{ fontSize: 14, fontWeight: 500, color: '#cbd5e1', marginBottom: 8, display: 'block' }}>
                    Jina la Mtumiaji
                  </label>
                  <input
                    type="text"
                    value={profileData.username}
                    onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                    style={{
                      width: '100%',
                      padding: 12,
                      borderRadius: 12,
                      background: 'rgba(30, 41, 59, 0.5)',
                      border: '1px solid rgba(51, 65, 85, 0.5)',
                      color: '#e2e8f0',
                      fontSize: 14,
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 14, fontWeight: 500, color: '#cbd5e1', marginBottom: 8, display: 'block' }}>
                    Bio
                  </label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    style={{
                      width: '100%',
                      padding: 12,
                      borderRadius: 12,
                      background: 'rgba(30, 41, 59, 0.5)',
                      border: '1px solid rgba(51, 65, 85, 0.5)',
                      color: '#e2e8f0',
                      fontSize: 14,
                      resize: 'vertical',
                      minHeight: 120,
                    }}
                  />
                </div>

                <button onClick={handleSaveProfile} className="btn-primary">
                  Hifadhi Mabadiliko
                </button>
              </div>
            </div>
          )}

          {activeSection === 'account' && (
            <div className="glass-card" style={{ padding: 32 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Mipangilio ya Akaunti</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={{ fontSize: 14, fontWeight: 500, color: '#cbd5e1', marginBottom: 8, display: 'block' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: 12,
                      borderRadius: 12,
                      background: 'rgba(30, 41, 59, 0.5)',
                      border: '1px solid rgba(51, 65, 85, 0.5)',
                      color: '#e2e8f0',
                      fontSize: 14,
                    }}
                  />
                  <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                    Email yako itatumika kwa login na arifa
                  </p>
                </div>

                <div style={{
                  padding: 20,
                  borderRadius: 12,
                  background: 'rgba(30, 41, 59, 0.3)',
                  border: '1px solid rgba(51, 65, 85, 0.3)',
                }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Password</h3>
                  <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 16 }}>
                    Badilisha password yako ya akaunti
                  </p>
                  <button onClick={handleChangePassword} className="btn-ghost">
                    Badilisha Password
                  </button>
                </div>

                <button onClick={handleSaveProfile} className="btn-primary">
                  Hifadhi Mabadiliko
                </button>
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="glass-card" style={{ padding: 32 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Usalama</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{
                  padding: 20,
                  borderRadius: 12,
                  background: 'rgba(30, 41, 59, 0.3)',
                  border: '1px solid rgba(51, 65, 85, 0.3)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <Key size={24} color="#fbbf24" />
                    <h3 style={{ fontSize: 16, fontWeight: 600 }}>Password</h3>
                  </div>
                  <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 16 }}>
                    Badilisha password yako mara kwa mara kwa usalama zaidi
                  </p>
                  <button onClick={handleChangePassword} className="btn-ghost">
                    Badilisha Password
                  </button>
                </div>

                <div style={{
                  padding: 20,
                  borderRadius: 12,
                  background: 'rgba(30, 41, 59, 0.3)',
                  border: '1px solid rgba(51, 65, 85, 0.3)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <Smartphone size={24} color="#10b981" />
                    <h3 style={{ fontSize: 16, fontWeight: 600 }}>Two-Factor Authentication</h3>
                  </div>
                  <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 16 }}>
                    Ongeza layer ya ziada ya usalama kwa akaunti yako
                  </p>
                  <button onClick={handleSetup2FA} className="btn-ghost">
                    Weka 2FA
                  </button>
                </div>

                <div style={{
                  padding: 20,
                  borderRadius: 12,
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <AlertTriangle size={24} color="#ef4444" />
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fca5a5' }}>Futa Akaunti</h3>
                  </div>
                  <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 16 }}>
                    Futa akaunti yako na data zote. Hatua hii haiwezi kurudishwa!
                  </p>
                  <button
                    onClick={handleDeleteAccount}
                    style={{
                      padding: '10px 20px',
                      borderRadius: 10,
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid rgba(239, 68, 68, 0.5)',
                      color: '#fca5a5',
                      cursor: 'pointer',
                      fontSize: 14,
                      fontWeight: 500,
                    }}
                  >
                    Futa Akaunti Yangu
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="glass-card" style={{ padding: 32 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Mipangilio ya Arifa</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { key: 'emailNotifications', label: 'Arifa za Email', description: 'Pata arifa kupitia email' },
                  { key: 'pushNotifications', label: 'Push Notifications', description: 'Pata arifa kwenye browser' },
                  { key: 'mentionNotifications', label: 'Mentions', description: 'Arifa za kutajwa' },
                  { key: 'followNotifications', label: 'New Followers', description: 'Arifa za wafuasi wapya' },
                  { key: 'commentNotifications', label: 'Comments', description: 'Arifa za majibu kwenye posts zako' },
                  { key: 'upvoteNotifications', label: 'Upvotes', description: 'Arifa za upvotes kwenye posts zako' },
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
                      <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>{item.label}</p>
                      <p style={{ fontSize: 13, color: '#94a3b8' }}>{item.description}</p>
                    </div>
                    <label style={{ position: 'relative', display: 'inline-block', width: 52, height: 28 }}>
                      <input
                        type="checkbox"
                        checked={notificationSettings[item.key as keyof typeof notificationSettings]}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          [item.key]: e.target.checked,
                        })}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span style={{
                        position: 'absolute',
                        cursor: 'pointer',
                        inset: 0,
                        background: notificationSettings[item.key as keyof typeof notificationSettings] ? '#6366f1' : 'rgba(51, 65, 85, 0.5)',
                        borderRadius: 28,
                        transition: '0.3s',
                      }}>
                        <span style={{
                          position: 'absolute',
                          height: 22,
                          width: 22,
                          left: notificationSettings[item.key as keyof typeof notificationSettings] ? 27 : 3,
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

          {activeSection === 'privacy' && (
            <div className="glass-card" style={{ padding: 32 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Mipangilio ya Faragha</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { key: 'showOnlineStatus', label: 'Onyesha Online Status', description: 'Watu wanaoweza kuona ukiwa online' },
                  { key: 'allowMessages', label: 'Ruhusu Messages', description: 'Ruhusu watu kukutumea ujumbe' },
                  { key: 'showEmail', label: 'Onyesha Email', description: 'Onyesha email yako kwenye profile' },
                  { key: 'showActivity', label: 'Onyesha Activity', description: 'Onyesha shughuli zako kwa watumiaji wengine' },
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
                      <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>{item.label}</p>
                      <p style={{ fontSize: 13, color: '#94a3b8' }}>{item.description}</p>
                    </div>
                    <label style={{ position: 'relative', display: 'inline-block', width: 52, height: 28 }}>
                      <input
                        type="checkbox"
                        checked={privacySettings[item.key as keyof typeof privacySettings]}
                        onChange={(e) => setPrivacySettings({
                          ...privacySettings,
                          [item.key]: e.target.checked,
                        })}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span style={{
                        position: 'absolute',
                        cursor: 'pointer',
                        inset: 0,
                        background: privacySettings[item.key as keyof typeof privacySettings] ? '#6366f1' : 'rgba(51, 65, 85, 0.5)',
                        borderRadius: 28,
                        transition: '0.3s',
                      }}>
                        <span style={{
                          position: 'absolute',
                          height: 22,
                          width: 22,
                          left: privacySettings[item.key as keyof typeof privacySettings] ? 27 : 3,
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
            <div className="glass-card" style={{ padding: 32 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Muonekano</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div>
                  <label style={{ fontSize: 15, fontWeight: 500, color: '#cbd5e1', marginBottom: 12, display: 'block' }}>
                    Theme
                  </label>
                  <div style={{ display: 'flex', gap: 12 }}>
                    {[
                      { value: 'light', label: 'Mwanga', icon: '☀️' },
                      { value: 'dark', label: 'Giza', icon: '🌙' },
                      { value: 'system', label: 'System', icon: '💻' },
                    ].map((theme) => (
                      <button
                        key={theme.value}
                        onClick={() => setAppearanceSettings({ ...appearanceSettings, theme: theme.value as any })}
                        style={{
                          flex: 1,
                          padding: 16,
                          borderRadius: 12,
                          background: appearanceSettings.theme === theme.value ? 'rgba(99, 102, 241, 0.15)' : 'rgba(30, 41, 59, 0.3)',
                          border: `1px solid ${appearanceSettings.theme === theme.value ? 'rgba(99, 102, 241, 0.5)' : 'rgba(51, 65, 85, 0.3)'}`,
                          color: appearanceSettings.theme === theme.value ? '#a5b4fc' : '#94a3b8',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <span style={{ fontSize: 24 }}>{theme.icon}</span>
                        <span style={{ fontSize: 14 }}>{theme.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 15, fontWeight: 500, color: '#cbd5e1', marginBottom: 12, display: 'block' }}>
                    Ukubwa wa Fonti
                  </label>
                  <div style={{ display: 'flex', gap: 12 }}>
                    {[
                      { value: 'small', label: 'Ndogo' },
                      { value: 'medium', label: 'Wastani' },
                      { value: 'large', label: 'Kubwa' },
                    ].map((size) => (
                      <button
                        key={size.value}
                        onClick={() => setAppearanceSettings({ ...appearanceSettings, fontSize: size.value as any })}
                        style={{
                          flex: 1,
                          padding: 12,
                          borderRadius: 12,
                          background: appearanceSettings.fontSize === size.value ? 'rgba(99, 102, 241, 0.15)' : 'rgba(30, 41, 59, 0.3)',
                          border: `1px solid ${appearanceSettings.fontSize === size.value ? 'rgba(99, 102, 241, 0.5)' : 'rgba(51, 65, 85, 0.3)'}`,
                          color: appearanceSettings.fontSize === size.value ? '#a5b4fc' : '#94a3b8',
                          cursor: 'pointer',
                          fontSize: 14,
                        }}
                      >
                        {size.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'language' && (
            <div className="glass-card" style={{ padding: 32 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Lugha</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { value: 'sw', label: 'Kiswahili', flag: '🇹🇿' },
                  { value: 'en', label: 'English', flag: '🇬🇧' },
                  { value: 'fr', label: 'Français', flag: '🇫🇷' },
                ].map((lang) => (
                  <button
                    key={lang.value}
                    onClick={() => setAppearanceSettings({ ...appearanceSettings, language: lang.value as any })}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: 16,
                      borderRadius: 12,
                      background: appearanceSettings.language === lang.value ? 'rgba(99, 102, 241, 0.15)' : 'rgba(30, 41, 59, 0.3)',
                      border: `1px solid ${appearanceSettings.language === lang.value ? 'rgba(99, 102, 241, 0.5)' : 'rgba(51, 65, 85, 0.3)'}`,
                      color: appearanceSettings.language === lang.value ? '#a5b4fc' : '#94a3b8',
                      cursor: 'pointer',
                      fontSize: 15,
                      fontWeight: 500,
                    }}
                  >
                    <span style={{ fontSize: 24 }}>{lang.flag}</span>
                    {lang.label}
                    {appearanceSettings.language === lang.value && (
                      <Check size={20} style={{ marginLeft: 'auto' }} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'data' && (
            <div className="glass-card" style={{ padding: 32 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Data yako</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{
                  padding: 20,
                  borderRadius: 12,
                  background: 'rgba(30, 41, 59, 0.3)',
                  border: '1px solid rgba(51, 65, 85, 0.3)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <Download size={24} color="#10b981" />
                    <h3 style={{ fontSize: 16, fontWeight: 600 }}>Export Data</h3>
                  </div>
                  <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 16 }}>
                    Pakua data yako yote kama JSON file
                  </p>
                  <button onClick={handleExportData} className="btn-primary">
                    Export Data
                  </button>
                </div>

                <div style={{
                  padding: 20,
                  borderRadius: 12,
                  background: 'rgba(30, 41, 59, 0.3)',
                  border: '1px solid rgba(51, 65, 85, 0.3)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <Upload size={24} color="#60a5fa" />
                    <h3 style={{ fontSize: 16, fontWeight: 600 }}>Import Data</h3>
                  </div>
                  <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 16 }}>
                    Ingiza data kutoka JSON file
                  </p>
                  <button onClick={handleImportData} className="btn-ghost">
                    Import Data
                  </button>
                </div>

                <div style={{
                  padding: 20,
                  borderRadius: 12,
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <Trash2 size={24} color="#ef4444" />
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fca5a5' }}>Futa Data Yote</h3>
                  </div>
                  <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 16 }}>
                    Futa data yako yote kutoka browser hii
                  </p>
                  <button
                    onClick={() => {
                      if (confirm('Una uhakika unataka kufuta data yako yote?')) {
                        localStorage.clear();
                        window.location.reload();
                      }
                    }}
                    style={{
                      padding: '10px 20px',
                      borderRadius: 10,
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid rgba(239, 68, 68, 0.5)',
                      color: '#fca5a5',
                      cursor: 'pointer',
                      fontSize: 14,
                      fontWeight: 500,
                    }}
                  >
                    Futa Data
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div
            className="glass-card"
            style={{ width: '100%', maxWidth: 500, margin: '0 16px', padding: 32 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700 }}>Badilisha Password</h2>
              <button
                onClick={() => setShowPasswordModal(false)}
                style={{ padding: 8, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <X size={24} color="#cbd5e1" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 14, fontWeight: 500, color: '#cbd5e1', marginBottom: 8, display: 'block' }}>
                  Password ya Sasa
                </label>
                <input
                  type="password"
                  placeholder="Ingiza password ya sasa"
                  style={{
                    width: '100%',
                    padding: 12,
                    borderRadius: 12,
                    background: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid rgba(51, 65, 85, 0.5)',
                    color: '#e2e8f0',
                    fontSize: 14,
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 14, fontWeight: 500, color: '#cbd5e1', marginBottom: 8, display: 'block' }}>
                  Password Mpya
                </label>
                <input
                  type="password"
                  placeholder="Ingiza password mpya"
                  style={{
                    width: '100%',
                    padding: 12,
                    borderRadius: 12,
                    background: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid rgba(51, 65, 85, 0.5)',
                    color: '#e2e8f0',
                    fontSize: 14,
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 14, fontWeight: 500, color: '#cbd5e1', marginBottom: 8, display: 'block' }}>
                  Thibitisha Password Mpya
                </label>
                <input
                  type="password"
                  placeholder="Ingiza password mpya tena"
                  style={{
                    width: '100%',
                    padding: 12,
                    borderRadius: 12,
                    background: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid rgba(51, 65, 85, 0.5)',
                    color: '#e2e8f0',
                    fontSize: 14,
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button onClick={() => setShowPasswordModal(false)} className="btn-ghost" style={{ flex: 1 }}>
                  Ghairi
                </button>
                <button className="btn-primary" style={{ flex: 1 }}>
                  Badilisha Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2FA Setup Modal */}
      {show2FAModal && (
        <div className="modal-overlay" onClick={() => setShow2FAModal(false)}>
          <div
            className="glass-card"
            style={{ width: '100%', maxWidth: 500, margin: '0 16px', padding: 32 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700 }}>Two-Factor Authentication</h2>
              <button
                onClick={() => setShow2FAModal(false)}
                style={{ padding: 8, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <X size={24} color="#cbd5e1" />
              </button>
            </div>

            <div style={{ textAlign: 'center', padding: 24 }}>
              <Smartphone size={64} color="#10b981" style={{ margin: '0 auto 24px' }} />
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Weka 2FA</h3>
              <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 24, lineHeight: 1.6 }}>
                Two-factor authentication inaongeza layer ya ziada ya usalama kwa akaunti yako. Utahitaji app ya authenticator kama Google Authenticator au Authy.
              </p>
              <button className="btn-primary" style={{ width: '100%' }}>
                Anza Setup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
