import React from 'react';
import { Home, Compass, Plus, MessageSquare, User } from 'lucide-react';

interface MobileNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onCreatePost: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, onTabChange, onCreatePost }) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Nyumbani' },
    { id: 'explore', icon: Compass, label: 'Gundua' },
    { id: 'create', icon: Plus, label: 'Unda', isCreate: true },
    { id: 'messages', icon: MessageSquare, label: 'Ujumbe' },
    { id: 'profile', icon: User, label: 'Profaili' },
  ];

  return (
    <nav className="mobile-bottom-nav" style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'var(--bg-surface)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid var(--border-app)',
      padding: '8px 0',
      zIndex: 100,
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
    }}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        if (tab.isCreate) {
          return (
            <button
              key={tab.id}
              onClick={onCreatePost}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                padding: '8px 16px',
                borderRadius: 16,
                background: 'linear-gradient(135deg, #6366f1, #9333ea)',
                border: 'none',
                cursor: 'pointer',
                transform: 'translateY(-8px)',
                boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
              }}
            >
              <Icon size={24} color="white" />
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              padding: '8px 16px',
              borderRadius: 12,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: isActive ? 'var(--border-focus)' : 'var(--text-muted)',
              transition: 'all 0.2s ease',
            }}
          >
            <Icon size={24} />
            <span style={{ fontSize: 11, fontWeight: isActive ? 600 : 500 }}>{tab.label}</span>
            {isActive && (
              <div style={{
                width: 4,
                height: 4,
                borderRadius: '50%',
                background: 'var(--border-focus)',
                marginTop: 2,
              }} />
            )}
          </button>
        );
      })}
    </nav>
  );
};
