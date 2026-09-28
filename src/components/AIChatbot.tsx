import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Bot, User, Loader2 } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { aiAPI } from '../services/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const AIChatbot: React.FC = () => {
  const { currentUser, posts, users } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isDisabled, setIsDisabled] = useState(() => {
    try {
      return localStorage.getItem('nijuze_ai_disabled') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handleToggle = () => {
      try {
        setIsDisabled(localStorage.getItem('nijuze_ai_disabled') === 'true');
      } catch {}
    };
    window.addEventListener('nijuze_toggle_ai', handleToggle);
    return () => window.removeEventListener('nijuze_toggle_ai', handleToggle);
  }, []);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Habari! Mimi ni Nijuze AI Assistant. Ninaweza kukusaidia na:\n\n• Kutafuta posts\n• Kujibu maswali\n• Kupendekeza content\n• Kukusaidia na platform\n\nUnaweza kuniuliza chochote!',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isDisabled) return null;

  // Simple AI response generator (fallback)
  const generateResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();

    // Greeting
    if (message.includes('habari') || message.includes('hello') || message.includes('hi')) {
      return 'Habari! Niko vizuri. Ninaweza kukusaidiaaje leo?';
    }

    // Search posts
    if (message.includes('tafuta') || message.includes('search')) {
      const query = message.replace('tafuta', '').replace('search', '').trim();
      const matchingPosts = posts.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.tags.some(t => t.toLowerCase().includes(query))
      ).slice(0, 3);

      if (matchingPosts.length > 0) {
        return `Nimepata posts ${matchingPosts.length} zinazohusiana na "${query}":\n\n${matchingPosts.map((p, i) => `${i + 1}. **${p.title}**\n   👍 ${p.upvotes} upvotes • 💬 ${p.commentsCount} comments`).join('\n\n')}`;
      }
      return `Samahani, sikuweza kupata posts zinazohusiana na "${query}". Jaribu kutafuta kwa maneno tofauti.`;
    }

    // Statistics
    if (message.includes('stats') || message.includes('takwimu') || message.includes('statistics')) {
      return `Hizi ni takwimu za sasa:\n\n📊 **Posts:** ${posts.length}\n👥 **Watumiaji:** ${users.length}\n💬 **Comments:** ${posts.reduce((sum, p) => sum + p.commentsCount, 0)}\n👍 **Total Upvotes:** ${posts.reduce((sum, p) => sum + p.upvotes, 0)}`;
    }

    // Help
    if (message.includes('help') || message.includes('msaada')) {
      return 'Ninaweza kukusaidia na:\n\n• **Kutafuta posts** - Andika "tafuta [keyword]"\n• **Takwimu** - Andika "stats"\n• **Kupendekeza posts** - Andika "pendekeza"\n• **Kujibu maswali** - Niulize chochote!\n\nJaribu sasa!';
    }

    // Recommendations
    if (message.includes('pendekeza') || message.includes('recommend')) {
      const topPosts = [...posts].sort((a, b) => b.upvotes - a.upvotes).slice(0, 3);
      return `Hizi ni posts maarufu zaidi:\n\n${topPosts.map((p, i) => `${i + 1}. **${p.title}**\n   👍 ${p.upvotes} upvotes • 👁️ ${p.views} views`).join('\n\n')}`;
    }

    // How to use
    if (message.includes('how') || message.includes('je') || message.includes('nifanyaje')) {
      return 'Ili kutumia Nijuze:\n\n1. **Jiunga** - Bofya "Jiunga" kwenye header\n2. **Unda post** - Bofya "Uliza Swali"\n3. **Jibu posts** - Bofya kwenye post na uandike jibu\n4. **Piga kura** - Bofya 👍 au 👎\n5. **Fuata watu** - Bofya "Fuata" kwenye profile\n\nKuna maswali zaidi? Niulize!';
    }

    // Default response
    const responses = [
      'Ninaelewa vizuri. Je, unaweza kueleza zaidi au kuweka swali kwa kina?',
      'Nashukuru kwa kuuliza! Ninaweza kukusaidia kutafuta posts za jamii, kupata takwimu, au kupendekeza mijadala mipya.',
      'Swali zuri sana kuhusu jukwaa la Nijuze. Unaweza pia kuchapisha hili kama swali jipya kwenye jamii ili upate maoni mengi zaidi!',
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    let answer = '';
    try {
      // Real AI endpoint call
      const res = await aiAPI.chat(userText);
      if (res) {
        answer = res.reply || res.response || (res.data && (res.data.reply || res.data.response)) || '';
      }
    } catch {
      // Offline fallback
    }

    if (!answer) {
      answer = generateResponse(userText);
    }

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: answer,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Button & Dismiss */}
      {!isOpen && (
        <div
          className="ai-floating-trigger"
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            zIndex: 1000,
          }}
        >
          {/* Quick close / dismiss button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              try {
                localStorage.setItem('nijuze_ai_disabled', 'true');
              } catch {}
              setIsDisabled(true);
            }}
            title="Zima / Funga AI Chat"
            style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: 11,
              padding: 0,
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#ef4444')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(15, 23, 42, 0.65)')}
          >
            ✕
          </button>

          {/* Compact Chat Button */}
          <button
            onClick={() => setIsOpen(true)}
            title="Fungua Nijuze AI"
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #9333ea)',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(99, 102, 241, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <Bot size={22} color="white" />
          </button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className="glass-card ai-chat-window"
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: 400,
            height: 600,
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{
            padding: 16,
            borderBottom: '1px solid var(--border-app)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-subtle)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #9333ea)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Bot size={20} color="white" />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: 'var(--text-main)' }}>Nijuze AI</h3>
                <p style={{ fontSize: 12, color: '#10b981', margin: 0, fontWeight: 500 }}>● Online</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                padding: 8,
                borderRadius: 8,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)'
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  gap: 12,
                  marginBottom: 16,
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                }}
              >
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg, #10b981, #059669)'
                    : 'linear-gradient(135deg, #6366f1, #9333ea)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {msg.role === 'user' ? <User size={16} color="white" /> : <Bot size={16} color="white" />}
                </div>
                <div style={{
                  maxWidth: '75%',
                  padding: 12,
                  borderRadius: 14,
                  background: msg.role === 'user'
                    ? 'var(--btn-ghost-bg)'
                    : 'var(--bg-subtle)',
                  border: `1px solid ${msg.role === 'user' ? 'var(--btn-ghost-border)' : 'var(--border-app)'}`,
                }}>
                  <p style={{
                    fontSize: 14,
                    color: 'var(--text-main)',
                    margin: 0,
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                  }}>
                    {msg.content}
                  </p>
                  <p style={{
                    fontSize: 11,
                    color: 'var(--text-muted)',
                    margin: '6px 0 0 0',
                    textAlign: msg.role === 'user' ? 'right' : 'left',
                  }}>
                    {msg.timestamp.toLocaleTimeString('sw-TZ', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1, #9333ea)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Bot size={16} color="white" />
                </div>
                <div style={{
                  padding: 12,
                  borderRadius: 12,
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-app)',
                }}>
                  <Loader2 size={16} color="var(--btn-ghost-text)" className="animate-spin" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: 16,
            borderTop: '1px solid var(--border-app)',
            display: 'flex',
            gap: 8,
            background: 'var(--bg-surface)'
          }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Andika ujumbe..."
              disabled={isLoading}
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 12,
                background: 'var(--input-bg)',
                border: '1px solid var(--input-border)',
                color: 'var(--input-text)',
                fontSize: 14,
              }}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="btn-primary"
              style={{
                padding: 12,
                opacity: isLoading || !input.trim() ? 0.5 : 1,
                cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </>
  );
};
