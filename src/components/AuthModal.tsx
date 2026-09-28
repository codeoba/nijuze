import React, { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'register';
  onToggleMode: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, mode, onToggleMode }) => {
  const { login, register } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      if (mode === 'login') {
        const result = await login(email, password);
        if (result && result.success) {
          onClose();
        } else {
          setError(result?.error || 'Email au password si sahihi');
        }
      } else {
        if (password.length < 6) {
          setError('Password lazima iwe na herufi 6 au zaidi');
          setIsLoading(false);
          return;
        }
        const result = await register(username, email, password);
        if (result && result.success) {
          onClose();
        } else {
          setError(result?.error || 'Email hii imeshajiriwa');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Hitilafu imetokea');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: 440,
          margin: '0 16px',
          padding: 32,
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 className="gradient-text" style={{ fontSize: 24, fontWeight: 'bold' }}>
            {mode === 'login' ? 'Ingia Nijuze' : 'Jiunga na Nijuze'}
          </h2>
          <button
            onClick={onClose}
            style={{ padding: 8, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <X size={20} color="#cbd5e1" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-body)', marginBottom: 8, display: 'block' }}>
                Jina Kamili
              </label>
              <div style={{ position: 'relative' }}>
                <User
                  size={18}
                  color="#64748b"
                  style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Jina lako kamili"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 40px',
                    borderRadius: 12,
                    background: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid rgba(51, 65, 85, 0.5)',
                    color: 'var(--text-main)',
                    fontSize: 14,
                  }}
                />
              </div>
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-body)', marginBottom: 8, display: 'block' }}>
              Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={18}
                color="#64748b"
                style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  borderRadius: 12,
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(51, 65, 85, 0.5)',
                  color: 'var(--text-main)',
                  fontSize: 14,
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-body)', marginBottom: 8, display: 'block' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                color="#64748b"
                style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                style={{
                  width: '100%',
                  padding: '12px 44px 12px 40px',
                  borderRadius: 12,
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(51, 65, 85, 0.5)',
                  color: 'var(--text-main)',
                  fontSize: 14,
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 4,
                }}
              >
                {showPassword ? <EyeOff size={18} color="#64748b" /> : <Eye size={18} color="#64748b" />}
              </button>
            </div>
          </div>

          {error && (
            <div
              style={{
                padding: 12,
                borderRadius: 8,
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px 24px',
              fontSize: 15,
              fontWeight: 600,
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading ? 'Inapakia...' : mode === 'login' ? 'Ingia' : 'Jiunga'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            {mode === 'login' ? 'Huna akaunti? ' : 'Una akaunti? '}
          </span>
          <button
            onClick={onToggleMode}
            style={{
              fontSize: 14,
              color: '#818cf8',
              fontWeight: 500,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {mode === 'login' ? 'Jiunga sasa' : 'Ingia'}
          </button>
        </div>

        {mode === 'login' && (
          <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
              <strong style={{ color: 'var(--btn-ghost-text)' }}>Demo Accounts:</strong>
            </p>
            <p style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Email: amina@example.com</p>
            <p style={{ fontSize: 11, color: '#64748b' }}>Password: password123</p>
          </div>
        )}
      </div>
    </div>
  );
};
