import React, { useState, useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    {
      category: 'Navigation',
      items: [
        { keys: ['G', 'H'], action: 'Nenda Nyumbani' },
        { keys: ['G', 'E'], action: 'Nenda Gundua' },
        { keys: ['G', 'T'], action: 'Nenda Trending' },
        { keys: ['G', 'B'], action: 'Nenda Bookmarks' },
        { keys: ['G', 'P'], action: 'Nenda Profile' },
      ],
    },
    {
      category: 'Actions',
      items: [
        { keys: ['N'], action: 'Unda Post Mpya' },
        { keys: ['/'], action: 'Tafuta' },
        { keys: ['?'], action: 'Onyesha Shortcuts' },
        { keys: ['Esc'], action: 'Funga Modal' },
      ],
    },
    {
      category: 'Posts',
      items: [
        { keys: ['J'], action: 'Post Inayofuata' },
        { keys: ['K'], action: 'Post Iliyotangulia' },
        { keys: ['U'], action: 'Piga Upvote' },
        { keys: ['D'], action: 'Piga Downvote' },
        { keys: ['B'], action: 'Bookmark Post' },
        { keys: ['C'], action: 'Fungua Comments' },
        { keys: ['S'], action: 'Shiriki Post' },
      ],
    },
    {
      category: 'General',
      items: [
        { keys: ['Ctrl', 'K'], action: 'Tafuta' },
        { keys: ['Ctrl', 'N'], action: 'Post Mpya' },
        { keys: ['Ctrl', 'B'], action: 'Bookmarks' },
        { keys: ['Ctrl', 'M'], action: 'Messages' },
        { keys: ['Ctrl', ','], action: 'Settings' },
      ],
    },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: 700,
          margin: '0 16px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: 24,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Keyboard size={24} color="#818cf8" />
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            style={{ padding: 8, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <X size={20} color="#cbd5e1" />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {shortcuts.map((section) => (
            <div key={section.category}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#a5b4fc' }}>
                {section.category}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {section.items.map((shortcut, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 12,
                      borderRadius: 8,
                      background: 'rgba(30, 41, 59, 0.3)',
                    }}
                  >
                    <span style={{ fontSize: 14, color: '#cbd5e1' }}>{shortcut.action}</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {shortcut.keys.map((key, i) => (
                        <React.Fragment key={i}>
                          <kbd
                            style={{
                              padding: '4px 8px',
                              borderRadius: 6,
                              background: 'rgba(51, 65, 85, 0.5)',
                              border: '1px solid rgba(71, 85, 105, 0.5)',
                              fontSize: 12,
                              fontFamily: 'monospace',
                              color: '#e2e8f0',
                              minWidth: 24,
                              textAlign: 'center',
                            }}
                          >
                            {key}
                          </kbd>
                          {i < shortcut.keys.length - 1 && (
                            <span style={{ color: '#64748b', fontSize: 12, alignSelf: 'center' }}>+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 24,
          padding: 16,
          borderRadius: 12,
          background: 'rgba(99, 102, 241, 0.05)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
        }}>
          <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>
            💡 <strong style={{ color: '#a5b4fc' }}>Tip:</strong> Bofya <kbd style={{
              padding: '2px 6px',
              borderRadius: 4,
              background: 'rgba(51, 65, 85, 0.5)',
              fontSize: 11,
              fontFamily: 'monospace',
            }}>?</kbd> wakati wowote kuona shortcuts hizi
          </p>
        </div>
      </div>
    </div>
  );
};

// Keyboard shortcuts hook
export const useKeyboardShortcuts = (handlers: { [key: string]: () => void }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const key = e.key.toLowerCase();
      
      // Ctrl/Cmd combinations
      if (e.ctrlKey || e.metaKey) {
        const comboKey = `ctrl+${key}`;
        if (handlers[comboKey]) {
          e.preventDefault();
          handlers[comboKey]();
        }
        return;
      }

      // Single key
      if (handlers[key]) {
        handlers[key]();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
};
