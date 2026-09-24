import React, { useState } from 'react';
import { Code, Copy, Check } from 'lucide-react';

interface CodeSnippetProps {
  code: string;
  language?: string;
}

export const CodeSnippet: React.FC<CodeSnippetProps> = ({ code, language = 'javascript' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple syntax highlighting
  const highlightCode = (code: string) => {
    // Keywords
    let highlighted = code.replace(
      /\b(const|let|var|function|return|if|else|for|while|class|import|export|from|async|await|try|catch|throw)\b/g,
      '<span style="color: #c084fc; font-weight: 600;">$1</span>'
    );

    // Strings
    highlighted = highlighted.replace(
      /(["'`])(?:(?=(\\?))\2.)*?\1/g,
      '<span style="color: #86efac;">$&</span>'
    );

    // Comments
    highlighted = highlighted.replace(
      /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
      '<span style="color: #64748b; font-style: italic;">$1</span>'
    );

    // Numbers
    highlighted = highlighted.replace(
      /\b\d+\b/g,
      '<span style="color: #fbbf24;">$&</span>'
    );

    // Functions
    highlighted = highlighted.replace(
      /\b([a-zA-Z_]\w*)\s*\(/g,
      '<span style="color: #60a5fa;">$1</span>('
    );

    return highlighted;
  };

  return (
    <div style={{
      borderRadius: 12,
      overflow: 'hidden',
      border: '1px solid rgba(51, 65, 85, 0.5)',
      background: '#0f172a',
      margin: '12px 0',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 16px',
        background: 'rgba(30, 41, 59, 0.8)',
        borderBottom: '1px solid rgba(51, 65, 85, 0.5)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Code size={16} color="#818cf8" />
          <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>
            {language}
          </span>
        </div>
        <button
          onClick={handleCopy}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 6,
            background: copied ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.1)',
            border: `1px solid ${copied ? 'rgba(16, 185, 129, 0.3)' : 'rgba(99, 102, 241, 0.2)'}`,
            color: copied ? '#10b981' : '#a5b4fc',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 500,
            transition: 'all 0.2s ease',
          }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Imenakiliwa!' : 'Nakili'}
        </button>
      </div>

      {/* Code */}
      <pre style={{
        margin: 0,
        padding: 16,
        overflowX: 'auto',
        fontSize: 14,
        lineHeight: 1.6,
        fontFamily: 'Consolas, Monaco, "Courier New", monospace',
      }}>
        <code
          style={{ color: '#e2e8f0' }}
          dangerouslySetInnerHTML={{ __html: highlightCode(code) }}
        />
      </pre>
    </div>
  );
};

interface CodeBlockInputProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  onLanguageChange: (language: string) => void;
}

export const CodeBlockInput: React.FC<CodeBlockInputProps> = ({
  value,
  onChange,
  language,
  onLanguageChange,
}) => {
  const languages = [
    'javascript',
    'typescript',
    'python',
    'java',
    'cpp',
    'csharp',
    'go',
    'rust',
    'php',
    'ruby',
    'swift',
    'kotlin',
    'sql',
    'html',
    'css',
    'bash',
  ];

  return (
    <div style={{
      borderRadius: 12,
      overflow: 'hidden',
      border: '1px solid rgba(51, 65, 85, 0.5)',
      background: '#0f172a',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 16px',
        background: 'rgba(30, 41, 59, 0.8)',
        borderBottom: '1px solid rgba(51, 65, 85, 0.5)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Code size={16} color="#818cf8" />
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            style={{
              padding: '4px 8px',
              borderRadius: 6,
              background: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(51, 65, 85, 0.5)',
              color: '#e2e8f0',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Code Input */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Andika code yako hapa..."
        style={{
          width: '100%',
          minHeight: 200,
          padding: 16,
          margin: 0,
          background: 'transparent',
          border: 'none',
          color: '#e2e8f0',
          fontSize: 14,
          lineHeight: 1.6,
          fontFamily: 'Consolas, Monaco, "Courier New", monospace',
          resize: 'vertical',
        }}
      />
    </div>
  );
};
