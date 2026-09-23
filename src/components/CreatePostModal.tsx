import React, { useState } from 'react';
import { X, Send, Bold, Italic, Code, Link2, List, Quote, Image, Lock } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose }) => {
  const { createPost, categories, isAuthenticated } = useApp();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [category, setCategory] = useState('Teknolojia');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const addTag = () => {
    if (tagInput && tags.length < 5 && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = () => {
    setError('');

    if (!title.trim()) {
      setError('Tafadhali andika swali lako');
      return;
    }

    if (title.length < 10) {
      setError('Swali lazima liwe na herufi 10 au zaidi');
      return;
    }

    if (!content.trim()) {
      setError('Tafadhali andika maelezo ya swali lako');
      return;
    }

    if (tags.length === 0) {
      setError('Tafadhali ongeza angalau tag moja');
      return;
    }

    createPost(title, content, tags, category, isAnonymous);
    setTitle('');
    setContent('');
    setTags([]);
    setCategory('Teknolojia');
    setIsAnonymous(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-card"
        style={{
          width: '100%', maxWidth: 640, margin: '0 16px',
          padding: 24, maxHeight: '90vh', overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 className="gradient-text" style={{ fontSize: 20, fontWeight: 'bold' }}>Uliza Swali</h2>
          <button
            onClick={onClose}
            style={{ padding: 8, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <X size={20} color="#cbd5e1" />
          </button>
        </div>

        {/* Title */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 14, fontWeight: 500, color: '#cbd5e1', marginBottom: 8, display: 'block' }}>
            Swali lako *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Andika swali lako kwa ufasaha..."
            style={{
              width: '100%', padding: 12, borderRadius: 12,
              background: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(51, 65, 85, 0.5)',
              color: '#e2e8f0', fontSize: 14
            }}
          />
          <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
            {title.length}/200 herufi (minimum 10)
          </p>
        </div>

        {/* Content */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 14, fontWeight: 500, color: '#cbd5e1', marginBottom: 8, display: 'block' }}>
            Maelezo *
          </label>
          <div style={{ borderRadius: 12, border: '1px solid rgba(51, 65, 85, 0.5)', overflow: 'hidden' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4, padding: 8,
              borderBottom: '1px solid rgba(51, 65, 85, 0.5)',
              background: 'rgba(30, 41, 59, 0.3)'
            }}>
              <button style={{ padding: 6, borderRadius: 4, background: 'transparent', border: 'none', cursor: 'pointer' }}><Bold size={16} color="#94a3b8" /></button>
              <button style={{ padding: 6, borderRadius: 4, background: 'transparent', border: 'none', cursor: 'pointer' }}><Italic size={16} color="#94a3b8" /></button>
              <button style={{ padding: 6, borderRadius: 4, background: 'transparent', border: 'none', cursor: 'pointer' }}><Code size={16} color="#94a3b8" /></button>
              <button style={{ padding: 6, borderRadius: 4, background: 'transparent', border: 'none', cursor: 'pointer' }}><Link2 size={16} color="#94a3b8" /></button>
              <button style={{ padding: 6, borderRadius: 4, background: 'transparent', border: 'none', cursor: 'pointer' }}><List size={16} color="#94a3b8" /></button>
              <button style={{ padding: 6, borderRadius: 4, background: 'transparent', border: 'none', cursor: 'pointer' }}><Quote size={16} color="#94a3b8" /></button>
              <button style={{ padding: 6, borderRadius: 4, background: 'transparent', border: 'none', cursor: 'pointer' }}><Image size={16} color="#94a3b8" /></button>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Eleza swali lako kwa undani..."
              style={{
                width: '100%', padding: 12, background: 'transparent',
                border: 'none', color: '#e2e8f0', fontSize: 14,
                resize: 'none', height: 128
              }}
            />
          </div>
        </div>

        {/* Category */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 14, fontWeight: 500, color: '#cbd5e1', marginBottom: 8, display: 'block' }}>
            Kategoria
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              width: '100%', padding: 12, borderRadius: 12,
              background: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(51, 65, 85, 0.5)',
              color: '#e2e8f0', fontSize: 14
            }}
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tags */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 14, fontWeight: 500, color: '#cbd5e1', marginBottom: 8, display: 'block' }}>
            Tags (max 5) *
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {tags.map((tag, i) => (
              <span key={i} className="tag" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
            {tags.length < 5 && (
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Ongeza tag..."
                style={{
                  flex: 1, minWidth: 120, padding: 8, borderRadius: 8,
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(51, 65, 85, 0.5)',
                  color: '#e2e8f0', fontSize: 13
                }}
              />
            )}
          </div>
        </div>

        {/* Anonymous Option */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              style={{ width: 16, height: 16, borderRadius: 4, border: '1px solid #475569', background: '#1e293b' }}
            />
            <span style={{ fontSize: 14, color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Lock size={14} /> Jibu kwa siri (Anonymous)
            </span>
          </label>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: 12, borderRadius: 8,
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5', fontSize: 13, marginBottom: 16
          }}>
            {error}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
          <button onClick={onClose} className="btn-ghost">
            Ghairi
          </button>
          <button
            onClick={handleSubmit}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Send size={16} /> Tuma Swali
          </button>
        </div>
      </div>
    </div>
  );
};
