import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Eye, Heart, Plus, Sparkles, Send } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { storiesAPI } from '../services/api';

interface Story {
  id: string;
  userId: string;
  user: any;
  content: string;
  imageUrl?: string;
  backgroundColor: string;
  createdAt: string;
  expiresAt: string;
  views: number;
  likes?: string[];
  isViewed?: boolean;
}

export const StoriesBar: React.FC = () => {
  const { users, currentUser } = useApp();
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [storyIndex, setStoryIndex] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [selectedGradient, setSelectedGradient] = useState('linear-gradient(135deg, #6366f1 0%, #9333ea 100%)');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const gradients = [
    'linear-gradient(135deg, #6366f1 0%, #9333ea 100%)',
    'linear-gradient(135deg, #f43f5e 0%, #fb923c 100%)',
    'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
    'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
    'linear-gradient(135deg, #3b82f6 0%, #2dd4bf 100%)',
  ];

  const fetchStories = async () => {
    try {
      const data = await storiesAPI.getAll();
      if (data && data.length > 0) {
        setStories(data);
        return;
      }
    } catch {}

    // Fallback baseline stories
    const sampleStories: Story[] = users.slice(0, 6).map((user, i) => ({
      id: `story-${i}`,
      userId: user.id,
      user,
      content: [
        'Nimejifunza kitu kipya leo kuhusu React na Node.js! 🎉',
        'Mtu yeyote mwenye uzoefu wa Machine Learning anijuze 🤖',
        'Nashiriki kwenye mashindano ya coding wiki hii 💻',
        'Makala mpya ya usalama wa data inakuja leo 📚',
        'Hongera sana kwa jamii ya Nijuze kwa kufikisha wanachama 10k! 🚀',
        'Habari za asubuhi wadau wote wa teknolojia ❤️',
      ][i % 6],
      backgroundColor: gradients[i % gradients.length],
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      views: Math.floor(Math.random() * 200) + 20,
      isViewed: false,
    }));
    setStories(sampleStories);
  };

  useEffect(() => {
    fetchStories();
  }, [users]);

  const handleStoryClick = (story: Story, index: number) => {
    setSelectedStory(story);
    setStoryIndex(index);
    setStories(prev => prev.map(s => s.id === story.id ? { ...s, isViewed: true, views: s.views + 1 } : s));
    try {
      storiesAPI.view(story.id);
    } catch {}
  };

  const handleCreateStory = async () => {
    if (!newContent.trim() || !currentUser) return;
    setIsSubmitting(true);
    try {
      await storiesAPI.create({ content: newContent, backgroundColor: selectedGradient });
    } catch {}

    // Add locally to feed
    const myNewStory: Story = {
      id: `story-${Date.now()}`,
      userId: currentUser.id,
      user: currentUser,
      content: newContent,
      backgroundColor: selectedGradient,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      views: 0,
      isViewed: false,
    };

    setStories(prev => [myNewStory, ...prev]);
    setNewContent('');
    setShowCreateModal(false);
    setIsSubmitting(false);
  };

  return (
    <>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '12px 4px',
        overflowX: 'auto',
        marginBottom: 16,
        scrollbarWidth: 'none',
      }}>
        {/* Current user Add Story button */}
        {currentUser && (
          <div
            onClick={() => setShowCreateModal(true)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              minWidth: 68,
              textAlign: 'center',
            }}
          >
            <div style={{
              width: 58,
              height: 58,
              borderRadius: '50%',
              padding: 2,
              background: 'linear-gradient(135deg, #6366f1, #9333ea)',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: 'var(--bg-surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 'bold',
                color: 'var(--text-main)',
              }}>
                {currentUser.avatar || 'NJ'}
              </div>
              <div style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#6366f1',
                border: '2px solid var(--bg-surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}>
                <Plus size={12} strokeWidth={3} />
              </div>
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, maxWidth: 68, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Weka Story
            </span>
          </div>
        )}

        {/* Stories list */}
        {stories.map((story, index) => (
          <div
            key={story.id}
            onClick={() => handleStoryClick(story, index)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              minWidth: 68,
              textAlign: 'center',
            }}
          >
            <div style={{
              width: 58,
              height: 58,
              borderRadius: '50%',
              padding: 2,
              background: story.isViewed ? 'rgba(100, 116, 139, 0.4)' : 'linear-gradient(135deg, #f43f5e, #fb923c)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.2s',
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: 'var(--bg-surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 'bold',
                color: 'var(--text-main)',
              }}>
                {story.user?.avatar || story.user?.username?.slice(0, 2).toUpperCase() || 'NJ'}
              </div>
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-body)', marginTop: 4, maxWidth: 68, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {story.user?.username ? story.user.username.split(' ')[0] : 'Mwanachama'}
            </span>
          </div>
        ))}
      </div>

      {/* Story Viewer Modal */}
      {selectedStory && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedStory(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 420,
              height: 600,
              borderRadius: 24,
              background: selectedStory.backgroundColor,
              padding: 24,
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
            }}
          >
            {/* Top header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {selectedStory.user?.avatar || 'NJ'}
                </div>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: 14 }}>{selectedStory.user?.username || 'Mwanachama'}</div>
                  <div style={{ fontSize: 11, opacity: 0.8 }}>Masaa 24</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedStory(null)}
                style={{ background: 'rgba(0,0,0,0.3)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Content text */}
            <div style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.4, textAlign: 'center', margin: 'auto 0', textShadow: '0 2px 4px rgba(0,0,0,0.4)' }}>
              {selectedStory.content}
            </div>

            {/* Bottom info */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: 0.9, fontSize: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Eye size={15} />
                <span>{selectedStory.views} watazamaji</span>
              </div>
              <div>Nijuze Stories ✨</div>
            </div>
          </div>
        </div>
      )}

      {/* Create Story Modal */}
      {showCreateModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowCreateModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            className="glass-card"
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: 460, padding: 24 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>Chapisha Story ya Masaa 24</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Live Preview Box */}
            <div style={{
              height: 200,
              borderRadius: 16,
              background: selectedGradient,
              padding: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              color: 'white',
              fontSize: 18,
              fontWeight: 600,
              marginBottom: 16,
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
            }}>
              {newContent || 'Andika maneno ya story yako hapa...'}
            </div>

            <textarea
              placeholder="Unafikiria nini leo? Andika hapa..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: 12,
                borderRadius: 12,
                background: 'var(--input-bg)',
                border: '1px solid var(--input-border)',
                color: 'var(--input-text)',
                marginBottom: 16,
                resize: 'none',
              }}
            />

            {/* Gradient Selector */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Chagua Rangi:</div>
              <div style={{ display: 'flex', gap: 10 }}>
                {gradients.map((grad, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedGradient(grad)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: grad,
                      cursor: 'pointer',
                      border: selectedGradient === grad ? '2px solid white' : 'none',
                      transform: selectedGradient === grad ? 'scale(1.15)' : 'none',
                      transition: 'all 0.2s',
                    }}
                  />
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => setShowCreateModal(false)} className="btn-ghost">Ghairi</button>
              <button
                onClick={handleCreateStory}
                disabled={!newContent.trim() || isSubmitting}
                className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
              >
                <Send size={16} />
                <span>{isSubmitting ? 'Inachapisha...' : 'Chapisha Sasa'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
