import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Search, MessageCircle, User, Users } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
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

  useEffect(() => {
    if (isOpen && currentUser) {
      // Initialize conversations with sample data
      const sampleConversations: Conversation[] = users
        .filter(u => u.id !== currentUser.id)
        .slice(0, 5)
        .map(user => ({
          userId: user.id,
          user,
          lastMessage: 'Habari! Unaendeleaje?',
          lastMessageTime: new Date(Date.now() - Math.random() * 86400000).toISOString(),
          unreadCount: Math.floor(Math.random() * 3),
        }));
      setConversations(sampleConversations);
    }
  }, [isOpen, currentUser, users]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversation(conv);
    // Load sample messages
    const sampleMessages: Message[] = [
      {
        id: '1',
        senderId: conv.userId,
        receiverId: currentUser?.id || '',
        content: 'Habari! Unaendeleaje?',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        isRead: true,
      },
      {
        id: '2',
        senderId: currentUser?.id || '',
        receiverId: conv.userId,
        content: 'Nzuri sana! Wewe?',
        timestamp: new Date(Date.now() - 3500000).toISOString(),
        isRead: true,
      },
      {
        id: '3',
        senderId: conv.userId,
        receiverId: currentUser?.id || '',
        content: 'Niko sawa. Nimeona post yako kuhusu Machine Learning. Ni nzuri sana!',
        timestamp: new Date(Date.now() - 3400000).toISOString(),
        isRead: true,
      },
    ];
    setMessages(sampleMessages);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation || !currentUser) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      receiverId: selectedConversation.userId,
      content: newMessage,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    setMessages([...messages, message]);
    setNewMessage('');

    // Update conversation
    setConversations(conversations.map(conv =>
      conv.userId === selectedConversation.userId
        ? { ...conv, lastMessage: newMessage, lastMessageTime: message.timestamp }
        : conv
    ));
  };

  const filteredConversations = conversations.filter(conv =>
    conv.user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: 900,
          height: '80vh',
          margin: '0 16px',
          display: 'flex',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Conversations List */}
        <div style={{
          width: selectedConversation ? 300 : '100%',
          borderRight: selectedConversation ? '1px solid rgba(51, 65, 85, 0.3)' : 'none',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Header */}
          <div style={{
            padding: 16,
            borderBottom: '1px solid rgba(51, 65, 85, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              <MessageCircle size={20} color="#818cf8" />
              Ujumbe
            </h3>
            <button
              onClick={onClose}
              style={{ padding: 8, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              <X size={20} color="#cbd5e1" />
            </button>
          </div>

          {/* Search */}
          <div style={{ padding: 12, borderBottom: '1px solid rgba(51, 65, 85, 0.3)' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Tafuta..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  borderRadius: 8,
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(51, 65, 85, 0.5)',
                  color: '#e2e8f0',
                  fontSize: 14,
                }}
              />
            </div>
          </div>

          {/* Conversations */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredConversations.map((conv) => (
              <div
                key={conv.userId}
                onClick={() => handleSelectConversation(conv)}
                style={{
                  padding: 12,
                  cursor: 'pointer',
                  background: selectedConversation?.userId === conv.userId ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                  borderBottom: '1px solid rgba(51, 65, 85, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div style={{ position: 'relative' }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1, #9333ea)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    fontWeight: 'bold',
                  }}>
                    {conv.user.avatar}
                  </div>
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: '#10b981',
                    border: '2px solid #0f0f23',
                  }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 600 }}>{conv.user.username}</h4>
                    {conv.unreadCount > 0 && (
                      <span style={{
                        background: '#6366f1',
                        color: 'white',
                        fontSize: 11,
                        padding: '2px 6px',
                        borderRadius: 10,
                        fontWeight: 600,
                      }}>
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <p style={{
                    fontSize: 13,
                    color: '#94a3b8',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {conv.lastMessage}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        {selectedConversation && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Chat Header */}
            <div style={{
              padding: 16,
              borderBottom: '1px solid rgba(51, 65, 85, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}>
              <button
                onClick={() => setSelectedConversation(null)}
                style={{ padding: 8, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', display: 'none' }}
              >
                <X size={20} color="#cbd5e1" />
              </button>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #9333ea)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 'bold',
              }}>
                {selectedConversation.user.avatar}
              </div>
              <div>
                <h4 style={{ fontSize: 15, fontWeight: 600 }}>{selectedConversation.user.username}</h4>
                <p style={{ fontSize: 12, color: '#10b981' }}>Online</p>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    justifyContent: msg.senderId === currentUser?.id ? 'flex-end' : 'flex-start',
                    marginBottom: 12,
                  }}
                >
                  <div style={{
                    maxWidth: '70%',
                    padding: '10px 14px',
                    borderRadius: 16,
                    background: msg.senderId === currentUser?.id
                      ? 'linear-gradient(135deg, #6366f1, #9333ea)'
                      : 'rgba(30, 41, 59, 0.5)',
                    color: msg.senderId === currentUser?.id ? 'white' : '#e2e8f0',
                    fontSize: 14,
                    lineHeight: 1.5,
                  }}>
                    {msg.content}
                    <div style={{
                      fontSize: 11,
                      color: msg.senderId === currentUser?.id ? 'rgba(255,255,255,0.7)' : '#64748b',
                      marginTop: 4,
                      textAlign: 'right',
                    }}>
                      {new Date(msg.timestamp).toLocaleTimeString('sw-TZ', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div style={{
              padding: 16,
              borderTop: '1px solid rgba(51, 65, 85, 0.3)',
              display: 'flex',
              gap: 12,
            }}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Andika ujumbe..."
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: 20,
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(51, 65, 85, 0.5)',
                  color: '#e2e8f0',
                  fontSize: 14,
                }}
              />
              <button
                onClick={handleSendMessage}
                className="btn-primary"
                style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!selectedConversation && (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
          }}>
            <Users size={64} style={{ marginBottom: 16, opacity: 0.3 }} />
            <p style={{ fontSize: 16, fontWeight: 500 }}>Chagua mazungumzo</p>
            <p style={{ fontSize: 14 }}>Anza mazungumzo na watumiaji wengine</p>
          </div>
        )}
      </div>
    </div>
  );
};
