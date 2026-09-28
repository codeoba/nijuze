import React, { useState } from 'react';
import { Users, UserPlus, Edit, Eye, X, Check } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface Collaborator {
  userId: string;
  username: string;
  avatar: string;
  role: 'owner' | 'editor' | 'viewer';
  addedAt: string;
}

interface CollaborationModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  postTitle: string;
}

export const CollaborationModal: React.FC<CollaborationModalProps> = ({ isOpen, onClose, postId, postTitle }) => {
  const { users, currentUser } = useApp();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    {
      userId: currentUser?.id || '',
      username: currentUser?.username || '',
      avatar: currentUser?.avatar || '',
      role: 'owner',
      addedAt: new Date().toISOString(),
    },
  ]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'editor' | 'viewer'>('editor');
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isOpen) return null;

  const handleAddCollaborator = () => {
    if (!email) return;

    // Find user by email
    const user = users.find(u => u.email === email);
    if (!user) {
      alert('Mtumiaji hajapatikana');
      return;
    }

    // Check if already added
    if (collaborators.find(c => c.userId === user.id)) {
      alert('Mtumiaji huyu tayari ameongezwa');
      return;
    }

    const newCollaborator: Collaborator = {
      userId: user.id,
      username: user.username,
      avatar: user.avatar,
      role,
      addedAt: new Date().toISOString(),
    };

    setCollaborators([...collaborators, newCollaborator]);
    setEmail('');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleRemoveCollaborator = (userId: string) => {
    setCollaborators(collaborators.filter(c => c.userId !== userId));
  };

  const handleChangeRole = (userId: string, newRole: 'editor' | 'viewer') => {
    setCollaborators(collaborators.map(c =>
      c.userId === userId ? { ...c, role: newRole } : c
    ));
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <span style={{ fontSize: 16 }}>👑</span>;
      case 'editor':
        return <Edit size={16} color="#60a5fa" />;
      case 'viewer':
        return <Eye size={16} color="#94a3b8" />;
      default:
        return null;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return '#fbbf24';
      case 'editor':
        return '#60a5fa';
      case 'viewer':
        return '#94a3b8';
      default:
        return '#94a3b8';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: 600,
          margin: '0 16px',
          padding: 24,
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Users size={24} color="#818cf8" />
              Ushirikiano
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{postTitle}</p>
          </div>
          <button
            onClick={onClose}
            style={{ padding: 8, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <X size={20} color="#cbd5e1" />
          </button>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div style={{
            padding: 12,
            borderRadius: 12,
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <Check size={16} color="#10b981" />
            <span style={{ fontSize: 13, color: '#10b981' }}>Mshirikiani ameongezwa!</span>
          </div>
        )}

        {/* Add Collaborator */}
        <div style={{
          padding: 16,
          borderRadius: 12,
          background: 'rgba(30, 41, 59, 0.3)',
          border: '1px solid rgba(51, 65, 85, 0.3)',
          marginBottom: 20,
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserPlus size={16} color="#a5b4fc" />
            Ongeza Mshirikiani
          </h3>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              style={{
                flex: 1,
                padding: 10,
                borderRadius: 8,
                background: 'rgba(15, 23, 42, 0.5)',
                border: '1px solid rgba(51, 65, 85, 0.5)',
                color: 'var(--text-main)',
                fontSize: 14,
              }}
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'editor' | 'viewer')}
              style={{
                padding: 10,
                borderRadius: 8,
                background: 'rgba(15, 23, 42, 0.5)',
                border: '1px solid rgba(51, 65, 85, 0.5)',
                color: 'var(--text-main)',
                fontSize: 14,
              }}
            >
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          <button
            onClick={handleAddCollaborator}
            className="btn-primary"
            style={{ width: '100%' }}
          >
            Ongeza
          </button>
        </div>

        {/* Collaborators List */}
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
            Washirikiani ({collaborators.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {collaborators.map((collab) => (
              <div
                key={collab.userId}
                style={{
                  padding: 12,
                  borderRadius: 12,
                  background: 'rgba(30, 41, 59, 0.3)',
                  border: '1px solid rgba(51, 65, 85, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1, #9333ea)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 'bold',
                }}>
                  {collab.avatar}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 600 }}>{collab.username}</h4>
                    {getRoleIcon(collab.role)}
                  </div>
                  <p style={{ fontSize: 12, color: getRoleColor(collab.role), fontWeight: 500 }}>
                    {collab.role === 'owner' ? 'Mmiliki' : collab.role === 'editor' ? 'Mhariri' : 'Mtazamaji'}
                  </p>
                </div>
                {collab.role !== 'owner' && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <select
                      value={collab.role}
                      onChange={(e) => handleChangeRole(collab.userId, e.target.value as 'editor' | 'viewer')}
                      style={{
                        padding: 6,
                        borderRadius: 6,
                        background: 'rgba(15, 23, 42, 0.5)',
                        border: '1px solid rgba(51, 65, 85, 0.5)',
                        color: 'var(--text-main)',
                        fontSize: 12,
                      }}
                    >
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                    </select>
                    <button
                      onClick={() => handleRemoveCollaborator(collab.userId)}
                      style={{
                        padding: 6,
                        borderRadius: 6,
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        cursor: 'pointer',
                      }}
                    >
                      <X size={14} color="#ef4444" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Permissions Info */}
        <div style={{
          marginTop: 20,
          padding: 16,
          borderRadius: 12,
          background: 'rgba(99, 102, 241, 0.05)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
        }}>
          <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Ruhusa:</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
              <span style={{ fontSize: 16 }}>👑</span>
              <span style={{ color: '#fbbf24', fontWeight: 500 }}>Mmiliki:</span>
              <span style={{ color: 'var(--text-muted)' }}>Ruhusa kamili (hariri, futa, ongeza washirikiani)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
              <Edit size={16} color="#60a5fa" />
              <span style={{ color: '#60a5fa', fontWeight: 500 }}>Mhariri:</span>
              <span style={{ color: 'var(--text-muted)' }}>Anaweza kuhariri content</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
              <Eye size={16} color="#94a3b8" />
              <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Mtazamaji:</span>
              <span style={{ color: 'var(--text-muted)' }}>Anaweza kutazama tu</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
