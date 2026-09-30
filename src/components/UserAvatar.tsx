import React from 'react';

interface UserAvatarProps {
  avatar?: string | null;
  username?: string | null;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  avatar,
  username,
  size = 36,
  className = '',
  style = {}
}) => {
  const isImage = Boolean(
    avatar &&
    typeof avatar === 'string' &&
    (avatar.startsWith('http://') ||
      avatar.startsWith('https://') ||
      avatar.startsWith('data:image/') ||
      avatar.startsWith('/uploads/') ||
      avatar.startsWith('/') ||
      avatar.length > 30)
  );

  const initials = (() => {
    if (avatar && typeof avatar === 'string' && avatar.length <= 4 && !avatar.startsWith('data:') && !avatar.startsWith('http')) {
      return avatar;
    }
    if (username && typeof username === 'string' && username.trim().length > 0) {
      return username.trim().slice(0, 2).toUpperCase();
    }
    return 'NJ';
  })();

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        borderRadius: '50%',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #6366f1, #9333ea)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 700,
        fontSize: Math.max(11, Math.round(size * 0.38)),
        flexShrink: 0,
        userSelect: 'none',
        ...style
      }}
    >
      {isImage ? (
        <img
          src={avatar as string}
          alt={username || 'Avatar'}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block'
          }}
          onError={(e) => {
            // If image fails to load, replace with initials
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};
