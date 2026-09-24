import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../contexts/AppContext';

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
}

export const MentionInput: React.FC<MentionInputProps> = ({ value, onChange, placeholder, multiline = false }) => {
  const { users } = useApp();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<typeof users>([]);
  const [mentionStart, setMentionStart] = useState(-1);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursorPos = inputRef.current?.selectionStart || 0;
    const textBeforeCursor = value.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const charBeforeAt = lastAtIndex > 0 ? textBeforeCursor[lastAtIndex - 1] : ' ';
      if (charBeforeAt === ' ' || charBeforeAt === '\n' || lastAtIndex === 0) {
        const mentionText = textBeforeCursor.substring(lastAtIndex + 1);
        if (!mentionText.includes(' ')) {
          setMentionStart(lastAtIndex);
          const filtered = users.filter(user =>
            user.username.toLowerCase().includes(mentionText.toLowerCase())
          ).slice(0, 5);
          setSuggestions(filtered);
          setShowSuggestions(filtered.length > 0);
          setSelectedIndex(0);
          return;
        }
      }
    }
    
    setShowSuggestions(false);
  }, [value, users]);

  const insertMention = (username: string) => {
    const cursorPos = inputRef.current?.selectionStart || 0;
    const before = value.substring(0, mentionStart);
    const after = value.substring(cursorPos);
    const newValue = `${before}@${username} ${after}`;
    onChange(newValue);
    setShowSuggestions(false);
    
    setTimeout(() => {
      if (inputRef.current) {
        const newPos = mentionStart + username.length + 2;
        inputRef.current.setSelectionRange(newPos, newPos);
        inputRef.current.focus();
      }
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % suggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        if (suggestions[selectedIndex]) {
          insertMention(suggestions[selectedIndex].username);
        }
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const highlightMentions = (text: string) => {
    return text.replace(/@(\w+)/g, '<span style="color: #6366f1; font-weight: 500;">@$1</span>');
  };

  const InputComponent = multiline ? 'textarea' : 'input';

  return (
    <div style={{ position: 'relative' }}>
      <InputComponent
        ref={inputRef as any}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: 12,
          borderRadius: 12,
          background: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid rgba(51, 65, 85, 0.5)',
          color: '#e2e8f0',
          fontSize: 14,
          resize: multiline ? 'vertical' : 'none',
          minHeight: multiline ? 80 : 'auto',
        }}
      />
      
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: 4,
            background: 'rgba(26, 26, 46, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: 12,
            maxHeight: 200,
            overflowY: 'auto',
            zIndex: 100,
          }}
        >
          {suggestions.map((user, index) => (
            <div
              key={user.id}
              onClick={() => insertMention(user.username)}
              style={{
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
                background: index === selectedIndex ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                borderBottom: index < suggestions.length - 1 ? '1px solid rgba(51, 65, 85, 0.3)' : 'none',
              }}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #9333ea)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 'bold',
                flexShrink: 0,
              }}>
                {user.avatar}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#e2e8f0' }}>
                  {user.username}
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>
                  {user.role}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Helper function to parse mentions from text
export const parseMentions = (text: string): string[] => {
  const mentions = text.match(/@(\w+)/g);
  return mentions ? mentions.map(m => m.substring(1)) : [];
};

// Helper function to render text with highlighted mentions
export const renderWithMentions = (text: string) => {
  const parts = text.split(/(@\w+)/g);
  return parts.map((part, index) => {
    if (part.startsWith('@')) {
      return (
        <span key={index} style={{ color: '#6366f1', fontWeight: 500, cursor: 'pointer' }}>
          {part}
        </span>
      );
    }
    return <span key={index}>{part}</span>;
  });
};
