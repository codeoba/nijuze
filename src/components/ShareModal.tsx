import React, { useState } from 'react';
import { X, Copy, Check, Facebook, Twitter, Linkedin, MessageCircle, Mail } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  postTitle: string;
  postUrl: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, postTitle, postUrl }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const fullUrl = `${window.location.origin}${postUrl}`;
  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedTitle = encodeURIComponent(postTitle);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareLinks = [
    {
      name: 'Facebook',
      icon: Facebook,
      color: '#1877f2',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: '#1da1f2',
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: '#0a66c2',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: '#25d366',
      url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    },
    {
      name: 'Email',
      icon: Mail,
      color: '#ea4335',
      url: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
    },
  ];

  const handleShare = (url: string) => {
    window.open(url, '_blank', 'width=600,height=400');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: 480,
          margin: '0 16px',
          padding: 24,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Shiriki Post</h2>
          <button
            onClick={onClose}
            style={{ padding: 8, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <X size={20} color="#cbd5e1" />
          </button>
        </div>

        {/* Post Title */}
        <div style={{
          padding: 16,
          borderRadius: 12,
          background: 'rgba(30, 41, 59, 0.3)',
          border: '1px solid rgba(51, 65, 85, 0.3)',
          marginBottom: 20,
        }}>
          <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text-main)' }}>
            {postTitle}
          </p>
          <p style={{ fontSize: 12, color: '#64748b', wordBreak: 'break-all' }}>
            {fullUrl}
          </p>
        </div>

        {/* Share Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 }}>
          {shareLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => handleShare(link.url)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                padding: 16,
                borderRadius: 12,
                background: `${link.color}15`,
                border: `1px solid ${link.color}30`,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `${link.color}25`;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = `${link.color}15`;
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <link.icon size={24} color={link.color} />
              <span style={{ fontSize: 11, color: 'var(--text-body)', fontWeight: 500 }}>{link.name}</span>
            </button>
          ))}
        </div>

        {/* Copy Link */}
        <div style={{
          display: 'flex',
          gap: 8,
          padding: 12,
          borderRadius: 12,
          background: 'rgba(30, 41, 59, 0.3)',
          border: '1px solid rgba(51, 65, 85, 0.3)',
        }}>
          <input
            type="text"
            value={fullUrl}
            readOnly
            style={{
              flex: 1,
              padding: 8,
              borderRadius: 8,
              background: 'rgba(15, 23, 42, 0.5)',
              border: '1px solid rgba(51, 65, 85, 0.5)',
              color: 'var(--text-main)',
              fontSize: 13,
            }}
          />
          <button
            onClick={handleCopy}
            className="btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              fontSize: 13,
            }}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Imenakiliwa!' : 'Nakili'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper function to get share URL
export const getShareUrl = (postId: string): string => {
  return `/post/${postId}`;
};
