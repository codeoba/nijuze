import React, { useState } from 'react';
import { X, Flag, AlertTriangle, Send } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: 'post' | 'comment' | 'user';
  contentId: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, contentType, contentId }) => {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const reasons = [
    { id: 'spam', label: 'Spam au advertising', icon: '🚫' },
    { id: 'harassment', label: 'Unyanyasaji au bullying', icon: '😠' },
    { id: 'hate', label: 'Chuki au ubaguzi', icon: '⚠️' },
    { id: 'violence', label: 'Ukali au vitisho', icon: '🚨' },
    { id: 'misinformation', label: 'Taarifa za uongo', icon: '❌' },
    { id: 'inappropriate', label: 'Maudhui ya kukatisha tamaa', icon: '🔞' },
    { id: 'copyright', label: 'Ukiukaji wa copyright', icon: '©️' },
    { id: 'other', label: 'Nyingine', icon: '📝' },
  ];

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!reason) {
      alert('Tafadhali chagua sababu');
      return;
    }

    // Simulate API call
    console.log('Report submitted:', {
      contentType,
      contentId,
      reason,
      details,
      timestamp: new Date().toISOString(),
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setReason('');
      setDetails('');
      onClose();
    }, 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: 500,
          margin: '0 16px',
          padding: 24,
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {submitted ? (
          <div style={{ textAlign: 'center', padding: 32 }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <Send size={32} color="#10b981" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
              Ripoti Imetumwa
            </h3>
            <p style={{ fontSize: 14, color: '#94a3b8' }}>
              Asante kwa kuripoti. Tutachunguza suala hili haraka iwezekanavyo.
            </p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Flag size={24} color="#ef4444" />
                Ripoti Maudhui
              </h2>
              <button
                onClick={onClose}
                style={{ padding: 8, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <X size={20} color="#cbd5e1" />
              </button>
            </div>

            <div style={{
              padding: 12,
              borderRadius: 12,
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              marginBottom: 20,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <AlertTriangle size={16} color="#ef4444" />
                <span style={{ fontSize: 13, color: '#fca5a5', fontWeight: 500 }}>
                  Kwa nini unaripoti hii {contentType === 'post' ? 'post' : contentType === 'comment' ? 'comment' : 'akaunti'}?
                </span>
              </div>
              <p style={{ fontSize: 12, color: '#94a3b8' }}>
                Ripoti yako itachunguzwa na timu yetu ya moderation.
              </p>
            </div>

            {/* Reasons */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 14, fontWeight: 500, color: '#cbd5e1', marginBottom: 12, display: 'block' }}>
                Chagua sababu *
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {reasons.map((r) => (
                  <label
                    key={r.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: 12,
                      borderRadius: 12,
                      background: reason === r.id ? 'rgba(99, 102, 241, 0.1)' : 'rgba(30, 41, 59, 0.3)',
                      border: `1px solid ${reason === r.id ? 'rgba(99, 102, 241, 0.5)' : 'rgba(51, 65, 85, 0.3)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={r.id}
                      checked={reason === r.id}
                      onChange={(e) => setReason(e.target.value)}
                      style={{ width: 16, height: 16 }}
                    />
                    <span style={{ fontSize: 20 }}>{r.icon}</span>
                    <span style={{ fontSize: 14, color: '#e2e8f0' }}>{r.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Details */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 14, fontWeight: 500, color: '#cbd5e1', marginBottom: 8, display: 'block' }}>
                Maelezo ya ziada (Hiari)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Eleza zaidi kuhusu suala hili..."
                style={{
                  width: '100%',
                  padding: 12,
                  borderRadius: 12,
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(51, 65, 85, 0.5)',
                  color: '#e2e8f0',
                  fontSize: 14,
                  resize: 'vertical',
                  minHeight: 100,
                }}
              />
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
                disabled={!reason}
              >
                <Send size={16} />
                Tuma Ripoti
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
