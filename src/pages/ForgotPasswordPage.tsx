import React, { useState } from 'react';
import { useRouter } from '../router/Router';
import { Mail, ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const { navigate } = useRouter();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitted(true);
    setIsLoading(false);
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
            Umesahau Password?
          </h1>
          <p style={{ fontSize: 16, color: 'var(--text-muted)', marginTop: 8 }}>
            Hakuna shida, tutakusaidia kuipata tena
          </p>
        </div>

        {/* Form */}
        <div className="glass-card" style={{ padding: 32 }}>
          {!isSubmitted ? (
            <>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.6 }}>
                Ingiza email yako na tutakutumia link ya kureset password yako.
              </p>

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-main)', marginBottom: 8, display: 'block' }}>
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
                  {isLoading ? 'Inatuma...' : 'Tuma Link ya Reset'}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <button
                  onClick={() => navigate('/login')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 14,
                    color: 'var(--border-focus)',
                    fontWeight: 600,
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <ArrowLeft size={16} />
                  Rudi kwenye Login
                </button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: 24 }}>
              <div style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '2px solid rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
              }}>
                <CheckCircle2 size={48} color="#10b981" />
              </div>

              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12, color: 'var(--text-main)' }}>
                Email Imetumwa!
              </h2>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.6 }}>
                Tumetuma email yenye link ya kureset password kwa <strong style={{ color: 'var(--text-main)' }}>{email}</strong>. 
                Tafadhali angalia inbox yako na ufuatiliae maagizo.
              </p>

              <div style={{
                padding: 16,
                borderRadius: 12,
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-app)',
                marginBottom: 24,
              }}>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  <strong style={{ color: 'var(--border-focus)' }}>Kidokezo:</strong> Kama huoni email, angalia spam folder yako
                </p>
              </div>

              <button
                onClick={() => navigate('/login')}
                className="btn-primary"
                style={{ width: '100%' }}
              >
                Rudi kwenye Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
