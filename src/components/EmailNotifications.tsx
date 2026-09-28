import React, { useState } from 'react';
import { Mail, Bell, Settings, Check } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface EmailPreferences {
  newPost: boolean;
  newComment: boolean;
  mention: boolean;
  follow: boolean;
  weeklyDigest: boolean;
  marketing: boolean;
}

export const EmailNotifications: React.FC = () => {
  const { currentUser } = useApp();
  const [preferences, setPreferences] = useState<EmailPreferences>({
    newPost: true,
    newComment: true,
    mention: true,
    follow: true,
    weeklyDigest: true,
    marketing: false,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // Save to localStorage (in production, save to backend)
    localStorage.setItem(`email_prefs_${currentUser?.id}`, JSON.stringify(preferences));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleToggle = (key: keyof EmailPreferences) => {
    setPreferences({ ...preferences, [key]: !preferences[key] });
  };

  if (!currentUser) return null;

  return (
    <div className="glass-card" style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <Mail size={24} color="#a5b4fc" />
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Arifa za Email</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
            Chagua arifa zipi unataka kupata kwa email
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[
          { key: 'newPost', label: 'Posts Mpya', description: 'Pata arifa wakati posts mpya zinachapishwa' },
          { key: 'newComment', label: 'Comments Mpya', description: 'Pata arifa wakati mtu anajibu post yako' },
          { key: 'mention', label: 'Mentions', description: 'Pata arifa wakati mtu anakutaja' },
          { key: 'follow', label: 'New Followers', description: 'Pata arifa wakati mtu anakufulia' },
          { key: 'weeklyDigest', label: 'Weekly Digest', description: 'Pata muhtasari wa wiki kila Jumatatu' },
          { key: 'marketing', label: 'Marketing', description: 'Pata taarifa za features mpya na offers' },
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
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>{item.description}</p>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: 52, height: 28 }}>
              <input
                type="checkbox"
                checked={preferences[item.key as keyof EmailPreferences]}
                onChange={() => handleToggle(item.key as keyof EmailPreferences)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute',
                cursor: 'pointer',
                inset: 0,
                background: preferences[item.key as keyof EmailPreferences] ? '#6366f1' : 'rgba(51, 65, 85, 0.5)',
                borderRadius: 28,
                transition: '0.3s',
              }}>
                <span style={{
                  position: 'absolute',
                  height: 22,
                  width: 22,
                  left: preferences[item.key as keyof EmailPreferences] ? 27 : 3,
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

      <button
        onClick={handleSave}
        className="btn-primary"
        style={{
          width: '100%',
          marginTop: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        {saved ? (
          <>
            <Check size={16} />
            Imehifadhiwa!
          </>
        ) : (
          <>
            <Settings size={16} />
            Hifadhi Mipangilio
          </>
        )}
      </button>
    </div>
  );
};
