import React, { useState, useRef, useEffect } from 'react';
import { Bold, Italic, Code, Link2, List, Quote, Image, Heading1, Heading2, Strikethrough, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
    editorRef.current?.focus();
  };

  const handleBold = () => execCommand('bold');
  const handleItalic = () => execCommand('italic');
  const handleUnderline = () => execCommand('underline');
  const handleStrike = () => execCommand('strikeThrough');
  const handleH1 = () => execCommand('formatBlock', 'h1');
  const handleH2 = () => execCommand('formatBlock', 'h2');
  const handleUL = () => execCommand('insertUnorderedList');
  const handleOL = () => execCommand('insertOrderedList');
  const handleQuote = () => execCommand('formatBlock', 'blockquote');
  const handleAlignLeft = () => execCommand('justifyLeft');
  const handleAlignCenter = () => execCommand('justifyCenter');
  const handleAlignRight = () => execCommand('justifyRight');

  const handleLink = () => {
    if (linkUrl) {
      execCommand('createLink', linkUrl);
      setLinkUrl('');
      setShowLinkInput(false);
    }
  };

  const handleImage = () => {
    const url = prompt('Ingiza URL ya picha:');
    if (url) {
      execCommand('insertImage', url);
    }
  };

  const handleCode = () => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      const code = `<code style="background: rgba(30, 41, 59, 0.5); padding: 2px 6px; border-radius: 4px; font-family: monospace;">${selection.toString()}</code>`;
      execCommand('insertHTML', code);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    // Allow paste but sanitize
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    execCommand('insertText', text);
  };

  return (
    <div style={{ borderRadius: 12, border: '1px solid rgba(51, 65, 85, 0.5)', overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 2, padding: 8,
        borderBottom: '1px solid rgba(51, 65, 85, 0.5)',
        background: 'rgba(30, 41, 59, 0.3)',
        flexWrap: 'wrap',
      }}>
        <ToolButton icon={Bold} onClick={handleBold} title="Bold (Ctrl+B)" />
        <ToolButton icon={Italic} onClick={handleItalic} title="Italic (Ctrl+I)" />
        <ToolButton icon={Strikethrough} onClick={handleStrike} title="Strikethrough" />
        <Divider />
        <ToolButton icon={Heading1} onClick={handleH1} title="Heading 1" />
        <ToolButton icon={Heading2} onClick={handleH2} title="Heading 2" />
        <Divider />
        <ToolButton icon={List} onClick={handleUL} title="Bullet List" />
        <ToolButton icon={List} onClick={handleOL} title="Numbered List" />
        <ToolButton icon={Quote} onClick={handleQuote} title="Quote" />
        <Divider />
        <ToolButton icon={AlignLeft} onClick={handleAlignLeft} title="Align Left" />
        <ToolButton icon={AlignCenter} onClick={handleAlignCenter} title="Align Center" />
        <ToolButton icon={AlignRight} onClick={handleAlignRight} title="Align Right" />
        <Divider />
        <ToolButton icon={Code} onClick={handleCode} title="Code" />
        <ToolButton icon={Link2} onClick={() => setShowLinkInput(!showLinkInput)} title="Link" />
        <ToolButton icon={Image} onClick={handleImage} title="Image" />
      </div>

      {/* Link Input */}
      {showLinkInput && (
        <div style={{
          padding: 8, borderBottom: '1px solid rgba(51, 65, 85, 0.5)',
          display: 'flex', gap: 8, background: 'rgba(30, 41, 59, 0.3)',
        }}>
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://example.com"
            style={{
              flex: 1, padding: 8, borderRadius: 6,
              background: 'rgba(15, 23, 42, 0.5)',
              border: '1px solid rgba(51, 65, 85, 0.5)',
              color: '#e2e8f0', fontSize: 13,
            }}
          />
          <button onClick={handleLink} className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>
            Ongeza
          </button>
        </div>
      )}

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        style={{
          minHeight: 200,
          padding: 16,
          background: 'transparent',
          color: '#e2e8f0',
          fontSize: 14,
          lineHeight: 1.6,
          outline: 'none',
        }}
        suppressContentEditableWarning
      />

      <style>{`
        [contenteditable] h1 { font-size: 24px; font-weight: 700; margin: 16px 0 8px; }
        [contenteditable] h2 { font-size: 20px; font-weight: 600; margin: 12px 0 6px; }
        [contenteditable] blockquote {
          border-left: 3px solid #6366f1;
          padding-left: 16px;
          margin: 12px 0;
          color: #94a3b8;
          font-style: italic;
        }
        [contenteditable] ul, [contenteditable] ol { padding-left: 24px; margin: 8px 0; }
        [contenteditable] img { max-width: 100%; border-radius: 8px; margin: 8px 0; }
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #64748b;
        }
      `}</style>
    </div>
  );
};

const ToolButton: React.FC<{ icon: any; onClick: () => void; title: string }> = ({ icon: Icon, onClick, title }) => (
  <button
    onClick={onClick}
    title={title}
    style={{
      padding: 6, borderRadius: 4,
      background: 'transparent', border: 'none',
      cursor: 'pointer', color: '#94a3b8',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}
    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)'}
    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
  >
    <Icon size={16} />
  </button>
);

const Divider = () => (
  <div style={{ width: 1, height: 20, background: 'rgba(51, 65, 85, 0.5)', margin: '0 4px' }} />
);
