import React, { useState, useRef } from 'react';
import { useRouter } from '../router/Router';
import { useApp } from '../contexts/AppContext';
import { ImageUpload } from '../components/ImageUpload';
import {
  ArrowLeft, Send, Bold, Italic, Code, Link2, List, Quote,
  Image as ImageIcon, Lock, HelpCircle, Sparkles, Tag, AlertCircle,
  CheckCircle2, ChevronRight
} from 'lucide-react';

export const CreatePostPage: React.FC = () => {
  const { navigate } = useRouter();
  const { createPost, categories, isAuthenticated } = useApp();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [category, setCategory] = useState(categories[0]?.name || 'Teknolojia');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [error, setError] = useState('');
  const [imageData, setImageData] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contentRef = useRef<HTMLTextAreaElement>(null);

  if (!isAuthenticated) {
    return (
      <div style={{ maxWidth: 640, margin: '60px auto', padding: '0 16px' }}>
        <div className="glass-card" style={{ padding: 48, textAlign: 'center' }}>
          <AlertCircle size={48} color="#6366f1" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>
            Ingia Kwanza Ili Kuuliza Swali
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.6 }}>
            Unahitaji kuwa mwanachama wa Nijuze ili uweze kuuliza maswali, kuanzisha mijadala na kupokea majibu kutoka kwa jamii.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            <button onClick={() => navigate('/login')} className="btn-primary" style={{ padding: '10px 24px', cursor: 'pointer' }}>
              Ingia Kwenye Akaunti
            </button>
            <button onClick={() => navigate('/register')} className="btn-ghost" style={{ padding: '10px 24px', cursor: 'pointer' }}>
              Jiunge Sasa
            </button>
          </div>
        </div>
      </div>
    );
  }

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = contentRef.current;
    if (!textarea) {
      setContent((prev) => prev + prefix + suffix);
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

    const parts = inputText.split(/[,،]+/).map((t) => t.trim().replace(/^#+/, '')).filter(Boolean);
    const newTags = [...existingTags];
    let remaining = '';

    parts.forEach((part, index) => {
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

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = tagInput.trim().replace(/^#+/, '');
      if (trimmed && !tags.includes(trimmed) && tags.length < 5) {
        setTags([...tags, trimmed]);
        setTagInput('');
      }
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    let finalTags = [...tags];
    if (tagInput.trim()) {
      const leftover = tagInput.trim().replace(/^#+/, '');
      if (leftover && !finalTags.includes(leftover) && finalTags.length < 5) {
        finalTags.push(leftover);
      }
    }

    if (!title.trim()) {
      setError('Tafadhali ingiza kichwa cha swali au chapisho lako.');
      return;
    }

    if (title.length < 8) {
      setError('Kichwa cha habari kinatakiwa kiwe na angalau herufi 8.');
      return;
    }

    if (!content.trim()) {
      setError('Tafadhali toa maelezo kamili ya swali au chapisho lako.');
      return;
    }

    if (content.length < 20) {
      setError('Maelezo yanatakiwa kuwa na angalau herufi 20 ili yaweze kueleweka vizuri.');
      return;
    }

    if (finalTags.length === 0) {
      setError('Tafadhali weka angalau tag moja (mfano: #react, #kilimo, #biashara).');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalContent = content.trim();
      if (imageData) {
        finalContent += `\n\n![Picha ya chapisho](${imageData})`;
      }

      const newPost = await createPost(title.trim(), finalContent, finalTags, category, isAnonymous);
      if (newPost) {
        navigate(`/post/${newPost.id}`);
      } else {
        setError('Imeshindikana kuchapisha, tafadhali jaribu tena.');
      }
    } catch (err: any) {
      setError(err?.message || 'Hitilafu imetokea wakati wa kuchapisha.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 64 }}>
      {/* Breadcrumb & Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>
            Nyumbani
          </button>
          <ChevronRight size={14} />
          <span style={{ color: 'var(--btn-ghost-text)', fontWeight: 600 }}>Uliza Swali au Shiriki Maarifa</span>
        </div>

        <button
          onClick={() => navigate('/')}
          className="btn-ghost"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '6px 14px', cursor: 'pointer' }}
        >
          <ArrowLeft size={16} /> Rudi Nyuma
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 24, alignItems: 'start' }} className="post-detail-grid">
        {/* Main Form */}
        <div className="glass-card" style={{ padding: 32 }}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-main)', marginBottom: 6 }}>
              Uliza Swali au Shiriki Maarifa
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              Weka swali lako au mada unayotaka kuijadili ili wanajamii wa Nijuze wakusaidie.
            </p>
          </div>

          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 16px',
                borderRadius: 12,
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#ef4444',
                fontSize: 13,
                marginBottom: 20,
              }}
            >
              <AlertCircle size={18} flex-shrink="0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            {/* Title Input */}
            <div>
              <label style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8, display: 'block' }}>
                Kichwa cha Swali / Chapisho <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Mfano: Ninawezaje ku-connect MySQL database na programu ya Python?"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: 12,
                  background: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  color: 'var(--input-text)',
                  fontSize: 15,
                  outline: 'none',
                }}
              />
              <span style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                Kichwa kifupi na cha wazi husaidia watu wengi kuelewa na kujibu haraka.
              </span>
            </div>

            {/* Category Selection */}
            <div>
              <label style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8, display: 'block' }}>
                Kategoria <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  color: 'var(--input-text)',
                  fontSize: 14,
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name} style={{ background: 'var(--bg-surface)', color: 'var(--text-main)' }}>
                    {c.icon || '📁'} {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Content Area with Markdown Toolbar */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>
                  Maelezo Kamili <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {content.length} herufi
                </span>
              </div>

              {/* Formatting Toolbar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '8px 10px',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-app)',
                  borderBottom: 'none',
                  borderTopLeftRadius: 12,
                  borderTopRightRadius: 12,
                  flexWrap: 'wrap',
                }}
              >
                {[
                  { icon: Bold, label: 'Bold', action: () => insertMarkdown('**', '**') },
                  { icon: Italic, label: 'Italic', action: () => insertMarkdown('*', '*') },
                  { icon: Code, label: 'Code', action: () => insertMarkdown('`', '`') },
                  { icon: Quote, label: 'Quote', action: () => insertMarkdown('\n> ', '\n') },
                  { icon: List, label: 'List', action: () => insertMarkdown('\n• ', '\n') },
                  { icon: Link2, label: 'Link', action: () => insertMarkdown('[jina la kiungo](', ')') },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={item.action}
                    style={{
                      padding: 6,
                      borderRadius: 6,
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title={item.label}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-main)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                  >
                    <item.icon size={16} />
                  </button>
                ))}
              </div>

              <textarea
                ref={contentRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Fafanua kwa ufasaha tatizo lako, ulichojaribu kufanya, au maarifa unayotaka kushiriki..."
                rows={10}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderBottomLeftRadius: 12,
                  borderBottomRightRadius: 12,
                  background: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  color: 'var(--input-text)',
                  fontSize: 14,
                  lineHeight: 1.6,
                  resize: 'vertical',
                  outline: 'none',
                }}
              />
            </div>

            {/* Optional Image Upload */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6, display: 'block' }}>
                Ambatanisha Picha (Hiari)
              </label>
              <ImageUpload onImageSelected={(base64) => setImageData(base64)} initialImage={imageData} />
            </div>

            {/* Tags Input */}
            <div>
              <label style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)', marginBottom: 6, display: 'block' }}>
                Lebo (Tags) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: 8,
                  padding: 8,
                  borderRadius: 12,
                  background: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  minHeight: 46,
                }}
              >
                {tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '4px 10px',
                      borderRadius: 8,
                      background: 'rgba(99, 102, 241, 0.15)',
                      color: 'var(--btn-ghost-text)',
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        color: 'inherit',
                        display: 'flex',
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}

                {tags.length < 5 && (
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val.includes(',') || val.includes('،')) {
                        const { updatedTags, remainingText } = parseAndAddTags(val);
                        setTags(updatedTags);
                        setTagInput(remainingText);
                      } else {
                        setTagInput(val);
                      }
                    }}
                    onKeyDown={handleTagInputKeyDown}
                    placeholder={tags.length === 0 ? 'Weka lebo ukitumia koma mfano: python, sql, web...' : 'Lebo nyingine...'}
                    style={{
                      flex: 1,
                      minWidth: 160,
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--input-text)',
                      fontSize: 13,
                      outline: 'none',
                      padding: '4px 6px',
                    }}
                  />
                )}
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                Hadi lebo 5. Tenganisha kwa koma (,) au bonyeza Enter.
              </span>
            </div>

            {/* Anonymous Toggle */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderRadius: 12,
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-app)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Lock size={18} color="var(--text-muted)" />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-main)' }}>
                    Uliza bila kuonyesha jina lako (Anonymous)
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Jina lako halitaonekana hadharani kwenye swali hili.
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                style={{ width: 18, height: 18, cursor: 'pointer' }}
              />
            </div>

            {/* Submit Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="btn-ghost"
                style={{ padding: '12px 24px', cursor: 'pointer', fontSize: 14 }}
              >
                Ghairi
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 28px',
                  borderRadius: 12,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.7 : 1,
                  boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)',
                }}
              >
                <Send size={16} />
                <span>{isSubmitting ? 'Inachapisha...' : 'Chapisha Swali Sasa'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Sidebar Guidelines */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={17} color="#eab308" />
              Miongozo ya Kuuliza
            </h3>
            <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, lineHeight: 1.8, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li>
                <strong>Kichwa Maalum:</strong> Andika kichwa kinachofupisha tatizo halisi badala ya kuandika tu "Msaada tafadhali".
              </li>
              <li>
                <strong>Toa Maelezo ya Kutosha:</strong> Eleza kile unachojaribu kufikia na matokeo uliyopata badala ya ulichotarajia.
              </li>
              <li>
                <strong>Weka Sehemu ya Kodi au Makosa:</strong> Kama ni hitilafu ya kiteknolojia, nakili ujumbe halisi wa kosa (error message).
              </li>
              <li>
                <strong>Tumia Lebo Sahihi:</strong> Lebo humvutia mtaalamu sahihi kuona swali lako mapema.
              </li>
            </ul>
          </div>

          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <HelpCircle size={17} color="#6366f1" />
              Unahitaji Msaada Zaidi?
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 14 }}>
              Unaweza pia kutumia msaidizi wetu wa akili bandia (Nijuze AI) kupata jibu la papo hapo.
            </p>
            <button
              onClick={() => navigate('/forum')}
              className="btn-ghost"
              style={{ width: '100%', fontSize: 13, justifyContent: 'center', cursor: 'pointer' }}
            >
              Vinjari Maswali ya Jamii
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
