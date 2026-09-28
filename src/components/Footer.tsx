import React from 'react';
import { useRouter } from '../router/Router';
import { Sparkles, Heart, Shield, HelpCircle, FileText, Mail, Github, Twitter, MessageSquare } from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigate } = useRouter();

  return (
    <footer
      style={{
        background: 'var(--bg-subtle)',
        borderTop: '1px solid var(--border-app)',
        marginTop: 48,
        paddingTop: 48,
        paddingBottom: 40,
        color: 'var(--text-body)',
        transition: 'background-color 0.3s ease, border-color 0.3s ease',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 36,
            marginBottom: 40,
          }}
        >
          {/* Brand & Description */}
          <div>
            <div
              onClick={() => navigate('/')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #6366f1, #9333ea)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)',
                }}
              >
                <Sparkles size={18} color="white" />
              </div>
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  letterSpacing: '-0.5px',
                  background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                NIJUZE
              </span>
            </div>
            <p
              style={{
                fontSize: 13,
                lineHeight: 1.6,
                color: 'var(--text-muted)',
                marginBottom: 16,
              }}
            >
              Jukwaa huru la Kiswahili la kubadilishana maarifa, kuuliza maswali na kusaidiana kitaaluma, kiteknolojia na kijamii.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 10px',
                  borderRadius: 20,
                  fontSize: 12,
                  background: 'rgba(99, 102, 241, 0.1)',
                  color: 'var(--btn-ghost-text)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  fontWeight: 600,
                }}
              >
                🇹🇿 Jamhuri ya Muungano wa Tanzania
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: 'var(--text-main)',
                marginBottom: 16,
                letterSpacing: '0.3px',
              }}
            >
              Kurasa Kuu
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Nyumbani', path: '/' },
                { label: 'Mijadala (Forum)', path: '/forum' },
                { label: 'Vikundi (Guilds)', path: '/guilds' },
                { label: 'Utafutaji wa Kina', path: '/search' },
                { label: 'Mlisho wa Matukio', path: '/activities' },
              ].map((link) => (
                <li key={link.path}>
                  <button
                    onClick={() => navigate(link.path)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      color: 'var(--text-muted)',
                      fontSize: 13,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'color 0.2s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-main)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Community & Rewards */}
          <div>
            <h4
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: 'var(--text-main)',
                marginBottom: 16,
                letterSpacing: '0.3px',
              }}
            >
              Jamii & Motisha
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Mashindano ya Maarifa', path: '/tournaments' },
                { label: 'Nishani & Tuzo', path: '/badges' },
                { label: 'Changamoto za Kila Siku', path: '/challenges' },
                { label: 'Takwimu za Jamii', path: '/analytics' },
              ].map((link) => (
                <li key={link.path}>
                  <button
                    onClick={() => navigate(link.path)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      color: 'var(--text-muted)',
                      fontSize: 13,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'color 0.2s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-main)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Guidelines & Safety */}
          <div>
            <h4
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: 'var(--text-main)',
                marginBottom: 16,
                letterSpacing: '0.3px',
              }}
            >
              Msaada na Sheria
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Shield size={15} color="#10b981" />
                <span>Salama na Faragha Kamili</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <HelpCircle size={15} color="#6366f1" />
                <span>Miongozo ya Uandishi Bora</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={15} color="#f59e0b" />
                <span>Kanuni na Maadili ya Nijuze</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <Mail size={15} color="#8b5cf6" />
                <span>msaada@nijuze.mdandu.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: '1px solid var(--border-app)',
            paddingTop: 24,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            fontSize: 13,
            color: 'var(--text-muted)',
          }}
        >
          <div>
            © {new Date().getFullYear()} Nijuze Platform. Haki zote zimehifadhiwa.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>Imeundwa kwa</span>
            <Heart size={14} color="#ef4444" fill="#ef4444" />
            <span>kwa ajili ya jamii ya Kiswahili</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
