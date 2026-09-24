import React, { useState, useEffect } from 'react';
import { Shield, Key, Smartphone, Clock, MapPin, Monitor, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface LoginSession {
  id: string;
  device: string;
  browser: string;
  ip: string;
  location: string;
  lastActive: Date;
  isCurrent: boolean;
}

export const AdvancedSecurity: React.FC = () => {
  const { currentUser } = useApp();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showSetup2FA, setShowSetup2FA] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [sessions, setSessions] = useState<LoginSession[]>([]);
  const [loginHistory, setLoginHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!currentUser) return;

    // Simulate login sessions
    const mockSessions: LoginSession[] = [
      {
        id: '1',
        device: 'Desktop',
        browser: 'Chrome 120',
        ip: '192.168.1.1',
        location: 'Dar es Salaam, Tanzania',
        lastActive: new Date(),
        isCurrent: true,
      },
      {
        id: '2',
        device: 'Mobile',
        browser: 'Safari iOS',
        ip: '192.168.1.100',
        location: 'Dar es Salaam, Tanzania',
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
        isCurrent: false,
      },
      {
        id: '3',
        device: 'Tablet',
        browser: 'Firefox',
        ip: '192.168.1.50',
        location: 'Arusha, Tanzania',
        lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000),
        isCurrent: false,
      },
    ];

    setSessions(mockSessions);

    // Simulate login history
    const mockHistory = [
      { id: '1', time: new Date(), device: 'Chrome on Mac', location: 'Dar es Salaam', success: true },
      { id: '2', time: new Date(Date.now() - 2 * 60 * 60 * 1000), device: 'Safari on iPhone', location: 'Dar es Salaam', success: true },
      { id: '3', time: new Date(Date.now() - 24 * 60 * 60 * 1000), device: 'Firefox on Windows', location: 'Arusha', success: true },
      { id: '4', time: new Date(Date.now() - 48 * 60 * 60 * 1000), device: 'Chrome on Android', location: 'Mwanza', success: false },
    ];

    setLoginHistory(mockHistory);

    // Check if 2FA is enabled
    const enabled = localStorage.getItem(`2fa_enabled_${currentUser.id}`);
    setTwoFactorEnabled(enabled === 'true');
  }, [currentUser]);

  const handleEnable2FA = () => {
    setShowSetup2FA(true);
  };

  const handleVerify2FA = () => {
    if (verificationCode.length === 6 && currentUser) {
      setTwoFactorEnabled(true);
      localStorage.setItem(`2fa_enabled_${currentUser.id}`, 'true');
      setShowSetup2FA(false);
      setVerificationCode('');
      alert('2FA imefunguliwa kwa mafanikio! 🔐');
    }
  };

  const handleDisable2FA = () => {
    if (currentUser && confirm('Una uhakika unataka kuzima 2FA?')) {
      setTwoFactorEnabled(false);
      localStorage.setItem(`2fa_enabled_${currentUser.id}`, 'false');
    }
  };

  const handleTerminateSession = (sessionId: string) => {
    setSessions(sessions.filter(s => s.id !== sessionId));
  };

  const handleTerminateAllSessions = () => {
    if (confirm('Una uhakika unataka kuondoa sessions zote isipokuwa hii ya sasa?')) {
      setSessions(sessions.filter(s => s.isCurrent));
    }
  };

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'desktop': return '🖥️';
      case 'mobile': return '📱';
      case 'tablet': return '📱';
      default: return '💻';
    }
  };

  if (!currentUser) return null;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <Shield size={32} color="#6366f1" />
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Usalama wa Akaunti</h2>
          <p style={{ fontSize: 14, color: '#94a3b8', margin: 0 }}>
            Dhibiti usalama wa akaunti yako
          </p>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: twoFactorEnabled ? 'rgba(16, 185, 129, 0.2)' : 'rgba(251, 191, 36, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Smartphone size={24} color={twoFactorEnabled ? '#10b981' : '#fbbf24'} />
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Two-Factor Authentication</h3>
              <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
                {twoFactorEnabled ? '2FA imefunguliwa' : '2FA haijafunguliwa'}
              </p>
            </div>
          </div>
          {twoFactorEnabled ? (
            <button
              onClick={handleDisable2FA}
              style={{
                padding: '10px 20px',
                borderRadius: 10,
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              Zima 2FA
            </button>
          ) : (
            <button
              onClick={handleEnable2FA}
              className="btn-primary"
            >
              Fungua 2FA
            </button>
          )}
        </div>

        {twoFactorEnabled && (
          <div style={{
            padding: 16,
            borderRadius: 12,
            background: 'rgba(16, 185, 129, 0.05)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <CheckCircle2 size={20} color="#10b981" />
            <p style={{ fontSize: 14, color: '#6ee7b7', margin: 0 }}>
              Akaunti yako inalindwa na 2FA
            </p>
          </div>
        )}
      </div>

      {/* 2FA Setup Modal */}
      {showSetup2FA && (
        <div className="modal-overlay" onClick={() => setShowSetup2FA(false)}>
          <div
            className="glass-card"
            style={{ width: '100%', maxWidth: 500, margin: '0 16px', padding: 32 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Weka 2FA</h3>
            <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 24 }}>
              Tumia app ya authenticator (kama Google Authenticator) kuskani QR code hii:
            </p>

            {/* QR Code Placeholder */}
            <div style={{
              width: 200,
              height: 200,
              margin: '0 auto 24px',
              borderRadius: 12,
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 48,
            }}>
              📱
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 14, fontWeight: 500, color: '#cbd5e1', marginBottom: 8, display: 'block' }}>
                Ingiza code ya 6-digit
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                style={{
                  width: '100%',
                  padding: 12,
                  borderRadius: 12,
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(51, 65, 85, 0.5)',
                  color: '#e2e8f0',
                  fontSize: 18,
                  textAlign: 'center',
                  letterSpacing: 8,
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowSetup2FA(false)}
                className="btn-ghost"
                style={{ flex: 1 }}
              >
                Ghairi
              </button>
              <button
                onClick={handleVerify2FA}
                className="btn-primary"
                style={{ flex: 1 }}
                disabled={verificationCode.length !== 6}
              >
                Thibitisha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Sessions */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Sessions Zinazofanya Kazi</h3>
          {sessions.length > 1 && (
            <button
              onClick={handleTerminateAllSessions}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              Ondoa Zote
            </button>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sessions.map((session) => (
            <div
              key={session.id}
              style={{
                padding: 16,
                borderRadius: 12,
                background: session.isCurrent ? 'rgba(16, 185, 129, 0.05)' : 'rgba(30, 41, 59, 0.3)',
                border: `1px solid ${session.isCurrent ? 'rgba(16, 185, 129, 0.3)' : 'rgba(51, 65, 85, 0.3)'}`,
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}
            >
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'rgba(99, 102, 241, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
              }}>
                {getDeviceIcon(session.device)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>
                    {session.browser}
                  </p>
                  {session.isCurrent && (
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: 8,
                      background: 'rgba(16, 185, 129, 0.2)',
                      color: '#10b981',
                      fontSize: 11,
                      fontWeight: 600,
                    }}>
                      Sasa Hivi
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#64748b' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={12} />
                    {session.location}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} />
                    {session.lastActive.toLocaleString('sw-TZ')}
                  </span>
                </div>
              </div>
              {!session.isCurrent && (
                <button
                  onClick={() => handleTerminateSession(session.id)}
                  style={{
                    padding: 8,
                    borderRadius: 8,
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <Trash2 size={16} color="#fca5a5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Login History */}
      <div className="glass-card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Historia ya Kuingia</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {loginHistory.map((entry) => (
            <div
              key={entry.id}
              style={{
                padding: 12,
                borderRadius: 10,
                background: 'rgba(30, 41, 59, 0.3)',
                border: '1px solid rgba(51, 65, 85, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: entry.success ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {entry.success ? (
                  <CheckCircle2 size={18} color="#10b981" />
                ) : (
                  <AlertCircle size={18} color="#ef4444" />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>
                  {entry.device}
                </p>
                <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
                  {entry.location} • {entry.time.toLocaleString('sw-TZ')}
                </p>
              </div>
              <span style={{
                padding: '4px 12px',
                borderRadius: 8,
                background: entry.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                color: entry.success ? '#10b981' : '#ef4444',
                fontSize: 12,
                fontWeight: 600,
              }}>
                {entry.success ? 'Imefanikiwa' : 'Imeshindwa'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
