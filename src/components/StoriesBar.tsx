import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Eye, Heart, MessageCircle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

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
  likes: string[];
  isViewed: boolean;
}

export const StoriesBar: React.FC = () => {
  const { users, currentUser } = useApp();
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [storyIndex, setStoryIndex] = useState(0);

  useEffect(() => {
    // Generate sample stories
    const sampleStories: Story[] = users.slice(0, 8).map((user, i) => ({
      id: `story-${i}`,
      userId: user.id,
      user,
      content: [
        'Nimejifunza kitu kipya leo! 🎉',
        'Mtu yeyote ana resources za Machine Learning?',
        'Working on a new project 💻',
        'Just finished reading "Clean Code" 📚',
        'Looking for collaborators for AI project 🤖',
        'Amazing day at the tech conference! 🚀',
        'New blog post about React patterns 📝',
        'Grateful for this community ❤️',
      ][i],
      backgroundColor: [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
        'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      ][i],
      createdAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      expiresAt: new Date(Date.now() + Math.random() * 86400000).toISOString(),
      views: Math.floor(Math.random() * 500) + 100,
      likes: users.slice(0, Math.floor(Math.random() * 5)).map(u => u.id),
      isViewed: Math.random() > 0.5,
    }));
    setStories(sampleStories);
  }, [users]);

  const handleStoryClick = (story: Story, index: number) => {
    setSelectedStory(story);
    setStoryIndex(index);
    // Mark as viewed
    setStories(stories.map(s => s.id === story.id ? { ...s, isViewed: true } : s));
  };

  const handleNextStory = () => {
    if (storyIndex < stories.length - 1) {
      const nextIndex = storyIndex + 1;
      setSelectedStory(stories[nextIndex]);
      setStoryIndex(nextIndex);
      setStories(stories.map(s => s.id === stories[nextIndex].id ? { ...s, isViewed: true } : s));
    } else {
      setSelectedStory(null);
    }
  };

  const handlePrevStory = () => {
    if (storyIndex > 0) {
      const prevIndex = storyIndex - 1;
      setSelectedStory(stories[prevIndex]);
      setStoryIndex(prevIndex);
    }
  };

  const handleLikeStory = () => {
    if (!selectedStory || !currentUser) return;
    setStories(stories.map(s => {
      if (s.id === selectedStory.id) {
        const isLiked = s.likes.includes(currentUser.id);
        return {
          ...s,
          likes: isLiked
            ? s.likes.filter(id => id !== currentUser.id)
            : [...s.likes, currentUser.id],
        };
      }
      return s;
    }));
  };

  return (
    <>
      {/* Stories Bar */}
      <div className="glass-card" style={{ padding: 16, marginBottom: 16, overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: 16, minWidth: 'max-content' }}>
          {/* Add Story Button */}
          {currentUser && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
              <div style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #9333ea)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                fontWeight: 'bold',
                border: '3px solid #0f0f23',
                position: 'relative',
              }}>
                {currentUser.avatar}
                <div style={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: '#6366f1',
                  border: '2px solid #0f0f23',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                }}>
                  +
                </div>
              </div>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>Ongeza</span>
            </div>
          )}

          {/* Stories */}
          {stories.map((story, index) => (
            <div
              key={story.id}
              onClick={() => handleStoryClick(story, index)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                cursor: 'pointer',
              }}
            >
              <div style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                padding: 3,
                background: story.isViewed
                  ? 'rgba(100, 116, 139, 0.5)'
                  : 'linear-gradient(135deg, #6366f1, #9333ea, #ec4899)',
              }}>
                <div style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: story.backgroundColor,
                  border: '3px solid #0f0f23',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  fontWeight: 'bold',
                }}>
                  {story.user.avatar}
                </div>
              </div>
              <span style={{ fontSize: 11, color: '#94a3b8', maxWidth: 64, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {story.user.username.split(' ')[0]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Story Viewer Modal */}
      {selectedStory && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedStory(null)}
          style={{ background: 'rgba(0, 0, 0, 0.95)' }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 480,
              height: '90vh',
              maxHeight: 800,
              borderRadius: 16,
              background: selectedStory.backgroundColor,
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Progress Bar */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: 12, zIndex: 10 }}>
              <div style={{
                height: 3,
                background: 'rgba(255, 255, 255, 0.3)',
                borderRadius: 2,
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  background: 'white',
                  width: '100%',
                  animation: 'storyProgress 5s linear',
                }} />
              </div>
            </div>

            {/* Header */}
            <div style={{
              padding: '40px 16px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              zIndex: 10,
            }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                fontWeight: 'bold',
              }}>
                {selectedStory.user.avatar}
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>
                  {selectedStory.user.username}
                </h4>
                <p style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.7)' }}>
                  {new Date(selectedStory.createdAt).toLocaleTimeString('sw-TZ', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <button
                onClick={() => setSelectedStory(null)}
                style={{
                  padding: 8,
                  borderRadius: 8,
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <X size={20} color="white" />
              </button>
            </div>

            {/* Content */}
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
              textAlign: 'center',
            }}>
              <p style={{
                fontSize: 24,
                fontWeight: 600,
                color: 'white',
                lineHeight: 1.5,
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
              }}>
                {selectedStory.content}
              </p>
            </div>

            {/* Footer */}
            <div style={{
              padding: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(0, 0, 0, 0.2)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button
                  onClick={handleLikeStory}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 16px',
                    borderRadius: 20,
                    background: selectedStory.likes.includes(currentUser?.id || '')
                      ? 'rgba(239, 68, 68, 0.3)'
                      : 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: 14,
                  }}
                >
                  <Heart
                    size={18}
                    fill={selectedStory.likes.includes(currentUser?.id || '') ? '#ef4444' : 'none'}
                  />
                  <span>{selectedStory.likes.length}</span>
                </button>
                <button style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  borderRadius: 20,
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: 14,
                }}>
                  <MessageCircle size={18} />
                  <span>Jibu</span>
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255, 255, 255, 0.7)', fontSize: 13 }}>
                <Eye size={16} />
                <span>{selectedStory.views}</span>
              </div>
            </div>

            {/* Navigation Arrows */}
            {storyIndex > 0 && (
              <button
                onClick={handlePrevStory}
                style={{
                  position: 'absolute',
                  left: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  padding: 12,
                  borderRadius: '50%',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <ChevronLeft size={24} color="white" />
              </button>
            )}
            {storyIndex < stories.length - 1 && (
              <button
                onClick={handleNextStory}
                style={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  padding: 12,
                  borderRadius: '50%',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <ChevronRight size={24} color="white" />
              </button>
            )}

            {/* Click areas for navigation */}
            <div
              onClick={handlePrevStory}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '30%',
                height: '100%',
                cursor: 'pointer',
              }}
            />
            <div
              onClick={handleNextStory}
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                width: '30%',
                height: '100%',
                cursor: 'pointer',
              }}
            />
          </div>
        </div>
      )}

      <style>{`
        @keyframes storyProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </>
  );
};
