import React from 'react';
import { Share2, Facebook, Twitter, Linkedin, Link2, Mail, Check } from 'lucide-react';

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
}

export const SocialShare: React.FC<SocialShareProps> = ({ url, title, description }) => {
  const [copied, setCopied] = React.useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description || '');

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
      icon: Share2,
      color: '#25d366',
      url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    },
    {
      name: 'Email',
      icon: Mail,
      color: '#ea4335',
      url: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
    },
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = (shareUrl: string) => {
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  return (
    <div className="glass-card" style={{ padding: 20 }}>
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Share2 size={18} color="#a5b4fc" />
        Shiriki Post
      </h3>

      {/* Social Media Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 12, marginBottom: 16 }}>
        {shareLinks.map((link) => {
          const Icon = link.icon;
          return (
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
              <Icon size={24} color={link.color} />
              <span style={{ fontSize: 12, color: 'var(--text-body)', fontWeight: 500 }}>{link.name}</span>
            </button>
          );
        })}
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
          value={url}
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
          onClick={handleCopyLink}
          className="btn-primary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 16px',
            fontSize: 13,
          }}
        >
          {copied ? <Check size={16} /> : <Link2 size={16} />}
          {copied ? 'Imenakiliwa!' : 'Nakili'}
        </button>
      </div>
    </div>
  );
};
