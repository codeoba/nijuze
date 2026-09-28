import React, { useState } from 'react';
import { X, Send, Plus, Trash2, BarChart3 } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface Poll {
  id: string;
  question: string;
  options: { id: string; text: string; votes: number }[];
  totalVotes: number;
  endsAt: string;
  isAnonymous: boolean;
  allowMultiple: boolean;
}

interface CreatePollModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatePollModal: React.FC<CreatePollModalProps> = ({ isOpen, onClose }) => {
  const { createPost, currentUser } = useApp();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [duration, setDuration] = useState(24); // hours
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [allowMultiple, setAllowMultiple] = useState(false);

  if (!isOpen) return null;

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = () => {
    if (!question.trim() || options.some(opt => !opt.trim())) {
      alert('Tafadhali jaza swali na chaguzi zote');
      return;
    }

    // Create post with poll data
    const pollData = {
      type: 'poll',
      question,
      options: options.map((opt, i) => ({ id: `opt-${i}`, text: opt, votes: 0 })),
      duration,
      isAnonymous,
      allowMultiple,
    };

    createPost(
      question,
      JSON.stringify(pollData),
      ['Poll', 'Utafiti'],
      'Utafiti',
      false
    );

    setQuestion('');
    setOptions(['', '']);
    setDuration(24);
    setIsAnonymous(false);
    setAllowMultiple(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: 560,
          margin: '0 16px',
          padding: 24,
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChart3 size={24} color="#818cf8" />
            Unda Kura
          </h2>
          <button
            onClick={onClose}
            style={{ padding: 8, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <X size={20} color="#cbd5e1" />
          </button>
        </div>

        {/* Question */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-body)', marginBottom: 8, display: 'block' }}>
            Swali la Kura *
          </label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Andika swali lako..."
            style={{
              width: '100%',
              padding: 12,
              borderRadius: 12,
              background: 'var(--input-bg)',
              border: '1px solid var(--border-app)',
              color: 'var(--text-main)',
              fontSize: 14,
            }}
          />
        </div>

        {/* Options */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-body)', marginBottom: 8, display: 'block' }}>
            Chaguzi * (2-6)
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {options.map((option, index) => (
              <div key={index} style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Chaguo ${index + 1}`}
                  style={{
                    flex: 1,
                    padding: 12,
                    borderRadius: 12,
                    background: 'var(--input-bg)',
                    border: '1px solid var(--border-app)',
                    color: 'var(--text-main)',
                    fontSize: 14,
                  }}
                />
                {options.length > 2 && (
                  <button
                    onClick={() => removeOption(index)}
                    style={{
                      padding: 12,
                      borderRadius: 12,
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={16} color="#ef4444" />
                  </button>
                )}
              </div>
            ))}
            {options.length < 6 && (
              <button
                onClick={addOption}
                style={{
                  padding: 12,
                  borderRadius: 12,
                  background: 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  color: 'var(--btn-ghost-text)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  fontSize: 14,
                }}
              >
                <Plus size={16} />
                Ongeza Chaguo
              </button>
            )}
          </div>
        </div>

        {/* Duration */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-body)', marginBottom: 8, display: 'block' }}>
            Muda wa Kura (masaa)
          </label>
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            style={{
              width: '100%',
              padding: 12,
              borderRadius: 12,
              background: 'var(--input-bg)',
              border: '1px solid var(--border-app)',
              color: 'var(--text-main)',
              fontSize: 14,
            }}
          >
            <option value={1}>Saa 1</option>
            <option value={6}>Masaa 6</option>
            <option value={12}>Masaa 12</option>
            <option value={24}>Siku 1</option>
            <option value={48}>Siku 2</option>
            <option value={72}>Siku 3</option>
            <option value={168}>Wiki 1</option>
          </select>
        </div>

        {/* Options */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 12 }}>
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              style={{ width: 16, height: 16, borderRadius: 4 }}
            />
            <span style={{ fontSize: 14, color: 'var(--text-body)' }}>Kura ya siri (watu hawaoni nani alipiga kura)</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={allowMultiple}
              onChange={(e) => setAllowMultiple(e.target.checked)}
              style={{ width: 16, height: 16, borderRadius: 4 }}
            />
            <span style={{ fontSize: 14, color: 'var(--text-body)' }}>Ruhusu kura nyingi (mtu anaweza kuchagua zaidi ya moja)</span>
          </label>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            className="btn-ghost"
          >
            Ghairi
          </button>
          <button
            onClick={handleSubmit}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Send size={16} />
            Chapisha Kura
          </button>
        </div>
      </div>
    </div>
  );
};

interface PollCardProps {
  poll: Poll;
  hasVoted: boolean;
  onVote: (optionId: string) => void;
}

export const PollCard: React.FC<PollCardProps> = ({ poll, hasVoted, onVote }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleVote = () => {
    if (selectedOption) {
      onVote(selectedOption);
    }
  };

  const getTimeRemaining = () => {
    const now = new Date().getTime();
    const end = new Date(poll.endsAt).getTime();
    const diff = end - now;

    if (diff <= 0) return 'Imeisha';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `Siku ${days} zimebaki`;
    if (hours > 0) return `Masaa ${hours} yamebaki`;
    return 'Saa chache zimebaki';
  };

  return (
    <div className="glass-card" style={{ padding: 20 }}>
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>{poll.question}</h3>

      {!hasVoted ? (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {poll.options.map((option) => (
              <label
                key={option.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: 12,
                  borderRadius: 12,
                  background: selectedOption === option.id ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-subtle)',
                  border: `1px solid ${selectedOption === option.id ? 'rgba(99, 102, 241, 0.5)' : 'var(--border-app)'}`,
                  cursor: 'pointer',
                }}
              >
                <input
                  type={poll.allowMultiple ? 'checkbox' : 'radio'}
                  name={`poll-${poll.id}`}
                  checked={selectedOption === option.id}
                  onChange={() => setSelectedOption(option.id)}
                  style={{ width: 16, height: 16 }}
                />
                <span style={{ fontSize: 14, color: 'var(--text-main)' }}>{option.text}</span>
              </label>
            ))}
          </div>
          <button
            onClick={handleVote}
            className="btn-primary"
            disabled={!selectedOption}
            style={{ width: '100%' }}
          >
            Piga Kura
          </button>
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {poll.options.map((option) => {
            const percentage = poll.totalVotes > 0 ? (option.votes / poll.totalVotes) * 100 : 0;
            return (
              <div key={option.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 14, color: 'var(--text-main)' }}>{option.text}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--btn-ghost-text)' }}>
                    {percentage.toFixed(1)}%
                  </span>
                </div>
                <div style={{
                  height: 8,
                  borderRadius: 4,
                  background: 'var(--input-bg)',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${percentage}%`,
                    background: 'linear-gradient(90deg, #6366f1, #9333ea)',
                    borderRadius: 4,
                    transition: 'width 0.5s ease',
                  }} />
                </div>
                <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                  {option.votes} kura
                </p>
              </div>
            );
          })}
        </div>
      )}

      <div style={{
        marginTop: 16,
        paddingTop: 16,
        borderTop: '1px solid var(--border-app)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontSize: 13, color: '#64748b' }}>
          {poll.totalVotes} jumla ya kura
        </span>
        <span style={{ fontSize: 13, color: '#64748b' }}>
          {getTimeRemaining()}
        </span>
      </div>
    </div>
  );
};
