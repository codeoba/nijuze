import React, { useState, useEffect } from 'react';
import { Users, Crown, Shield, MessageCircle, Plus, Settings, X } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface Guild {
  id: string;
  name: string;
  description: string;
  icon: string;
  leaderId: string;
  memberIds: string[];
  maxMembers: number;
  isPrivate: boolean;
  createdAt: string;
}

export const GuildSystem: React.FC = () => {
  const { currentUser, users } = useApp();
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGuild, setSelectedGuild] = useState<Guild | null>(null);
  const [newGuild, setNewGuild] = useState({
    name: '',
    description: '',
    icon: '🏰',
    maxMembers: 50,
    isPrivate: false,
  });

  useEffect(() => {
    // Load guilds from localStorage
    const saved = localStorage.getItem('guilds');
    if (saved) {
      setGuilds(JSON.parse(saved));
    } else {
      // Create sample guilds
      const sampleGuilds: Guild[] = [
        {
          id: 'guild-1',
          name: 'Tech Wizards',
          description: 'Kikundi cha wataalam wa teknolojia',
          icon: '💻',
          leaderId: 'user1',
          memberIds: ['user1', 'user2', 'user3'],
          maxMembers: 50,
          isPrivate: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'guild-2',
          name: 'Business Leaders',
          description: 'Wafanyabiashara na entrepreneurs',
          icon: '💼',
          leaderId: 'user2',
          memberIds: ['user2', 'user4'],
          maxMembers: 30,
          isPrivate: false,
          createdAt: new Date().toISOString(),
        },
      ];
      setGuilds(sampleGuilds);
      localStorage.setItem('guilds', JSON.stringify(sampleGuilds));
    }
  }, []);

  const handleCreateGuild = () => {
    if (!currentUser || !newGuild.name) return;

    const guild: Guild = {
      id: `guild-${Date.now()}`,
      ...newGuild,
      leaderId: currentUser.id,
      memberIds: [currentUser.id],
      createdAt: new Date().toISOString(),
    };

    const updated = [...guilds, guild];
    setGuilds(updated);
    localStorage.setItem('guilds', JSON.stringify(updated));
    setShowCreateModal(false);
    setNewGuild({ name: '', description: '', icon: '🏰', maxMembers: 50, isPrivate: false });
  };

  const handleJoinGuild = (guildId: string) => {
    if (!currentUser) return;

    const updated = guilds.map(g => {
      if (g.id === guildId && !g.memberIds.includes(currentUser.id) && g.memberIds.length < g.maxMembers) {
        return { ...g, memberIds: [...g.memberIds, currentUser.id] };
      }
      return g;
    });

    setGuilds(updated);
    localStorage.setItem('guilds', JSON.stringify(updated));
  };

  const handleLeaveGuild = (guildId: string) => {
    if (!currentUser) return;

    const updated = guilds.map(g => {
      if (g.id === guildId) {
        return { ...g, memberIds: g.memberIds.filter(id => id !== currentUser.id) };
      }
      return g;
    });

    setGuilds(updated);
    localStorage.setItem('guilds', JSON.stringify(updated));
  };

  const getUserGuilds = () => {
    if (!currentUser) return [];
    return guilds.filter(g => g.memberIds.includes(currentUser.id));
  };

  const userGuilds = getUserGuilds();

  const icons = ['🏰', '💻', '💼', '🎨', '⚽', '📚', '🏥', '🎮', '🎵', '🌍'];

  if (!currentUser) return null;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Users size={32} color="#6366f1" />
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Guilds & Groups</h2>
            <p style={{ fontSize: 14, color: '#94a3b8', margin: 0 }}>
              Jiunge na vikundi na ushirikiane na watumiaji wengine
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <Plus size={16} />
          Unda Guild Mpya
        </button>
      </div>

      {/* My Guilds */}
      {userGuilds.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Guilds Zangu</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {userGuilds.map((guild) => (
              <div
                key={guild.id}
                className="glass-card"
                style={{ padding: 20, cursor: 'pointer' }}
                onClick={() => setSelectedGuild(guild)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: 'rgba(99, 102, 241, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24,
                  }}>
                    {guild.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{guild.name}</h4>
                    <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>
                      {guild.memberIds.length}/{guild.maxMembers} members
                    </p>
                  </div>
                  {guild.leaderId === currentUser.id && (
                    <Crown size={20} color="#fbbf24" />
                  )}
                </div>
                <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12 }}>
                  {guild.description}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLeaveGuild(guild.id);
                  }}
                  className="btn-ghost"
                  style={{ width: '100%', fontSize: 13 }}
                >
                  Ondoka
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Guilds */}
      <div>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Guilds Zinazopatikana</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {guilds.filter(g => !g.memberIds.includes(currentUser.id)).map((guild) => (
            <div
              key={guild.id}
              className="glass-card"
              style={{ padding: 20 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: 'rgba(99, 102, 241, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                }}>
                  {guild.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{guild.name}</h4>
                  <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>
                    {guild.memberIds.length}/{guild.maxMembers} members
                  </p>
                </div>
                {guild.isPrivate && (
                  <Shield size={20} color="#94a3b8" />
                )}
              </div>
              <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12 }}>
                {guild.description}
              </p>
              <button
                onClick={() => handleJoinGuild(guild.id)}
                className="btn-primary"
                style={{ width: '100%', fontSize: 13 }}
                disabled={guild.memberIds.length >= guild.maxMembers}
              >
                {guild.memberIds.length >= guild.maxMembers ? 'Imejaa' : 'Jiunga'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Create Guild Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div
            className="glass-card"
            style={{ width: '100%', maxWidth: 500, margin: '0 16px', padding: 32 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Unda Guild Mpya</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ padding: 8, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <X size={20} color="#cbd5e1" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 14, fontWeight: 500, color: '#cbd5e1', marginBottom: 8, display: 'block' }}>
                  Jina la Guild
                </label>
                <input
                  type="text"
                  value={newGuild.name}
                  onChange={(e) => setNewGuild({ ...newGuild, name: e.target.value })}
                  placeholder="Mfano: Tech Wizards"
                  style={{
                    width: '100%',
                    padding: 12,
                    borderRadius: 12,
                    background: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid rgba(51, 65, 85, 0.5)',
                    color: '#e2e8f0',
                    fontSize: 14,
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 14, fontWeight: 500, color: '#cbd5e1', marginBottom: 8, display: 'block' }}>
                  Maelezo
                </label>
                <textarea
                  value={newGuild.description}
                  onChange={(e) => setNewGuild({ ...newGuild, description: e.target.value })}
                  placeholder="Eleza kuhusu guild yako..."
                  style={{
                    width: '100%',
                    padding: 12,
                    borderRadius: 12,
                    background: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid rgba(51, 65, 85, 0.5)',
                    color: '#e2e8f0',
                    fontSize: 14,
                    resize: 'vertical',
                    minHeight: 80,
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 14, fontWeight: 500, color: '#cbd5e1', marginBottom: 8, display: 'block' }}>
                  Icon
                </label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {icons.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setNewGuild({ ...newGuild, icon })}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        background: newGuild.icon === icon ? 'rgba(99, 102, 241, 0.2)' : 'rgba(30, 41, 59, 0.3)',
                        border: `2px solid ${newGuild.icon === icon ? '#6366f1' : 'transparent'}`,
                        cursor: 'pointer',
                        fontSize: 24,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 14, fontWeight: 500, color: '#cbd5e1', marginBottom: 8, display: 'block' }}>
                  Max Members: {newGuild.maxMembers}
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="10"
                  value={newGuild.maxMembers}
                  onChange={(e) => setNewGuild({ ...newGuild, maxMembers: parseInt(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={newGuild.isPrivate}
                  onChange={(e) => setNewGuild({ ...newGuild, isPrivate: e.target.checked })}
                  style={{ width: 18, height: 18 }}
                />
                <span style={{ fontSize: 14, color: '#cbd5e1' }}>Guild ya Faragha (Private)</span>
              </label>

              <button
                onClick={handleCreateGuild}
                className="btn-primary"
                disabled={!newGuild.name}
              >
                Unda Guild
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guild Details Modal */}
      {selectedGuild && (
        <div className="modal-overlay" onClick={() => setSelectedGuild(null)}>
          <div
            className="glass-card"
            style={{ width: '100%', maxWidth: 600, margin: '0 16px', padding: 32 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  background: 'rgba(99, 102, 241, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 32,
                }}>
                  {selectedGuild.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{selectedGuild.name}</h3>
                  <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
                    {selectedGuild.memberIds.length}/{selectedGuild.maxMembers} members
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedGuild(null)}
                style={{ padding: 8, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <X size={20} color="#cbd5e1" />
              </button>
            </div>

            <p style={{ fontSize: 14, color: '#cbd5e1', marginBottom: 24 }}>
              {selectedGuild.description}
            </p>

            <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Members</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
              {selectedGuild.memberIds.map((memberId) => {
                const member = users.find(u => u.id === memberId);
                if (!member) return null;
                return (
                  <div
                    key={memberId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: 12,
                      borderRadius: 10,
                      background: 'rgba(30, 41, 59, 0.3)',
                    }}
                  >
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6366f1, #9333ea)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      fontWeight: 'bold',
                    }}>
                      {member.avatar}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>{member.username}</p>
                      <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>{member.role}</p>
                    </div>
                    {selectedGuild.leaderId === memberId && (
                      <Crown size={16} color="#fbbf24" />
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => {
                handleLeaveGuild(selectedGuild.id);
                setSelectedGuild(null);
              }}
              className="btn-ghost"
              style={{ width: '100%' }}
            >
              Ondoka kwenye Guild
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
