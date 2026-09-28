import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Search, MessageCircle, User, Users } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { messagesAPI } from '../services/api';

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

export const ChatModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { users, currentUser } = useApp();
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
        return;
      }
    } catch {}

    // Fallback: list of actual users to message
    const sampleConversations: Conversation[] = users
      .filter(u => u.id !== currentUser.id)
      .slice(0, 8)
      .map(user => ({
        userId: user.id,
        user,
        lastMessage: 'Habari! Ninaweza kukusaidia?',
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0,
      }));
    setConversations(sampleConversations);
  }, [currentUser, users]);

  // Load messages for selected conversation
  const loadMessages = useCallback(async (userId: string) => {
    try {
      const msgs = await messagesAPI.getMessages(userId);
      if (msgs && msgs.length > 0) {
        setMessages(msgs);
        return;
      }
    } catch {}

    // Initial greeting if empty
    setMessages([
      {
        id: 'msg-init',
        senderId: userId,
        content: `Habari! Mimi ni ${selectedConversation?.user?.username || 'mwanachama mwenzako'}. Karibu tuzungumze hapa Nijuze!`,
        timestamp: new Date().toISOString(),
      }
    ]);
  }, [selectedConversation]);

  useEffect(() => {
    if (isOpen && currentUser) {
      loadConversations();
    }
  }, [isOpen, currentUser, loadConversations]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.userId);
      // Poll every 4 seconds for new incoming messages
      const interval = setInterval(() => {
        loadMessages(selectedConversation.userId);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversation(conv);
    loadMessages(conv.userId);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !currentUser) return;

    const messageText = newMessage;
    setNewMessage('');

    // Optimistic UI update
    const optimisticMsg: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      receiverId: selectedConversation.userId,
      content: messageText,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    setMessages(prev => [...prev, optimisticMsg]);

    try {
      await messagesAPI.send(selectedConversation.userId, messageText);
    } catch {}
  };

  if (!isOpen) return null;

  const filteredConversations = conversations.filter(c =>
    c.user?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 100 }}>
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: 900,
          height: 600,
          margin: '0 16px',
          display: 'flex',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left: Conversations list */}
        <div style={{
          width: 320,
          borderRight: '1px solid var(--border-app)',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-subtle)',
        }}>
          {/* Header */}
          <div style={{ padding: 16, borderBottom: '1px solid var(--border-app)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MessageCircle size={20} color="#6366f1" />
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)' }}>Ujumbe wa Moja kwa Moja</h3>
              </div>
            </div>
            <div style={{ position: 'relative' }}>
              <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Tafuta mazungumzo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 32px',
                  borderRadius: 8,
                  background: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  color: 'var(--input-text)',
                  fontSize: 12,
                }}
              />
            </div>
          </div>

          {/* Conversation items */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredConversations.map((conv) => {
              const isSelected = selectedConversation?.userId === conv.userId;
              return (
                <div
                  key={conv.userId}
                  onClick={() => handleSelectConversation(conv)}
                  style={{
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                    borderLeft: isSelected ? '3px solid #6366f1' : '3px solid transparent',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1, #9333ea)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: 13,
                    color: 'white',
                  }}>
                    {conv.user?.avatar || conv.user?.username?.slice(0, 2).toUpperCase() || 'NJ'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{conv.user?.username || 'Mwanachama'}</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {conv.lastMessage}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Message Window */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {selectedConversation ? (
            <>
              {/* Header */}
              <div style={{
                padding: '12px 20px',
                borderBottom: '1px solid var(--border-app)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1, #9333ea)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: 12,
                    color: 'white',
                  }}>
                    {selectedConversation.user?.avatar || 'NJ'}
                  </div>
                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 600, margin: 0, color: 'var(--text-main)' }}>{selectedConversation.user?.username}</h4>
                    <span style={{ fontSize: 11, color: '#22c55e' }}>Mtandaoni</span>
                  </div>
                </div>
                <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              {/* Message history */}
              <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {messages.map((msg, i) => {
                  const isMine = (msg.senderId || msg.sender_id) === currentUser?.id;
                  return (
                    <div
                      key={msg.id || i}
                      style={{
                        alignSelf: isMine ? 'flex-end' : 'flex-start',
                        maxWidth: '70%',
                        padding: '10px 16px',
                        borderRadius: 16,
                        background: isMine ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'var(--bg-subtle)',
                        color: isMine ? 'white' : 'var(--text-main)',
                        border: isMine ? 'none' : '1px solid var(--border-app)',
                        fontSize: 13,
                        lineHeight: 1.4,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                      }}
                    >
                      {msg.content}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input form */}
              <form onSubmit={handleSendMessage} style={{ padding: 16, borderTop: '1px solid var(--border-app)', display: 'flex', gap: 10 }}>
                <input
                  type="text"
                  placeholder="Andika ujumbe wako hapa..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    borderRadius: 12,
                    background: 'var(--input-bg)',
                    border: '1px solid var(--input-border)',
                    color: 'var(--input-text)',
                    fontSize: 13,
                  }}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 18px', cursor: 'pointer' }}
                >
                  <Send size={16} />
                </button>
              </form>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <MessageCircle size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
              <p style={{ fontSize: 14 }}>Chagua mtumiaji kuanza mazungumzo</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
