import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Bot, User, Loader2 } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const AIChatbot: React.FC = () => {
  const { currentUser, posts, users } = useApp();
  const [isOpen, setIsOpen] = useState(false);
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

  // Simple AI response generator
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
      'Ninaelewa. Je, unaweza kueleza zaidi?',
      'Samahani, sikuweza kuelewa vizuri. Unaweza kuuliza tena?',
      'Nashukuru kwa swali lako! Ninaweza kukusaidia na kutafuta posts, takwimu, au kupendekeza content. Jaribu "help" kwa msaada zaidi.',
      'Hilo ni swali zuri! Ninapendekeza utafute posts zinazohusiana au uulize community yetu.',
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI thinking
    await new Promise(resolve => setTimeout(resolve, 1000));

    const response = generateResponse(input);
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
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

  if (!currentUser) return null;

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #9333ea)',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            transition: 'transform 0.2s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Bot size={28} color="white" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className="glass-card"
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
            borderBottom: '1px solid rgba(51, 65, 85, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(147, 51, 234, 0.1))',
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
                <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Nijuze AI</h3>
                <p style={{ fontSize: 12, color: '#10b981', margin: 0 }}>● Online</p>
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
              }}
            >
              <X size={20} color="#94a3b8" />
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
                  maxWidth: '70%',
                  padding: 12,
                  borderRadius: 12,
                  background: msg.role === 'user'
                    ? 'rgba(16, 185, 129, 0.1)'
                    : 'rgba(99, 102, 241, 0.1)',
                  border: `1px solid ${msg.role === 'user' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`,
                }}>
                  <p style={{
                    fontSize: 14,
                    color: '#e2e8f0',
                    margin: 0,
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                  }}>
                    {msg.content}
                  </p>
                  <p style={{
                    fontSize: 11,
                    color: '#64748b',
                    margin: '8px 0 0 0',
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
                  background: 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                }}>
                  <Loader2 size={16} color="#a5b4fc" className="animate-spin" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: 16,
            borderTop: '1px solid rgba(51, 65, 85, 0.3)',
            display: 'flex',
            gap: 8,
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
                background: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(51, 65, 85, 0.5)',
                color: '#e2e8f0',
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
