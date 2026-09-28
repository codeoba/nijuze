import React from 'react';
import { Home, Compass, Plus, MessageSquare, User, LogIn } from 'lucide-react';
import { useRouter } from '../router/Router';
import { useApp } from '../contexts/AppContext';

interface MobileBottomNavProps {
  onOpenCreatePost?: () => void;
  onOpenChat?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onOpenCreatePost,
  onOpenChat,
}) => {
  const { currentPath, navigate } = useRouter();
  const { currentUser, isAuthenticated } = useApp();

  const handleHomeClick = () => {
    if (currentPath === '/' || currentPath === '') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  const handleForumClick = () => {
    navigate('/forum');
  };

  const handleCreateClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (onOpenCreatePost) {
      onOpenCreatePost();
    }
    window.dispatchEvent(new CustomEvent('openCreatePost'));
  };

  const handleChatClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (onOpenChat) {
      onOpenChat();
    }
    window.dispatchEvent(new CustomEvent('openChatModal'));
  };

  const handleProfileClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (currentUser?.id) {
      navigate(`/profile/${currentUser.id}`);
    } else {
      navigate('/profile');
    }
  };

  const isHomeActive = currentPath === '/' || currentPath === '';
  const isForumActive = currentPath === '/forum';
  const isProfileActive = currentPath.startsWith('/profile') || currentPath === '/login';

  return (
    <nav
      className="mobile-bottom-nav"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'var(--bg-surface)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--border-app)',
        paddingTop: 6,
        paddingBottom: 'calc(6px + env(safe-area-inset-bottom, 0px))',
        paddingLeft: 8,
        paddingRight: 8,
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        touchAction: 'manipulation',
      }}
    >
      {/* 1. Nyumbani */}
      <button
        onClick={handleHomeClick}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
          padding: '6px 12px',
          borderRadius: 12,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: isHomeActive ? 'var(--border-focus)' : 'var(--text-muted)',
          transition: 'all 0.2s ease',
          minWidth: 54,
        }}
      >
        <Home size={22} />
        <span style={{ fontSize: 11, fontWeight: isHomeActive ? 700 : 500 }}>Nyumbani</span>
        {isHomeActive && (
          <div
            style={{
              width: 4,
              height: 4,
              borderRadius: '50%',
              background: 'var(--border-focus)',
              marginTop: 1,
            }}
          />
        )}
      </button>

      {/* 2. Mijadala (Forum) */}
      <button
        onClick={handleForumClick}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
          padding: '6px 12px',
          borderRadius: 12,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: isForumActive ? 'var(--border-focus)' : 'var(--text-muted)',
          transition: 'all 0.2s ease',
          minWidth: 54,
        }}
      >
        <Compass size={22} />
        <span style={{ fontSize: 11, fontWeight: isForumActive ? 700 : 500 }}>Mijadala</span>
        {isForumActive && (
          <div
            style={{
              width: 4,
              height: 4,
              borderRadius: '50%',
              background: 'var(--border-focus)',
              marginTop: 1,
            }}
          />
        )}
      </button>

      {/* 3. Unda Swali / Post (+) */}
      <button
        onClick={handleCreateClick}
        title="Unda Swali au Chapisho"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1, #9333ea)',
          border: 'none',
          cursor: 'pointer',
          transform: 'translateY(-10px)',
          boxShadow: '0 4px 18px rgba(99, 102, 241, 0.45)',
          color: 'white',
          flexShrink: 0,
        }}
      >
        <Plus size={26} strokeWidth={2.5} color="white" />
      </button>

      {/* 4. Ujumbe (Chat) */}
      <button
        onClick={handleChatClick}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
          padding: '6px 12px',
          borderRadius: 12,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          transition: 'all 0.2s ease',
          minWidth: 54,
        }}
      >
        <MessageSquare size={22} />
        <span style={{ fontSize: 11, fontWeight: 500 }}>Ujumbe</span>
      </button>

      {/* 5. Wasifu / Ingia */}
      <button
        onClick={handleProfileClick}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
          padding: '6px 12px',
          borderRadius: 12,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: isProfileActive ? 'var(--border-focus)' : 'var(--text-muted)',
          transition: 'all 0.2s ease',
          minWidth: 54,
        }}
      >
        {isAuthenticated ? <User size={22} /> : <LogIn size={22} />}
        <span style={{ fontSize: 11, fontWeight: isProfileActive ? 700 : 500 }}>
          {isAuthenticated ? 'Wasifu' : 'Ingia'}
        </span>
        {isProfileActive && (
          <div
            style={{
              width: 4,
              height: 4,
              borderRadius: '50%',
              background: 'var(--border-focus)',
              marginTop: 1,
            }}
          />
        )}
      </button>
    </nav>
  );
};
