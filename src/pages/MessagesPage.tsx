import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from '../router/Router';
import { useApp } from '../contexts/AppContext';
import { messagesAPI } from '../services/api';
import {
  MessageSquare, Send, Search, User, ArrowLeft, ChevronRight,
  Clock, CheckCircle2, AlertCircle, Smile
} from 'lucide-react';

interface Message {
  id: string;
  senderId?: string;
  sender_id?: string;
  receiverId?: string;
  receiver_id?: string;
  content: string;
  timestamp?: string;
  created_at?: string;
  isRead?: boolean;
}

interface Conversation {
  userId: string;
  user: any;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export const MessagesPage: React.FC = () => {
  const { navigate } = useRouter();
  const { users, currentUser, isAuthenticated } = useApp();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!currentUser) return;
    try {
      const data = await messagesAPI.getConversations();
      if (data && data.length > 0) {
        setConversations(data);
        if (!selectedConversation) {
          setSelectedConversation(data[0]);
        }
        return;
      }
    } catch {}

    // Fallback: list of actual users to message
    const sampleConversations: Conversation[] = users
      .filter((u) => u.id !== currentUser.id)
      .slice(0, 10)
      .map((user) => ({
        userId: user.id,
        user,
        lastMessage: 'Habari! Karibu tubadilishane mawazo.',
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0,
      }));
    setConversations(sampleConversations);
    if (sampleConversations.length > 0 && !selectedConversation) {
      setSelectedConversation(sampleConversations[0]);
    }
  }, [currentUser, users, selectedConversation]);

  // Load messages for selected conversation
  const loadMessages = useCallback(async (userId: string) => {
    try {
      const data = await messagesAPI.getMessages(userId);
      setMessages(data || []);
    } catch {
      // Fallback local conversation history
      setMessages([
        {
          id: '1',
          senderId: userId,
          content: 'Habari yako! Karibu tuzungumze kuhusu jukwaa la Nijuze.',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
      ]);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadConversations();
    }
  }, [isAuthenticated, loadConversations]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.userId);
    }
  }, [selectedConversation, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isAuthenticated) {
    return (
      <div style={{ maxWidth: 640, margin: '60px auto', padding: '0 16px' }}>
        <div className="glass-card" style={{ padding: 48, textAlign: 'center' }}>
          <AlertCircle size={48} color="#6366f1" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>
            Ingia Ili Kutumia Ujumbe (Chat)
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>
            Unahitaji kuwa umeingia kwenye akaunti yako ili uweze kutuma na kupokea jumbe za kibinafsi na wanajamii wengine.
          </p>
          <button onClick={() => navigate('/login')} className="btn-primary" style={{ padding: '10px 24px', cursor: 'pointer' }}>
            Ingia Kwenye Akaunti
          </button>
        </div>
      </div>
    );
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !currentUser) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    // Optimistic UI update
    const tempMsg: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      receiverId: selectedConversation.userId,
      content: messageText,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      await messagesAPI.sendMessage(selectedConversation.userId, messageText);
    } catch {}
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredConversations = conversations.filter((c) =>
    (c.user?.username || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 1160, margin: '0 auto', paddingBottom: 64 }}>
      {/* Breadcrumb Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>
            Nyumbani
          </button>
          <ChevronRight size={14} />
          <span style={{ color: 'var(--btn-ghost-text)', fontWeight: 600 }}>Ujumbe na Soga (Messages)</span>
        </div>

        <button
          onClick={() => navigate('/')}
          className="btn-ghost"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '6px 14px', cursor: 'pointer' }}
        >
          <ArrowLeft size={16} /> Rudi Nyumbani
        </button>
      </div>

      {/* Main Messaging Container */}
      <div
        className="glass-card"
        style={{
          display: 'grid',
          gridTemplateColumns: '320px 1fr',
          height: '75vh',
          minHeight: 550,
          overflow: 'hidden',
          borderRadius: 20,
          border: '1px solid var(--border-app)',
        }}
      >
        {/* Left: Conversations Sidebar */}
        <div
          style={{
            borderRight: '1px solid var(--border-app)',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--bg-subtle)',
          }}
        >
          {/* Header & Search */}
          <div style={{ padding: 18, borderBottom: '1px solid var(--border-app)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-main)', marginBottom: 14 }}>
              Ujumbe Wangu
            </h2>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tafuta mwanachama..."
                style={{
                  width: '100%',
                  paddingLeft: 34,
                  paddingRight: 12,
                  paddingTop: 8,
                  paddingBottom: 8,
                  borderRadius: 10,
                  background: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  color: 'var(--input-text)',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Conversations List */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredConversations.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                Hakuna mazungumzo
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = selectedConversation?.userId === conv.userId;
                return (
                  <div
                    key={conv.userId}
                    onClick={() => setSelectedConversation(conv)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '14px 16px',
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--border-app)',
                      background: isSelected ? 'var(--btn-ghost-bg)' : 'transparent',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1, #9333ea)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14,
                        fontWeight: 'bold',
                        color: 'white',
                        flexShrink: 0,
                      }}
                    >
                      {conv.user?.avatar || 'NJ'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                        <span style={{ fontSize: 14, fontWeight: isSelected ? 700 : 600, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {conv.user?.username || 'Mwanachama'}
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                        {conv.lastMessage}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Active Chat Window */}
        {selectedConversation ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Chat Header */}
            <div
              style={{
                padding: '14px 20px',
                borderBottom: '1px solid var(--border-app)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--bg-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    fontWeight: 'bold',
                    color: 'white',
                  }}
                >
                  {selectedConversation.user?.avatar || 'NJ'}
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                    {selectedConversation.user?.username}
                  </h3>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {selectedConversation.user?.role || 'Mwanachama wa Nijuze'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate(`/profile/${selectedConversation.userId}`)}
                className="btn-ghost"
                style={{ fontSize: 12, padding: '4px 10px' }}
              >
                Tazama Wasifu
              </button>
            </div>

            {/* Messages Scroll Area */}
            <div style={{ flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {messages.map((msg) => {
                const isMe = (msg.senderId || msg.sender_id) === currentUser?.id;
                return (
                  <div
                    key={msg.id}
                    style={{
                      alignSelf: isMe ? 'flex-end' : 'flex-start',
                      maxWidth: '70%',
                    }}
                  >
                    <div
                      style={{
                        padding: '10px 16px',
                        borderRadius: 16,
                        background: isMe
                          ? 'linear-gradient(135deg, #6366f1, #7c3aed)'
                          : 'var(--bg-subtle)',
                        border: isMe ? 'none' : '1px solid var(--border-app)',
                        color: isMe ? 'white' : 'var(--text-main)',
                        fontSize: 14,
                        lineHeight: 1.5,
                        borderBottomRightRadius: isMe ? 4 : 16,
                        borderBottomLeftRadius: isMe ? 16 : 4,
                      }}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Box */}
            <div
              style={{
                padding: '14px 20px',
                borderTop: '1px solid var(--border-app)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: 'var(--bg-subtle)',
              }}
            >
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Andika ujumbe wako hapa..."
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  color: 'var(--input-text)',
                  fontSize: 14,
                  outline: 'none',
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  height: 44,
                  padding: '0 20px',
                  borderRadius: 12,
                  cursor: newMessage.trim() ? 'pointer' : 'default',
                  opacity: newMessage.trim() ? 1 : 0.6,
                }}
              >
                <Send size={16} />
                <span>Tuma</span>
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
            Chagua mazungumzo kuanza kuwasiliana
          </div>
        )}
      </div>
    </div>
  );
};
