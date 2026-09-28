import React, { useState } from 'react';
import { X, Send, Bold, Italic, Code, Link2, List, Quote, Image, Lock } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { ImageUpload } from './ImageUpload';

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
  const [imageData, setImageData] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const contentRef = React.useRef<HTMLTextAreaElement>(null);

  if (!isOpen) return null;

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = contentRef.current;
    if (!textarea) {
      setContent(prev => prev + prefix + suffix);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const replacement = prefix + (selected || 'maandishi') + suffix;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected || 'maandishi').length);
    }, 50);
  };

  const parseAndAddTags = (inputText: string, existingTags: string[] = tags): { updatedTags: string[]; remainingText: string } => {
    if (!inputText) return { updatedTags: existingTags, remainingText: '' };

    const parts = inputText.split(/[,،]+/).map(t => t.trim().replace(/^#+/, '')).filter(Boolean);
    const newTags = [...existingTags];
    let remaining = '';

    parts.forEach((part, index) => {
      // If it doesn't end with a delimiter and it's the last token, leave it in input
      if (index === parts.length - 1 && !inputText.endsWith(',') && !inputText.endsWith('،')) {
        remaining = part;
        return;
      }
      if (part && !newTags.includes(part) && newTags.length < 5) {
        newTags.push(part);
      }
    });

    return { updatedTags: newTags, remainingText: remaining };
  };

  const handleTagInputChange = (val: string) => {
    if (val.includes(',') || val.includes('،')) {
      const { updatedTags, remainingText } = parseAndAddTags(val);
      setTags(updatedTags);
      setTagInput(remainingText);
    } else {
      setTagInput(val);
    }
  };

  const addTag = (text?: string) => {
    const raw = (text !== undefined ? text : tagInput).trim().replace(/^#+/, '');
    if (!raw) return;

    const parts = raw.split(/[,،\s]+/).map(t => t.trim().replace(/^#+/, '')).filter(Boolean);
    const newTags = [...tags];
    for (const p of parts) {
      if (!newTags.includes(p) && newTags.length < 5) {
        newTags.push(p);
      }
    }
    setTags(newTags);
    setTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = async () => {
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

    // Auto-parse any remaining text in tagInput before validating
    let currentTags = [...tags];
    if (tagInput.trim()) {
      const pendingParts = tagInput.split(/[,،\s]+/).map(t => t.trim().replace(/^#+/, '')).filter(Boolean);
      for (const p of pendingParts) {
        if (!currentTags.includes(p) && currentTags.length < 5) {
          currentTags.push(p);
        }
      }
      setTags(currentTags);
      setTagInput('');
    }

    if (currentTags.length === 0) {
      setError('Tafadhali ongeza angalau tag moja (mfano: #Teknolojia, #AI)');
      return;
    }

    setIsSubmitting(true);
    let finalContent = content.trim();
    if (imageData && !finalContent.includes(imageData)) {
      finalContent += `\n\n![Picha](${imageData})`;
    }

    try {
      await createPost(title.trim(), finalContent, currentTags, category, isAnonymous);
      setTitle('');
      setContent('');
      setTags([]);
      setTagInput('');
      setCategory('Teknolojia');
      setImageData(null);
      setIsAnonymous(false);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Hitilafu wakati wa kutuma swali. Jaribu tena.');
    } finally {
      setIsSubmitting(false);
    }
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
            style={{ padding: 8, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Title */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-main)', marginBottom: 8, display: 'block' }}>
            Swali lako *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Andika swali lako kwa ufasaha..."
            style={{
              width: '100%', padding: 12, borderRadius: 12,
              background: 'var(--input-bg)',
              border: '1px solid var(--input-border)',
              color: 'var(--input-text)', fontSize: 14
            }}
          />
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            {title.length}/200 herufi (minimum 10)
          </p>
        </div>

        {/* Content */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-main)', marginBottom: 8, display: 'block' }}>
            Maelezo *
          </label>
          <div style={{ borderRadius: 12, border: '1px solid var(--border-app)', overflow: 'hidden' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4, padding: 8,
              borderBottom: '1px solid var(--border-app)',
              background: 'var(--bg-subtle)'
            }}>
              <button type="button" onClick={() => insertMarkdown('**', '**')} title="Bold" className="tool-btn" style={{ padding: 6 }}><Bold size={16} /></button>
              <button type="button" onClick={() => insertMarkdown('*', '*')} title="Italic" className="tool-btn" style={{ padding: 6 }}><Italic size={16} /></button>
              <button type="button" onClick={() => insertMarkdown('`', '`')} title="Inline Code" className="tool-btn" style={{ padding: 6 }}><Code size={16} /></button>
              <button type="button" onClick={() => insertMarkdown('[Kichwa cha Link](', ')')} title="Link" className="tool-btn" style={{ padding: 6 }}><Link2 size={16} /></button>
              <button type="button" onClick={() => insertMarkdown('\n- ')} title="List" className="tool-btn" style={{ padding: 6 }}><List size={16} /></button>
              <button type="button" onClick={() => insertMarkdown('\n> ')} title="Quote" className="tool-btn" style={{ padding: 6 }}><Quote size={16} /></button>
              <button type="button" onClick={() => insertMarkdown('```\n', '\n```')} title="Code Block" className="tool-btn" style={{ padding: 6 }}><Image size={16} /></button>
            </div>
            <textarea
              ref={contentRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Eleza swali lako kwa undani..."
              style={{
                width: '100%', padding: 12, background: 'var(--input-bg)',
                border: 'none', color: 'var(--input-text)', fontSize: 14,
                resize: 'none', height: 128
              }}
            />
          </div>
        </div>

        {/* Image Upload */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-main)', marginBottom: 8, display: 'block' }}>
            Picha (Hiari)
          </label>
          <ImageUpload
            onImageSelect={setImageData}
            currentImage={imageData || undefined}
            onRemove={() => setImageData(null)}
          />
        </div>

        {/* Category */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-main)', marginBottom: 8, display: 'block' }}>
            Kategoria
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              width: '100%', padding: 12, borderRadius: 12,
              background: 'var(--input-bg)',
              border: '1px solid var(--input-border)',
              color: 'var(--input-text)', fontSize: 14
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-main)', display: 'block' }}>
              Tags (max 5) *
            </label>
            <span style={{ fontSize: 12, color: tags.length >= 5 ? '#eab308' : 'var(--text-muted)' }}>
              {tags.length}/5 tags zilizoongezwa
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexWrap: 'wrap',
              padding: 8,
              borderRadius: 10,
              background: 'var(--input-bg)',
              border: '1px solid var(--input-border)',
              minHeight: 46
            }}
          >
            {tags.map((tag, i) => (
              <span
                key={i}
                className="tag"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 10px',
                  borderRadius: 16,
                  fontSize: 12,
                  fontWeight: 600,
                  background: 'var(--tag-bg)',
                  color: 'var(--tag-text)',
                  border: '1px solid var(--tag-border)'
                }}
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit', display: 'flex', alignItems: 'center' }}
                  title="Ondoa tag"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
            {tags.length < 5 ? (
              <input
                type="text"
                value={tagInput}
                onChange={(e) => handleTagInputChange(e.target.value)}
                onBlur={() => addTag()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder={tags.length === 0 ? "Andika tag kisha piga koma (,) au Enter..." : "Ongeza nyingine..."}
                style={{
                  flex: 1,
                  minWidth: 140,
                  padding: '4px 8px',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--input-text)',
                  fontSize: 13
                }}
              />
            ) : (
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', padding: '4px 8px' }}>
                Upeo wa tags 5 umekamilika
              </span>
            )}
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, marginBottom: 0 }}>
            Tenganisha tags kwa koma (,) au piga Enter (mfano: <code>React, WebDev, AI</code>)
          </p>
        </div>

        {/* Anonymous Option */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              style={{ width: 16, height: 16, borderRadius: 4 }}
            />
            <span style={{ fontSize: 14, color: 'var(--text-body)', display: 'flex', alignItems: 'center', gap: 4 }}>
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
