import React, { useEffect, useState } from 'react';
import { Bell, X, Check } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface RealTimeNotification {
  id: string;
  type: 'upvote' | 'comment' | 'follow' | 'mention' | 'achievement';
  message: string;
  fromUser: string;
  fromAvatar: string;
  timestamp: Date;
  read: boolean;
}

export const RealTimeNotifications: React.FC = () => {
  const { currentUser } = useApp();
  const [notifications, setNotifications] = useState<RealTimeNotification[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [enabled, setEnabled] = useState(true);

  // Simulate real-time notifications (in production, this would use WebSocket)
  useEffect(() => {
    if (!currentUser || !enabled) return;

    // Simulate incoming notifications
    const interval = setInterval(() => {
      const types = ['upvote', 'comment', 'follow', 'mention', 'achievement'] as const;
      const randomType = types[Math.floor(Math.random() * types.length)];
      
      const messages = {
        upvote: 'amepiga upvote post yako',
        comment: 'amejibu post yako',
        follow: 'ameanza kukufuata',
        mention: 'amekutaja kwenye comment',
        achievement: 'Umepata badge mpya!',
      };

      const users = ['Amina H.', 'Juma B.', 'Fatma O.', 'David M.'];
      const avatars = ['AH', 'JB', 'FO', 'DM'];
      const randomIndex = Math.floor(Math.random() * users.length);

      const newNotif: RealTimeNotification = {
        id: Date.now().toString(),
        type: randomType,
        message: `${users[randomIndex]} ${messages[randomType]}`,
        fromUser: users[randomIndex],
        fromAvatar: avatars[randomIndex],
        timestamp: new Date(),
        read: false,
      };

      setNotifications(prev => [newNotif, ...prev].slice(0, 50));

      // Show browser notification if enabled
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Nijuze', {
          body: newNotif.message,
          icon: '/icon-192.png',
        });
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [currentUser, enabled]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'upvote': return '👍';
      case 'comment': return '💬';
      case 'follow': return '👥';
      case 'mention': return '@';
      case 'achievement': return '🏆';
      default: return '🔔';
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'upvote': return '#fbbf24';
      case 'comment': return '#60a5fa';
      case 'follow': return '#a5b4fc';
      case 'mention': return '#c084fc';
      case 'achievement': return '#f472b6';
      default: return '#94a3b8';
    }
  };

  if (!currentUser) return null;

  return (
    <div style={{ position: 'relative' }}>
      {/* Notification Bell */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        style={{
          position: 'relative',
          padding: 10,
          borderRadius: 12,
          background: showPanel ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <Bell size={20} color="#cbd5e1" />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: 4,
            right: 4,
            minWidth: 18,
            height: 18,
            borderRadius: 9,
            background: '#ef4444',
            color: 'white',
            fontSize: 11,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px',
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {showPanel && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: 8,
          width: 400,
          maxHeight: 500,
          background: 'rgba(26, 26, 46, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: 16,
          zIndex: 1000,
          overflow: 'hidden',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Bell size={18} color="#a5b4fc" />
              <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Arifa</h3>
              {unreadCount > 0 && (
                <span style={{
                  padding: '2px 8px',
                  borderRadius: 10,
                  background: 'rgba(239, 68, 68, 0.2)',
                  color: '#fca5a5',
                  fontSize: 12,
                  fontWeight: 600,
                }}>
                  {unreadCount} mpya
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    background: 'rgba(99, 102, 241, 0.1)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    color: '#a5b4fc',
                    fontSize: 12,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Check size={12} />
                  Soma zote
                </button>
              )}
              <button
                onClick={() => setEnabled(!enabled)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  background: enabled ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  border: `1px solid ${enabled ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                  color: enabled ? '#6ee7b7' : '#fca5a5',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                {enabled ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
            {notifications.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: '#64748b' }}>
                <Bell size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                <p style={{ fontSize: 14 }}>Hakuna arifa mpya</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    background: notif.read ? 'transparent' : 'rgba(99, 102, 241, 0.05)',
                    border: notif.read ? '1px solid transparent' : '1px solid rgba(99, 102, 241, 0.2)',
                    marginBottom: 8,
                    cursor: 'pointer',
                    display: 'flex',
                    gap: 12,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = notif.read ? 'transparent' : 'rgba(99, 102, 241, 0.05)'}
                >
                  {/* Avatar */}
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${getColor(notif.type)}, ${getColor(notif.type)}88)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    flexShrink: 0,
                  }}>
                    {getIcon(notif.type)}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, color: '#e2e8f0', marginBottom: 4, lineHeight: 1.4 }}>
                      {notif.message}
                    </p>
                    <p style={{ fontSize: 12, color: '#64748b' }}>
                      {notif.timestamp.toLocaleTimeString('sw-TZ', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notif.id);
                    }}
                    style={{
                      padding: 6,
                      borderRadius: 6,
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      opacity: 0.6,
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                  >
                    <X size={14} color="#64748b" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
