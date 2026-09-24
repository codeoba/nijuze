import React, { useState } from 'react';
import { GripVertical, Pin, Archive, Trash2 } from 'lucide-react';

interface DraggablePost {
  id: string;
  title: string;
  category: string;
  pinned: boolean;
  archived: boolean;
}

interface DragDropPostsProps {
  posts: DraggablePost[];
  onReorder: (posts: DraggablePost[]) => void;
}

export const DragDropPosts: React.FC<DragDropPostsProps> = ({ posts, onReorder }) => {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, postId: string) => {
    setDraggedItem(postId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, postId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverItem(postId);
  };

  const handleDragLeave = () => {
    setDragOverItem(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem === targetId) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }

    const draggedIndex = posts.findIndex(p => p.id === draggedItem);
    const targetIndex = posts.findIndex(p => p.id === targetId);

    const newPosts = [...posts];
    const [draggedPost] = newPosts.splice(draggedIndex, 1);
    newPosts.splice(targetIndex, 0, draggedPost);

    onReorder(newPosts);
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const togglePin = (postId: string) => {
    const newPosts = posts.map(p =>
      p.id === postId ? { ...p, pinned: !p.pinned } : p
    );
    onReorder(newPosts);
  };

  const toggleArchive = (postId: string) => {
    const newPosts = posts.map(p =>
      p.id === postId ? { ...p, archived: !p.archived } : p
    );
    onReorder(newPosts);
  };

  const deletePost = (postId: string) => {
    if (confirm('Una uhakika unataka kufuta post hii?')) {
      onReorder(posts.filter(p => p.id !== postId));
    }
  };

  // Sort posts: pinned first, then by order
  const sortedPosts = [
    ...posts.filter(p => p.pinned && !p.archived),
    ...posts.filter(p => !p.pinned && !p.archived),
    ...posts.filter(p => p.archived),
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {sortedPosts.map((post) => (
        <div
          key={post.id}
          draggable
          onDragStart={(e) => handleDragStart(e, post.id)}
          onDragOver={(e) => handleDragOver(e, post.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, post.id)}
          onDragEnd={handleDragEnd}
          style={{
            padding: 16,
            borderRadius: 12,
            background: draggedItem === post.id
              ? 'rgba(99, 102, 241, 0.2)'
              : dragOverItem === post.id
              ? 'rgba(99, 102, 241, 0.1)'
              : post.archived
              ? 'rgba(30, 41, 59, 0.2)'
              : 'rgba(30, 41, 59, 0.3)',
            border: `1px solid ${
              draggedItem === post.id
                ? 'rgba(99, 102, 241, 0.5)'
                : dragOverItem === post.id
                ? 'rgba(99, 102, 241, 0.3)'
                : post.archived
                ? 'rgba(51, 65, 85, 0.2)'
                : 'rgba(51, 65, 85, 0.3)'
            }`,
            opacity: draggedItem === post.id ? 0.5 : post.archived ? 0.6 : 1,
            cursor: 'grab',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            transition: 'all 0.2s ease',
          }}
        >
          {/* Drag Handle */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            color: '#64748b',
            cursor: 'grab',
          }}>
            <GripVertical size={20} />
          </div>

          {/* Content */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              {post.pinned && (
                <Pin size={14} color="#fbbf24" />
              )}
              <h4 style={{ fontSize: 15, fontWeight: 600, margin: 0, color: '#e2e8f0' }}>
                {post.title}
              </h4>
            </div>
            <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
              {post.category}
              {post.archived && ' • Imehifadhiwa'}
            </p>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => togglePin(post.id)}
              style={{
                padding: 8,
                borderRadius: 8,
                background: post.pinned ? 'rgba(251, 191, 36, 0.2)' : 'rgba(30, 41, 59, 0.5)',
                border: 'none',
                cursor: 'pointer',
              }}
              title={post.pinned ? 'Ondoa Pin' : 'Pin Post'}
            >
              <Pin size={16} color={post.pinned ? '#fbbf24' : '#94a3b8'} />
            </button>
            <button
              onClick={() => toggleArchive(post.id)}
              style={{
                padding: 8,
                borderRadius: 8,
                background: post.archived ? 'rgba(100, 116, 139, 0.2)' : 'rgba(30, 41, 59, 0.5)',
                border: 'none',
                cursor: 'pointer',
              }}
              title={post.archived ? 'Ondoa kwenye Archive' : 'Archive Post'}
            >
              <Archive size={16} color={post.archived ? '#94a3b8' : '#64748b'} />
            </button>
            <button
              onClick={() => deletePost(post.id)}
              style={{
                padding: 8,
                borderRadius: 8,
                background: 'rgba(239, 68, 68, 0.1)',
                border: 'none',
                cursor: 'pointer',
              }}
              title="Futa Post"
            >
              <Trash2 size={16} color="#fca5a5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
