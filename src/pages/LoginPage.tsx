import React, { useState } from 'react';
import { useRouter } from '../router/Router';
import { useApp } from '../contexts/AppContext';
import { 
  Mail, Lock, User, Eye, EyeOff, Sparkles, 
  Github, Twitter, Facebook, ArrowRight
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { navigate } = useRouter();
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 800));

    const result = await login(email, password);
    if (result && result.success) {
      navigate('/');
    } else {
      setError(result?.error || 'Hitilafu imetokea');
    }
    setIsLoading(false);
  };

  const handleSocialLogin = (provider: string) => {
    // TODO: Implement social login
    alert(`${provider} login inakuja hivi karibuni!`);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      background: 'var(--bg-app)',
    }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: 'linear-gradient(135deg, #6366f1, #9333ea)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
          }}>
            <Sparkles size={32} color="white" />
          </div>
          <h1 className="gradient-text" style={{ fontSize: 32, fontWeight: 700 }}>
            Karibu Tena
          </h1>
          <p style={{ fontSize: 16, color: 'var(--text-muted)', marginTop: 8 }}>
            Ingia kwenye akaunti yako ya Nijuze
          </p>
        </div>

        {/* Login Form */}
        <div className="glass-card" style={{ padding: 32 }}>
          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-main)', marginBottom: 8, display: 'block' }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={18}
                  color="var(--text-muted)"
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
                    background: 'var(--input-bg)',
                    border: '1px solid var(--input-border)',
                    color: 'var(--input-text)',
                    fontSize: 14,
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-main)', marginBottom: 8, display: 'block' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={18}
                  color="var(--text-muted)"
                  style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 44px 12px 40px',
                    borderRadius: 12,
                    background: 'var(--input-bg)',
                    border: '1px solid var(--input-border)',
                    color: 'var(--input-text)',
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
                  {showPassword ? <EyeOff size={18} color="var(--text-muted)" /> : <Eye size={18} color="var(--text-muted)" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ width: 16, height: 16, borderRadius: 4 }}
                />
                <span style={{ fontSize: 14, color: 'var(--text-body)' }}>Nikumbuke</span>
              </label>
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                style={{
                  fontSize: 14,
                  color: '#818cf8',
                  fontWeight: 500,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Umesahau password?
              </button>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                padding: 12,
                borderRadius: 8,
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
                fontSize: 13,
                marginBottom: 16,
              }}>
                {error}
              </div>
            )}

            {/* Submit Button */}
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {isLoading ? 'Inaingia...' : (
                <>
                  Ingia
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            margin: '24px 0',
          }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border-app)' }} />
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>AU</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border-app)' }} />
          </div>

          {/* Social Login */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button
              onClick={() => handleSocialLogin('Google')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                padding: 12,
                borderRadius: 12,
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-app)',
                color: 'var(--text-main)',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Ingia na Google
            </button>

            <button
              onClick={() => handleSocialLogin('GitHub')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                padding: 12,
                borderRadius: 12,
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-app)',
                color: 'var(--text-main)',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              <Github size={18} />
              Ingia na GitHub
            </button>
          </div>

          {/* Register Link */}
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              Huna akaunti?{' '}
            </span>
            <button
              onClick={() => navigate('/register')}
              style={{
                fontSize: 14,
                color: 'var(--border-focus)',
                fontWeight: 600,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Jiunga sasa
            </button>
          </div>
        </div>

        {/* Demo Accounts */}
        <div style={{
          marginTop: 24,
          padding: 16,
          borderRadius: 12,
          background: 'rgba(99, 102, 241, 0.05)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
        }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
            <strong style={{ color: 'var(--btn-ghost-text)' }}>Demo Accounts:</strong>
          </p>
          <p style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>
            Email: amina@example.com
          </p>
          <p style={{ fontSize: 12, color: '#64748b' }}>
            Password: password123
          </p>
        </div>
      </div>
    </div>
  );
};
