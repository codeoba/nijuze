import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bold, Italic, Underline, Code, Quote, List, ListOrdered,
  Link2, Smile, Eye, EyeOff, Send, X, CornerDownLeft,
  Image as ImageIcon, Paperclip, Loader2, UploadCloud
} from 'lucide-react';
import { uploadAPI } from '../services/api';

interface CommentRichEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  placeholder?: string;
  minHeight?: number;
  submitting?: boolean;
  submitLabel?: string;
}

const QUICK_EMOJIS = ['👍', '❤️', '🔥', '💡', '🚀', '👏', '🎉', '💯', '✨', '🙌'];

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

export const CommentRichEditor: React.FC<CommentRichEditorProps> = ({
  value,
  onChange,
  onSubmit,
  onCancel,
  placeholder = 'Andika jibu au maoni yako hapa...',
  minHeight = 90,
  submitting = false,
  submitLabel = 'Tuma Jibu'
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isPreview, setIsPreview] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [isEmpty, setIsEmpty] = useState(true);
  
  // Upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Sync value to contentEditable if empty or changed externally
  useEffect(() => {
    if (editorRef.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
      }
      checkIfEmpty();
    }
  }, [value]);

  const checkIfEmpty = () => {
    if (!editorRef.current) {
      setIsEmpty(true);
      return;
    }
    const hasText = (editorRef.current.innerText || '').trim().length > 0;
    const hasMedia = editorRef.current.querySelector('img, a.comment-file-badge') !== null;
    setIsEmpty(!hasText && !hasMedia);
  };

  const exec = (cmd: string, val: string | undefined = undefined) => {
    document.execCommand(cmd, false, val);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
      checkIfEmpty();
      editorRef.current.focus();
    }
  };

  const insertHtmlAtCursor = useCallback((html: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      const el = document.createElement('div');
      el.innerHTML = html;
      const frag = document.createDocumentFragment();
      let node: ChildNode | null;
      let lastNode: ChildNode | null = null;
      while ((node = el.firstChild)) {
        lastNode = frag.appendChild(node);
      }
      range.insertNode(frag);
      if (lastNode) {
        range.setStartAfter(lastNode);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    } else {
      editorRef.current.innerHTML += html;
    }
    onChange(editorRef.current.innerHTML);
    checkIfEmpty();
  }, [onChange]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
      checkIfEmpty();
    }
  };

  const handleInsertCode = () => {
    const sel = window.getSelection();
    const selectedText = sel ? sel.toString() : '';
    const textToInsert = selectedText || 'code';
    const codeHtml = `<code style="background: var(--bg-subtle); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px; color: #6366f1; border: 1px solid var(--border-app);">${escapeHtml(textToInsert)}</code>`;
    exec('insertHTML', codeHtml);
  };

  const handleInsertLink = () => {
    if (!linkUrl) return;
    const url = linkUrl.startsWith('http://') || linkUrl.startsWith('https://') ? linkUrl : `https://${linkUrl}`;
    const text = linkText || url;
    const linkHtml = `<a href="${encodeURI(url)}" target="_blank" rel="noopener noreferrer" style="color: #6366f1; text-decoration: underline; font-weight: 500;">${escapeHtml(text)}</a>`;
    exec('insertHTML', linkHtml);
    setLinkUrl('');
    setLinkText('');
    setShowLinkInput(false);
  };

  const handleAddEmoji = (emoji: string) => {
    exec('insertText', emoji);
    setShowEmojiPicker(false);
  };

  // Upload handler for image or generic file
  const processUpload = async (file: File) => {
    setUploadError(null);
    setIsUploading(true);
    const isImg = file.type.startsWith('image/');
    setUploadProgressText(isImg ? `Inapakia picha (${file.name})...` : `Inapakia faili (${file.name})...`);

    try {
      const res = await uploadAPI.upload(file);
      const safeName = escapeHtml(file.name);

      if (isImg) {
        const imgHtml = `<p><img src="${res.url}" alt="${safeName}" style="max-width: 100%; max-height: 420px; border-radius: 10px; margin: 8px 0; display: block; border: 1px solid var(--border-app);" /></p><p><br></p>`;
        insertHtmlAtCursor(imgHtml);
      } else {
        const fileHtml = `<p><a href="${res.url}" download="${safeName}" target="_blank" rel="noopener noreferrer" class="comment-file-badge"><span>📎</span> <span class="file-name">${safeName}</span> <span class="file-size">(${formatFileSize(file.size)})</span></a></p><p><br></p>`;
        insertHtmlAtCursor(fileHtml);
      }
    } catch (err: any) {
      console.error('File upload error:', err);
      setUploadError(err.message || 'Imeshindikana kupakia faili. Tafadhali jaribu tena.');
    } finally {
      setIsUploading(false);
      setUploadProgressText('');
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => processUpload(file));
      e.target.value = '';
    }
  };

  const handleGenericFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => processUpload(file));
      e.target.value = '';
    }
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      Array.from(e.dataTransfer.files).forEach(file => processUpload(file));
    }
  };

  // Clipboard Paste handler (for screenshot / image pasting)
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          processUpload(file);
          return;
        }
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl + Enter or Cmd + Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isEmpty && !submitting && !isUploading) {
        onSubmit();
      }
      return;
    }

    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b') {
        e.preventDefault();
        exec('bold');
      } else if (e.key === 'i') {
        e.preventDefault();
        exec('italic');
      } else if (e.key === 'u') {
        e.preventDefault();
        exec('underline');
      }
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        borderRadius: 12,
        border: isDragging ? '2px dashed #6366f1' : '1px solid var(--border-app)',
        background: isDragging ? 'rgba(99, 102, 241, 0.05)' : 'var(--input-bg)',
        overflow: 'hidden',
        boxShadow: isDragging ? '0 0 12px rgba(99, 102, 241, 0.25)' : '0 2px 8px rgba(0, 0, 0, 0.04)',
        transition: 'all 0.2s ease',
        position: 'relative'
      }}
    >
      {/* Hidden file inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleImageFileChange}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.tar,.gz,.json,.mp3,.mp4"
        multiple
        style={{ display: 'none' }}
        onChange={handleGenericFileChange}
      />

      {/* 1. Rich Text Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 10px',
          borderBottom: '1px solid var(--border-app)',
          background: 'var(--bg-subtle)',
          flexWrap: 'wrap',
          gap: 4
        }}
      >
        {/* Formatting Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => exec('bold')}
            title="Bold (Ctrl+B)"
            style={toolbarBtnStyle}
          >
            <Bold size={14} />
          </button>
          
          <button
            type="button"
            onClick={() => exec('italic')}
            title="Italic (Ctrl+I)"
            style={toolbarBtnStyle}
          >
            <Italic size={14} />
          </button>

          <button
            type="button"
            onClick={() => exec('underline')}
            title="Underline (Ctrl+U)"
            style={toolbarBtnStyle}
          >
            <Underline size={14} />
          </button>

          <div style={dividerStyle} />

          <button
            type="button"
            onClick={handleInsertCode}
            title="Ingiza Code"
            style={toolbarBtnStyle}
          >
            <Code size={14} />
          </button>

          <button
            type="button"
            onClick={() => exec('formatBlock', 'blockquote')}
            title="Nukuu (Quote)"
            style={toolbarBtnStyle}
          >
            <Quote size={14} />
          </button>

          <button
            type="button"
            onClick={() => exec('insertUnorderedList')}
            title="Orodha (Bullet list)"
            style={toolbarBtnStyle}
          >
            <List size={14} />
          </button>

          <button
            type="button"
            onClick={() => exec('insertOrderedList')}
            title="Orodha yenye namba"
            style={toolbarBtnStyle}
          >
            <ListOrdered size={14} />
          </button>

          <div style={dividerStyle} />

          {/* Media / Upload actions */}
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            title="Pakia Picha (PNG, JPG, GIF, WebP)"
            style={{
              ...toolbarBtnStyle,
              color: '#3b82f6',
              gap: 4,
              width: 'auto',
              padding: '0 6px',
            }}
          >
            <ImageIcon size={14} />
            <span style={{ fontSize: 11, fontWeight: 500 }}>Picha</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Ambatisha Faili / Nyaraka (PDF, DOCX, ZIP, n.k.)"
            style={{
              ...toolbarBtnStyle,
              color: '#10b981',
              gap: 4,
              width: 'auto',
              padding: '0 6px',
            }}
          >
            <Paperclip size={14} />
            <span style={{ fontSize: 11, fontWeight: 500 }}>Faili</span>
          </button>

          <div style={dividerStyle} />

          {/* Link button */}
          <button
            type="button"
            onClick={() => setShowLinkInput(!showLinkInput)}
            title="Weka Kiungo (Link)"
            style={{
              ...toolbarBtnStyle,
              background: showLinkInput ? 'var(--btn-ghost-bg)' : 'transparent',
              color: showLinkInput ? '#6366f1' : 'var(--text-muted)'
            }}
          >
            <Link2 size={14} />
          </button>

          {/* Emoji button */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            title="Weka Emoji"
            style={{
              ...toolbarBtnStyle,
              background: showEmojiPicker ? 'var(--btn-ghost-bg)' : 'transparent',
              color: showEmojiPicker ? '#eab308' : 'var(--text-muted)'
            }}
          >
            <Smile size={14} />
          </button>
        </div>

        {/* Right side: Preview Toggle */}
        <button
          type="button"
          onClick={() => setIsPreview(!isPreview)}
          title={isPreview ? 'Rudi kuhariri' : 'Hakiki muonekano kabla ya kutuma'}
          style={{
            ...toolbarBtnStyle,
            padding: '3px 8px',
            gap: 4,
            fontSize: 11,
            fontWeight: 600,
            width: 'auto',
            color: isPreview ? '#6366f1' : 'var(--text-muted)'
          }}
        >
          {isPreview ? <EyeOff size={13} /> : <Eye size={13} />}
          <span>{isPreview ? 'Hariri' : 'Hakiki'}</span>
        </button>
      </div>

      {/* Popover 1: Link input */}
      {showLinkInput && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 12px',
            background: 'var(--bg-subtle)',
            borderBottom: '1px solid var(--border-app)',
          }}
        >
          <input
            type="text"
            placeholder="URL (mfano: https://example.com)..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            style={{
              flex: 1,
              padding: '4px 8px',
              borderRadius: 6,
              fontSize: 12,
              border: '1px solid var(--border-app)',
              background: 'var(--input-bg)',
              color: 'var(--text-main)',
            }}
          />
          <input
            type="text"
            placeholder="Maandishi (hiari)..."
            value={linkText}
            onChange={(e) => setLinkText(e.target.value)}
            style={{
              width: 140,
              padding: '4px 8px',
              borderRadius: 6,
              fontSize: 12,
              border: '1px solid var(--border-app)',
              background: 'var(--input-bg)',
              color: 'var(--text-main)',
            }}
          />
          <button
            type="button"
            onClick={handleInsertLink}
            className="btn-primary"
            style={{ padding: '4px 10px', fontSize: 12, borderRadius: 6 }}
          >
            Weka
          </button>
          <button
            type="button"
            onClick={() => setShowLinkInput(false)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Popover 2: Quick Emoji Picker */}
      {showEmojiPicker && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            background: 'var(--bg-subtle)',
            borderBottom: '1px solid var(--border-app)',
            overflowX: 'auto',
          }}
        >
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleAddEmoji(emoji)}
              style={{
                fontSize: 18,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '2px 6px',
                borderRadius: 6,
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {emoji}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(false)}
            style={{ marginLeft: 'auto', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Uploading Banner */}
      {isUploading && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 12px',
            background: 'rgba(99, 102, 241, 0.1)',
            color: '#6366f1',
            fontSize: 12,
            fontWeight: 500,
            borderBottom: '1px solid var(--border-app)',
          }}
        >
          <Loader2 size={14} className="spin-icon" style={{ animation: 'spin 1s linear infinite' }} />
          <span>{uploadProgressText}</span>
        </div>
      )}

      {/* Upload Error Banner */}
      {uploadError && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 12px',
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
            fontSize: 12,
            borderBottom: '1px solid var(--border-app)',
          }}
        >
          <span>{uploadError}</span>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444' }}
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Drag & drop overlay cue */}
      {isDragging && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(99, 102, 241, 0.15)',
            backdropFilter: 'blur(2px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            zIndex: 20,
            color: '#6366f1',
            pointerEvents: 'none'
          }}
        >
          <UploadCloud size={32} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>Achia faili au picha hapa ili kuingiza moja kwa moja</span>
        </div>
      )}

      {/* 2. Editor Input / Preview Area */}
      {isPreview ? (
        <div
          className="comment-rich-render"
          style={{
            padding: 12,
            minHeight,
            maxHeight: 280,
            overflowY: 'auto',
            fontSize: 14,
            color: 'var(--text-body)',
            lineHeight: 1.6,
            background: 'var(--bg-card)',
          }}
          dangerouslySetInnerHTML={{ __html: value || '<p style="color: var(--text-muted); font-style: italic;">Hakuna maudhui ya kuhakiki...</p>' }}
        />
      ) : (
        <div style={{ position: 'relative' }}>
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            style={{
              padding: 12,
              minHeight,
              maxHeight: 260,
              overflowY: 'auto',
              outline: 'none',
              fontSize: 14,
              color: 'var(--text-main)',
              lineHeight: 1.6,
              wordBreak: 'break-word',
            }}
          />
          {isEmpty && (
            <div
              style={{
                position: 'absolute',
                top: 12,
                left: 12,
                color: 'var(--text-muted)',
                fontSize: 14,
                pointerEvents: 'none',
                opacity: 0.7,
              }}
            >
              {placeholder}
            </div>
          )}
        </div>
      )}

      {/* 3. Editor Footer Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          borderTop: '1px solid var(--border-app)',
          background: 'var(--bg-subtle)',
          flexWrap: 'wrap',
          gap: 6
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)' }}>
          <CornerDownLeft size={12} />
          <span className="hidden sm:inline">Ctrl+Enter kutuma • Drag & drop au Ctrl+V kupakia picha</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn-ghost"
              style={{ fontSize: 13, padding: '5px 12px', borderRadius: 8 }}
            >
              Ghairi
            </button>
          )}

          <button
            type="button"
            onClick={onSubmit}
            className="btn-primary"
            disabled={isEmpty || submitting || isUploading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
              padding: '6px 16px',
              borderRadius: 8,
              opacity: isEmpty || submitting || isUploading ? 0.6 : 1,
              cursor: isEmpty || submitting || isUploading ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? (
              <>
                <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Inatuma...</span>
              </>
            ) : (
              <>
                <Send size={13} />
                <span>{submitLabel}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Helper component to safely render rich formatted comment text.
 */
export const CommentContent: React.FC<{ content: string; className?: string }> = ({ content, className = '' }) => {
  const hasHtml = /<[a-z][\s\S]*>/i.test(content);

  if (hasHtml) {
    return (
      <div
        className={`comment-rich-render ${className}`}
        dangerouslySetInnerHTML={{ __html: content }}
        style={{
          fontSize: 14,
          color: 'var(--text-body)',
          lineHeight: 1.6,
          wordBreak: 'break-word',
        }}
      />
    );
  }

  return (
    <p
      className={className}
      style={{
        fontSize: 14,
        color: 'var(--text-body)',
        lineHeight: 1.6,
        marginBottom: 12,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}
    >
      {content}
    </p>
  );
};

// Styles
const toolbarBtnStyle: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: 6,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'transparent',
  border: 'none',
  color: 'var(--text-muted)',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
};

const dividerStyle: React.CSSProperties = {
  width: 1,
  height: 16,
  background: 'var(--border-app)',
  margin: '0 4px',
};
