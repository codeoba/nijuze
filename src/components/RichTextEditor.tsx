import React, { useState, useRef, useEffect } from 'react';
import {
  Bold, Italic, Underline, Strikethrough, Code, Link2, List, Quote,
  Image, Heading1, Heading2, AlignLeft, AlignCenter, AlignRight,
  Undo, Redo, Type, Palette, Highlighter, Indent, Outdent,
  Subscript, Superscript, Minus, Table, Smile, Film, FileText,
  Maximize, Minimize, Eye, EyeOff, Save, Trash2, MoreHorizontal,
  Eraser, Columns, Rows, Delete, Plus, X
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  showToolbar?: boolean;
  autoSave?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Andika hapa...',
  minHeight = 300,
  showToolbar = true,
  autoSave = true,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showTableMenu, setShowTableMenu] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [showEmbedInput, setShowEmbedInput] = useState(false);
  const [embedUrl, setEmbedUrl] = useState('');
  const [fontSize, setFontSize] = useState('3');
  const [fontFamily, setFontFamily] = useState('Inter');

  // Auto-save to localStorage
  useEffect(() => {
    if (autoSave && value) {
      const timer = setTimeout(() => {
        localStorage.setItem('editor_draft', value);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [value, autoSave]);

  // Load draft on mount
  useEffect(() => {
    if (autoSave && !value) {
      const draft = localStorage.getItem('editor_draft');
      if (draft) {
        onChange(draft);
      }
    }
  }, []);

  // Update word and character count
  useEffect(() => {
    if (editorRef.current) {
      const text = editorRef.current.innerText || '';
      const words = text.trim().split(/\s+/).filter(w => w.length > 0);
      setWordCount(words.length);
      setCharCount(text.length);
    }
  }, [value]);

  // Initialize editor content
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

  // Text Formatting
  const handleBold = () => execCommand('bold');
  const handleItalic = () => execCommand('italic');
  const handleUnderline = () => execCommand('underline');
  const handleStrike = () => execCommand('strikeThrough');
  const handleSubscript = () => execCommand('subscript');
  const handleSuperscript = () => execCommand('superscript');

  // Headings
  const handleH1 = () => execCommand('formatBlock', 'h1');
  const handleH2 = () => execCommand('formatBlock', 'h2');
  const handleH3 = () => execCommand('formatBlock', 'h3');
  const handleParagraph = () => execCommand('formatBlock', 'p');

  // Alignment
  const handleAlignLeft = () => execCommand('justifyLeft');
  const handleAlignCenter = () => execCommand('justifyCenter');
  const handleAlignRight = () => execCommand('justifyRight');
  const handleAlignJustify = () => execCommand('justifyFull');

  // Lists
  const handleUL = () => execCommand('insertUnorderedList');
  const handleOL = () => execCommand('insertOrderedList');
  const handleIndent = () => execCommand('indent');
  const handleOutdent = () => execCommand('outdent');

  // Other
  const handleQuote = () => execCommand('formatBlock', 'blockquote');
  const handleHR = () => execCommand('insertHorizontalRule');
  const handleUndo = () => execCommand('undo');
  const handleRedo = () => execCommand('redo');
  const handleClearFormatting = () => execCommand('removeFormat');

  // Font Size
  const handleFontSize = (size: string) => {
    setFontSize(size);
    execCommand('fontSize', size);
  };

  // Font Family
  const handleFontFamily = (family: string) => {
    setFontFamily(family);
    execCommand('fontName', family);
  };

  // Text Color
  const handleTextColor = (color: string) => {
    execCommand('foreColor', color);
    setShowColorPicker(false);
  };

  // Highlight Color
  const handleHighlightColor = (color: string) => {
    execCommand('hiliteColor', color);
    setShowHighlightPicker(false);
  };

  // Link
  const handleLink = () => {
    if (linkUrl) {
      const selection = window.getSelection();
      const text = linkText || selection?.toString() || linkUrl;
      const html = `<a href="${linkUrl}" target="_blank" style="color: #6366f1; text-decoration: underline;">${text}</a>`;
      execCommand('insertHTML', html);
      setLinkUrl('');
      setLinkText('');
      setShowLinkInput(false);
    }
  };

  // Image
  const handleImage = () => {
    const url = prompt('Ingiza URL ya picha:');
    if (url) {
      const alt = prompt('Ingiza alt text (maelezo ya picha):') || '';
      const html = `<img src="${url}" alt="${alt}" style="max-width: 100%; border-radius: 8px; margin: 8px 0;" />`;
      execCommand('insertHTML', html);
    }
  };

  // Code Block
  const handleCodeBlock = () => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      const code = `<pre style="background: rgba(30, 41, 59, 0.8); padding: 16px; border-radius: 8px; overflow-x: auto; font-family: 'Courier New', monospace; margin: 12px 0;"><code>${selection.toString()}</code></pre>`;
      execCommand('insertHTML', code);
    } else {
      const html = `<pre style="background: rgba(30, 41, 59, 0.8); padding: 16px; border-radius: 8px; overflow-x: auto; font-family: 'Courier New', monospace; margin: 12px 0;"><code>// Andika code yako hapa\n</code></pre>`;
      execCommand('insertHTML', html);
    }
  };

  // Inline Code
  const handleInlineCode = () => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      const code = `<code style="background: rgba(30, 41, 59, 0.5); padding: 2px 6px; border-radius: 4px; font-family: monospace;">${selection.toString()}</code>`;
      execCommand('insertHTML', code);
    }
  };

  // Table
  const handleInsertTable = (rows: number, cols: number) => {
    let html = '<table style="width: 100%; border-collapse: collapse; margin: 12px 0;">';
    for (let i = 0; i < rows; i++) {
      html += '<tr>';
      for (let j = 0; j < cols; j++) {
        const tag = i === 0 ? 'th' : 'td';
        const style = 'border: 1px solid rgba(51, 65, 85, 0.5); padding: 8px; text-align: left;';
        const bgStyle = i === 0 ? 'background: rgba(99, 102, 241, 0.1); font-weight: 600;' : '';
        html += `<${tag} style="${style} ${bgStyle}">${i === 0 ? `Header ${j + 1}` : ''}</${tag}>`;
      }
      html += '</tr>';
    }
    html += '</table>';
    execCommand('insertHTML', html);
    setShowTableMenu(false);
  };

  // Embed
  const handleEmbed = () => {
    if (embedUrl) {
      let embedHtml = '';
      
      // YouTube
      if (embedUrl.includes('youtube.com') || embedUrl.includes('youtu.be')) {
        const videoId = embedUrl.includes('youtu.be')
          ? embedUrl.split('/').pop()
          : new URL(embedUrl).searchParams.get('v');
        embedHtml = `<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 12px 0;"><iframe src="https://www.youtube.com/embed/${videoId}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; border-radius: 8px;" allowfullscreen></iframe></div>`;
      }
      // Twitter
      else if (embedUrl.includes('twitter.com')) {
        embedHtml = `<blockquote class="twitter-tweet" style="margin: 12px 0;"><a href="${embedUrl}">${embedUrl}</a></blockquote><script async src="https://platform.twitter.com/widgets.js"></script>`;
      }
      // Generic iframe
      else {
        embedHtml = `<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 12px 0;"><iframe src="${embedUrl}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; border-radius: 8px;" allowfullscreen></iframe></div>`;
      }
      
      execCommand('insertHTML', embedHtml);
      setEmbedUrl('');
      setShowEmbedInput(false);
    }
  };

  // Emoji
  const handleEmoji = (emoji: string) => {
    execCommand('insertText', emoji);
    setShowEmojiPicker(false);
  };

  // File Attachment
  const handleFileAttachment = () => {
    const fileName = prompt('Ingiza jina la faili:');
    const fileUrl = prompt('Ingiza URL ya faili:');
    if (fileName && fileUrl) {
      const html = `<a href="${fileUrl}" download style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 12px; background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 8px; color: #a5b4fc; text-decoration: none; margin: 8px 0;"><span>📎</span><span>${fileName}</span></a>`;
      execCommand('insertHTML', html);
    }
  };

  // Clear Draft
  const handleClearDraft = () => {
    if (confirm('Una uhakika unataka kufuta draft?')) {
      localStorage.removeItem('editor_draft');
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
        onChange('');
      }
    }
  };

  // Input handler
  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  // Paste handler
  const handlePaste = (e: React.ClipboardEvent) => {
    // Allow rich paste but sanitize
    const html = e.clipboardData.getData('text/html');
    const text = e.clipboardData.getData('text/plain');
    
    if (html) {
      // Basic sanitization - remove script tags
      const sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      e.preventDefault();
      execCommand('insertHTML', sanitized);
    }
  };

  // Keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          handleBold();
          break;
        case 'i':
          e.preventDefault();
          handleItalic();
          break;
        case 'u':
          e.preventDefault();
          handleUnderline();
          break;
        case 'z':
          e.preventDefault();
          handleUndo();
          break;
        case 'y':
          e.preventDefault();
          handleRedo();
          break;
      }
    }
  };

  const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄', '💋', '🩸'];

  const colors = [
    '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
    '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
    '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc',
    '#dd7e6b', '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#a4c2f4', '#9fc5e8', '#b4a7d6', '#d5a6bd',
    '#cc4125', '#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6d9eeb', '#6fa8dc', '#8e7cc3', '#c27ba0',
    '#a61c00', '#cc0000', '#e69138', '#f1c232', '#6aa84f', '#45818e', '#3c78d8', '#3d85c6', '#674ea7', '#a64d79',
  ];

  const fontSizes = [
    { value: '1', label: '8pt' },
    { value: '2', label: '10pt' },
    { value: '3', label: '12pt' },
    { value: '4', label: '14pt' },
    { value: '5', label: '18pt' },
    { value: '6', label: '24pt' },
    { value: '7', label: '36pt' },
  ];

  const fontFamilies = [
    'Inter',
    'Arial',
    'Times New Roman',
    'Courier New',
    'Georgia',
    'Verdana',
    'Comic Sans MS',
    'Impact',
  ];

  return (
    <div style={{
      borderRadius: 12,
      border: '1px solid rgba(51, 65, 85, 0.5)',
      overflow: 'hidden',
      background: isFullscreen ? '#0f0f23' : 'transparent',
      position: isFullscreen ? 'fixed' : 'relative',
      inset: isFullscreen ? 0 : 'auto',
      zIndex: isFullscreen ? 9999 : 'auto',
    }}>
      {showToolbar && !isPreview && (
        <>
          {/* Main Toolbar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            padding: 8,
            borderBottom: '1px solid rgba(51, 65, 85, 0.5)',
            background: 'rgba(30, 41, 59, 0.3)',
            flexWrap: 'wrap',
          }}>
            {/* Undo/Redo */}
            <ToolButton icon={Undo} onClick={handleUndo} title="Undo (Ctrl+Z)" />
            <ToolButton icon={Redo} onClick={handleRedo} title="Redo (Ctrl+Y)" />
            <Divider />

            {/* Font Family */}
            <select
              value={fontFamily}
              onChange={(e) => handleFontFamily(e.target.value)}
              style={{
                padding: '4px 8px',
                borderRadius: 4,
                background: 'rgba(15, 23, 42, 0.5)',
                border: '1px solid rgba(51, 65, 85, 0.5)',
                color: '#e2e8f0',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              {fontFamilies.map((family) => (
                <option key={family} value={family}>{family}</option>
              ))}
            </select>

            {/* Font Size */}
            <select
              value={fontSize}
              onChange={(e) => handleFontSize(e.target.value)}
              style={{
                padding: '4px 8px',
                borderRadius: 4,
                background: 'rgba(15, 23, 42, 0.5)',
                border: '1px solid rgba(51, 65, 85, 0.5)',
                color: '#e2e8f0',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              {fontSizes.map((size) => (
                <option key={size.value} value={size.value}>{size.label}</option>
              ))}
            </select>
            <Divider />

            {/* Text Formatting */}
            <ToolButton icon={Bold} onClick={handleBold} title="Bold (Ctrl+B)" />
            <ToolButton icon={Italic} onClick={handleItalic} title="Italic (Ctrl+I)" />
            <ToolButton icon={Underline} onClick={handleUnderline} title="Underline (Ctrl+U)" />
            <ToolButton icon={Strikethrough} onClick={handleStrike} title="Strikethrough" />
            <ToolButton icon={Subscript} onClick={handleSubscript} title="Subscript" />
            <ToolButton icon={Superscript} onClick={handleSuperscript} title="Superscript" />
            <Divider />

            {/* Colors */}
            <div style={{ position: 'relative' }}>
              <ToolButton
                icon={Palette}
                onClick={() => {
                  setShowColorPicker(!showColorPicker);
                  setShowHighlightPicker(false);
                }}
                title="Text Color"
              />
              {showColorPicker && (
                <ColorPicker
                  colors={colors}
                  onSelect={handleTextColor}
                  onClose={() => setShowColorPicker(false)}
                />
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <ToolButton
                icon={Highlighter}
                onClick={() => {
                  setShowHighlightPicker(!showHighlightPicker);
                  setShowColorPicker(false);
                }}
                title="Highlight Color"
              />
              {showHighlightPicker && (
                <ColorPicker
                  colors={colors}
                  onSelect={handleHighlightColor}
                  onClose={() => setShowHighlightPicker(false)}
                />
              )}
            </div>
            <ToolButton icon={Eraser} onClick={handleClearFormatting} title="Clear Formatting" />
            <Divider />

            {/* Headings */}
            <ToolButton icon={Heading1} onClick={handleH1} title="Heading 1" />
            <ToolButton icon={Heading2} onClick={handleH2} title="Heading 2" />
            <Divider />

            {/* Alignment */}
            <ToolButton icon={AlignLeft} onClick={handleAlignLeft} title="Align Left" />
            <ToolButton icon={AlignCenter} onClick={handleAlignCenter} title="Align Center" />
            <ToolButton icon={AlignRight} onClick={handleAlignRight} title="Align Right" />
            <Divider />

            {/* Lists */}
            <ToolButton icon={List} onClick={handleUL} title="Bullet List" />
            <ToolButton icon={List} onClick={handleOL} title="Numbered List" />
            <ToolButton icon={Indent} onClick={handleIndent} title="Indent" />
            <ToolButton icon={Outdent} onClick={handleOutdent} title="Outdent" />
            <Divider />

            {/* Insert Elements */}
            <ToolButton icon={Quote} onClick={handleQuote} title="Blockquote" />
            <ToolButton icon={Code} onClick={handleInlineCode} title="Inline Code" />
            <ToolButton icon={FileText} onClick={handleCodeBlock} title="Code Block" />
            <ToolButton icon={Minus} onClick={handleHR} title="Horizontal Line" />
            
            {/* Table */}
            <div style={{ position: 'relative' }}>
              <ToolButton
                icon={Table}
                onClick={() => setShowTableMenu(!showTableMenu)}
                title="Insert Table"
              />
              {showTableMenu && (
                <TableMenu onInsert={handleInsertTable} onClose={() => setShowTableMenu(false)} />
              )}
            </div>

            {/* Link */}
            <ToolButton
              icon={Link2}
              onClick={() => setShowLinkInput(!showLinkInput)}
              title="Insert Link"
            />
            
            {/* Image */}
            <ToolButton icon={Image} onClick={handleImage} title="Insert Image" />
            
            {/* Embed */}
            <ToolButton
              icon={Film}
              onClick={() => setShowEmbedInput(!showEmbedInput)}
              title="Embed Video/Media"
            />
            
            {/* Emoji */}
            <div style={{ position: 'relative' }}>
              <ToolButton
                icon={Smile}
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                title="Insert Emoji"
              />
              {showEmojiPicker && (
                <EmojiPicker emojis={emojis} onSelect={handleEmoji} onClose={() => setShowEmojiPicker(false)} />
              )}
            </div>
            
            {/* File Attachment */}
            <ToolButton icon={FileText} onClick={handleFileAttachment} title="Attach File" />
            <Divider />

            {/* View Controls */}
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 2 }}>
              <ToolButton
                icon={isPreview ? EyeOff : Eye}
                onClick={() => setIsPreview(!isPreview)}
                title={isPreview ? 'Edit Mode' : 'Preview Mode'}
              />
              <ToolButton
                icon={isFullscreen ? Minimize : Maximize}
                onClick={() => setIsFullscreen(!isFullscreen)}
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              />
              <ToolButton icon={Trash2} onClick={handleClearDraft} title="Clear Draft" />
            </div>
          </div>

          {/* Link Input */}
          {showLinkInput && (
            <InsertInput
              label="Link"
              placeholder="https://example.com"
              value={linkUrl}
              onChange={setLinkUrl}
              onInsert={handleLink}
              onClose={() => setShowLinkInput(false)}
              secondaryPlaceholder="Link text (optional)"
              secondaryValue={linkText}
              onSecondaryChange={setLinkText}
            />
          )}

          {/* Embed Input */}
          {showEmbedInput && (
            <InsertInput
              label="Embed"
              placeholder="YouTube, Vimeo, or any embed URL"
              value={embedUrl}
              onChange={setEmbedUrl}
              onInsert={handleEmbed}
              onClose={() => setShowEmbedInput(false)}
            />
          )}
        </>
      )}

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={!isPreview}
        onInput={handleInput}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        data-placeholder={placeholder}
        style={{
          minHeight,
          padding: 16,
          background: isPreview ? 'rgba(30, 41, 59, 0.2)' : 'transparent',
          color: '#e2e8f0',
          fontSize: 14,
          lineHeight: 1.6,
          outline: 'none',
          fontFamily,
          overflowY: 'auto',
          maxHeight: isFullscreen ? 'calc(100vh - 120px)' : 600,
        }}
        suppressContentEditableWarning
      />

      {/* Status Bar */}
      <div style={{
        padding: '8px 16px',
        borderTop: '1px solid rgba(51, 65, 85, 0.5)',
        background: 'rgba(30, 41, 59, 0.3)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: 12,
        color: '#64748b',
      }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <span>{wordCount} maneno</span>
          <span>{charCount} herufi</span>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          {autoSave && <span>💾 Auto-saved</span>}
          <span>{isPreview ? '👁️ Preview' : '✏️ Edit'}</span>
        </div>
      </div>

      <style>{`
        [contenteditable] h1 { font-size: 28px; font-weight: 700; margin: 16px 0 8px; color: #f8fafc; }
        [contenteditable] h2 { font-size: 24px; font-weight: 600; margin: 14px 0 7px; color: #f1f5f9; }
        [contenteditable] h3 { font-size: 20px; font-weight: 600; margin: 12px 0 6px; color: #e2e8f0; }
        [contenteditable] p { margin: 8px 0; }
        [contenteditable] blockquote {
          border-left: 4px solid #6366f1;
          padding-left: 16px;
          margin: 12px 0;
          color: #94a3b8;
          font-style: italic;
          background: rgba(99, 102, 241, 0.05);
          padding: 12px 16px;
          border-radius: 0 8px 8px 0;
        }
        [contenteditable] ul, [contenteditable] ol { padding-left: 24px; margin: 8px 0; }
        [contenteditable] li { margin: 4px 0; }
        [contenteditable] img { max-width: 100%; border-radius: 8px; margin: 8px 0; }
        [contenteditable] a { color: #6366f1; text-decoration: underline; }
        [contenteditable] a:hover { color: #818cf8; }
        [contenteditable] pre {
          background: rgba(30, 41, 59, 0.8);
          padding: 16px;
          border-radius: 8px;
          overflow-x: auto;
          font-family: 'Courier New', monospace;
          margin: 12px 0;
          border: 1px solid rgba(51, 65, 85, 0.5);
        }
        [contenteditable] code {
          background: rgba(30, 41, 59, 0.5);
          padding: 2px 6px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 13px;
        }
        [contenteditable] pre code {
          background: transparent;
          padding: 0;
        }
        [contenteditable] table {
          width: 100%;
          border-collapse: collapse;
          margin: 12px 0;
        }
        [contenteditable] th, [contenteditable] td {
          border: 1px solid rgba(51, 65, 85, 0.5);
          padding: 8px;
          text-align: left;
        }
        [contenteditable] th {
          background: rgba(99, 102, 241, 0.1);
          font-weight: 600;
        }
        [contenteditable] hr {
          border: none;
          border-top: 2px solid rgba(51, 65, 85, 0.5);
          margin: 16px 0;
        }
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #64748b;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

// Tool Button Component
const ToolButton: React.FC<{ icon: any; onClick: () => void; title: string }> = ({ icon: Icon, onClick, title }) => (
  <button
    onClick={onClick}
    title={title}
    style={{
      padding: 6,
      borderRadius: 4,
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      color: '#94a3b8',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
      e.currentTarget.style.color = '#a5b4fc';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = 'transparent';
      e.currentTarget.style.color = '#94a3b8';
    }}
  >
    <Icon size={16} />
  </button>
);

// Divider Component
const Divider = () => (
  <div style={{ width: 1, height: 20, background: 'rgba(51, 65, 85, 0.5)', margin: '0 4px' }} />
);

// Color Picker Component
const ColorPicker: React.FC<{ colors: string[]; onSelect: (color: string) => void; onClose: () => void }> = ({ colors, onSelect, onClose }) => (
  <div
    style={{
      position: 'absolute',
      top: '100%',
      left: 0,
      marginTop: 4,
      padding: 12,
      background: 'rgba(26, 26, 46, 0.95)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(99, 102, 241, 0.3)',
      borderRadius: 12,
      zIndex: 100,
      width: 240,
    }}
  >
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 4 }}>
      {colors.map((color) => (
        <button
          key={color}
          onClick={() => onSelect(color)}
          style={{
            width: 20,
            height: 20,
            borderRadius: 4,
            background: color,
            border: '1px solid rgba(51, 65, 85, 0.5)',
            cursor: 'pointer',
            transition: 'transform 0.2s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        />
      ))}
    </div>
  </div>
);

// Emoji Picker Component
const EmojiPicker: React.FC<{ emojis: string[]; onSelect: (emoji: string) => void; onClose: () => void }> = ({ emojis, onSelect, onClose }) => (
  <div
    style={{
      position: 'absolute',
      top: '100%',
      right: 0,
      marginTop: 4,
      padding: 12,
      background: 'rgba(26, 26, 46, 0.95)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(99, 102, 241, 0.3)',
      borderRadius: 12,
      zIndex: 100,
      width: 320,
      maxHeight: 300,
      overflowY: 'auto',
    }}
  >
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 4 }}>
      {emojis.map((emoji, index) => (
        <button
          key={index}
          onClick={() => onSelect(emoji)}
          style={{
            width: 28,
            height: 28,
            borderRadius: 4,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)';
            e.currentTarget.style.transform = 'scale(1.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {emoji}
        </button>
      ))}
    </div>
  </div>
);

// Table Menu Component
const TableMenu: React.FC<{ onInsert: (rows: number, cols: number) => void; onClose: () => void }> = ({ onInsert, onClose }) => {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);

  return (
    <div
      style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        marginTop: 4,
        padding: 16,
        background: 'rgba(26, 26, 46, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        borderRadius: 12,
        zIndex: 100,
        width: 200,
      }}
    >
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4, display: 'block' }}>Rows</label>
        <input
          type="number"
          min="1"
          max="10"
          value={rows}
          onChange={(e) => setRows(Number(e.target.value))}
          style={{
            width: '100%',
            padding: 6,
            borderRadius: 6,
            background: 'rgba(15, 23, 42, 0.5)',
            border: '1px solid rgba(51, 65, 85, 0.5)',
            color: '#e2e8f0',
            fontSize: 13,
          }}
        />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4, display: 'block' }}>Columns</label>
        <input
          type="number"
          min="1"
          max="10"
          value={cols}
          onChange={(e) => setCols(Number(e.target.value))}
          style={{
            width: '100%',
            padding: 6,
            borderRadius: 6,
            background: 'rgba(15, 23, 42, 0.5)',
            border: '1px solid rgba(51, 65, 85, 0.5)',
            color: '#e2e8f0',
            fontSize: 13,
          }}
        />
      </div>
      <button
        onClick={() => onInsert(rows, cols)}
        className="btn-primary"
        style={{ width: '100%', fontSize: 13, padding: '8px 16px' }}
      >
        Insert Table
      </button>
    </div>
  );
};

// Insert Input Component
const InsertInput: React.FC<{
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onInsert: () => void;
  onClose: () => void;
  secondaryPlaceholder?: string;
  secondaryValue?: string;
  onSecondaryChange?: (value: string) => void;
}> = ({ label, placeholder, value, onChange, onInsert, onClose, secondaryPlaceholder, secondaryValue, onSecondaryChange }) => (
  <div style={{
    padding: 12,
    borderBottom: '1px solid rgba(51, 65, 85, 0.5)',
    display: 'flex',
    gap: 8,
    background: 'rgba(30, 41, 59, 0.3)',
    alignItems: 'center',
  }}>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        flex: 1,
        padding: 8,
        borderRadius: 6,
        background: 'rgba(15, 23, 42, 0.5)',
        border: '1px solid rgba(51, 65, 85, 0.5)',
        color: '#e2e8f0',
        fontSize: 13,
      }}
    />
    {secondaryPlaceholder && onSecondaryChange && (
      <input
        type="text"
        value={secondaryValue}
        onChange={(e) => onSecondaryChange(e.target.value)}
        placeholder={secondaryPlaceholder}
        style={{
          flex: 1,
          padding: 8,
          borderRadius: 6,
          background: 'rgba(15, 23, 42, 0.5)',
          border: '1px solid rgba(51, 65, 85, 0.5)',
          color: '#e2e8f0',
          fontSize: 13,
        }}
      />
    )}
    <button onClick={onInsert} className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>
      Insert
    </button>
    <button onClick={onClose} style={{ padding: 8, borderRadius: 6, background: 'transparent', border: 'none', cursor: 'pointer' }}>
      <X size={16} color="#94a3b8" />
    </button>
  </div>
);
