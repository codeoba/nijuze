import React, { useState, useEffect } from 'react';
import { Trophy, Calendar, Users, Clock, Medal, Crown, X } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface Tournament {
  id: string;
  name: string;
  description: string;
  icon: string;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  participantIds: string[];
  prize: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  winners?: { userId: string; position: number; prize: string }[];
}

export const TournamentsSystem: React.FC = () => {
  const { currentUser, users } = useApp();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [newTournament, setNewTournament] = useState({
    name: '',
    description: '',
    icon: '🏆',
    startDate: '',
    endDate: '',
    maxParticipants: 100,
    prize: '',
  });

  useEffect(() => {
    // Load tournaments from localStorage
    const saved = localStorage.getItem('tournaments');
    if (saved) {
      setTournaments(JSON.parse(saved));
    } else {
      // Create sample tournaments
      const sampleTournaments: Tournament[] = [
        {
          id: 'tournament-1',
          name: 'Weekly Coding Challenge',
          description: 'Shindano la wiki la programming',
          icon: '💻',
          startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
          maxParticipants: 100,
          participantIds: ['user1', 'user2'],
          prize: '500 coins + Badge ya Dhahabu',
          status: 'upcoming',
        },
        {
          id: 'tournament-2',
          name: 'Best Post Competition',
          description: 'Shindano la post bora ya mwezi',
          icon: '📝',
          startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          maxParticipants: 50,
          participantIds: ['user1', 'user3', 'user4'],
          prize: '1000 coins + Title ya Mshindi',
          status: 'ongoing',
        },
        {
          id: 'tournament-3',
          name: 'Monthly Champion',
          description: 'Shindano la mwezi - mshindi bora',
          icon: '👑',
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          maxParticipants: 100,
          participantIds: ['user1', 'user2', 'user3', 'user4'],
          prize: '2000 coins + Crown Badge',
          status: 'completed',
          winners: [
            { userId: 'user1', position: 1, prize: '2000 coins' },
            { userId: 'user2', position: 2, prize: '1000 coins' },
            { userId: 'user3', position: 3, prize: '500 coins' },
          ],
        },
      ];
      setTournaments(sampleTournaments);
      localStorage.setItem('tournaments', JSON.stringify(sampleTournaments));
    }
  }, []);

  const handleCreateTournament = () => {
    if (!currentUser || !newTournament.name || !newTournament.startDate || !newTournament.endDate) return;

    const tournament: Tournament = {
      id: `tournament-${Date.now()}`,
      ...newTournament,
      participantIds: [currentUser.id],
      status: 'upcoming',
    };

    const updated = [...tournaments, tournament];
    setTournaments(updated);
    localStorage.setItem('tournaments', JSON.stringify(updated));
    setShowCreateModal(false);
    setNewTournament({
      name: '',
      description: '',
      icon: '🏆',
      startDate: '',
      endDate: '',
      maxParticipants: 100,
      prize: '',
    });
  };

  const handleJoinTournament = (tournamentId: string) => {
    if (!currentUser) return;

    const updated = tournaments.map(t => {
      if (t.id === tournamentId && !t.participantIds.includes(currentUser.id) && t.participantIds.length < t.maxParticipants) {
        return { ...t, participantIds: [...t.participantIds, currentUser.id] };
      }
      return t;
    });

    setTournaments(updated);
    localStorage.setItem('tournaments', JSON.stringify(updated));
  };

  const handleLeaveTournament = (tournamentId: string) => {
    if (!currentUser) return;

    const updated = tournaments.map(t => {
      if (t.id === tournamentId) {
        return { ...t, participantIds: t.participantIds.filter(id => id !== currentUser.id) };
      }
      return t;
    });

    setTournaments(updated);
    localStorage.setItem('tournaments', JSON.stringify(updated));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return '#60a5fa';
      case 'ongoing': return '#10b981';
      case 'completed': return '#94a3b8';
      default: return '#94a3b8';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'upcoming': return 'Inakuja';
      case 'ongoing': return 'Inaendelea';
      case 'completed': return 'Imekamilika';
      default: return status;
    }
  };

  const icons = ['🏆', '💻', '📝', '👑', '🎮', '🎨', '⚽', '📚', '🎵', '🌍'];

  if (!currentUser) return null;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Trophy size={32} color="#fbbf24" />
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Mashindano</h2>
            <p style={{ fontSize: 14, color: '#94a3b8', margin: 0 }}>
              Shiriki katika mashindano na ushinde zawadi
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <Trophy size={16} />
          Unda Shindano
        </button>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 32,
      }}>
        {[
          { label: 'Mashindano Yote', value: tournaments.length, icon: Trophy, color: '#fbbf24' },
          { label: 'Inaendelea', value: tournaments.filter(t => t.status === 'ongoing').length, icon: Clock, color: '#10b981' },
          { label: 'Ninashiriki', value: tournaments.filter(t => t.participantIds.includes(currentUser.id)).length, icon: Users, color: '#a5b4fc' },
          { label: 'Nimeshinda', value: tournaments.filter(t => t.winners?.some(w => w.userId === currentUser.id)).length, icon: Medal, color: '#f472b6' },
        ].map((stat, i) => (
          <div key={i} className="glass-card" style={{ padding: 20 }}>
            <stat.icon size={24} color={stat.color} style={{ marginBottom: 12 }} />
            <p style={{ fontSize: 28, fontWeight: 700, color: stat.color, marginBottom: 4 }}>
              {stat.value}
            </p>
            <p style={{ fontSize: 13, color: '#64748b' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tournaments Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {tournaments.map((tournament) => {
          const isJoined = tournament.participantIds.includes(currentUser.id);
          const isFull = tournament.participantIds.length >= tournament.maxParticipants;

          return (
            <div
              key={tournament.id}
              className="glass-card"
              style={{ padding: 24, cursor: 'pointer' }}
              onClick={() => setSelectedTournament(tournament)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: 'rgba(251, 191, 36, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                }}>
                  {tournament.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>{tournament.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: 8,
                      background: `${getStatusColor(tournament.status)}20`,
                      color: getStatusColor(tournament.status),
                      fontSize: 11,
                      fontWeight: 600,
                    }}>
                      {getStatusLabel(tournament.status)}
                    </span>
                  </div>
                </div>
              </div>

              <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16, lineHeight: 1.5 }}>
                {tournament.description}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#cbd5e1' }}>
                  <Calendar size={14} color="#64748b" />
                  <span>
                    {new Date(tournament.startDate).toLocaleDateString('sw-TZ')} - {new Date(tournament.endDate).toLocaleDateString('sw-TZ')}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#cbd5e1' }}>
                  <Users size={14} color="#64748b" />
                  <span>{tournament.participantIds.length}/{tournament.maxParticipants} washiriki</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#fbbf24' }}>
                  <Trophy size={14} />
                  <span style={{ fontWeight: 600 }}>{tournament.prize}</span>
                </div>
              </div>

              {isJoined ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLeaveTournament(tournament.id);
                  }}
                  className="btn-ghost"
                  style={{ width: '100%' }}
                >
                  Ondoka
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleJoinTournament(tournament.id);
                  }}
                  className="btn-primary"
                  style={{ width: '100%' }}
                  disabled={isFull}
                >
                  {isFull ? 'Imejaa' : 'Shiriki'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Create Tournament Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div
            className="glass-card"
            style={{ width: '100%', maxWidth: 600, margin: '0 16px', padding: 32, maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Unda Shindano Jipya</h3>
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
                  Jina la Shindano
                </label>
                <input
                  type="text"
                  value={newTournament.name}
                  onChange={(e) => setNewTournament({ ...newTournament, name: e.target.value })}
                  placeholder="Mfano: Weekly Coding Challenge"
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
                  value={newTournament.description}
                  onChange={(e) => setNewTournament({ ...newTournament, description: e.target.value })}
                  placeholder="Eleza shindano lako..."
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
                      onClick={() => setNewTournament({ ...newTournament, icon })}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        background: newTournament.icon === icon ? 'rgba(251, 191, 36, 0.2)' : 'rgba(30, 41, 59, 0.3)',
                        border: `2px solid ${newTournament.icon === icon ? '#fbbf24' : 'transparent'}`,
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 14, fontWeight: 500, color: '#cbd5e1', marginBottom: 8, display: 'block' }}>
                    Tarehe ya Kuanza
                  </label>
                  <input
                    type="date"
                    value={newTournament.startDate.split('T')[0]}
                    onChange={(e) => setNewTournament({ ...newTournament, startDate: e.target.value })}
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
                    Tarehe ya Kuisha
                  </label>
                  <input
                    type="date"
                    value={newTournament.endDate.split('T')[0]}
                    onChange={(e) => setNewTournament({ ...newTournament, endDate: e.target.value })}
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
              </div>

              <div>
                <label style={{ fontSize: 14, fontWeight: 500, color: '#cbd5e1', marginBottom: 8, display: 'block' }}>
                  Max Participants: {newTournament.maxParticipants}
                </label>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="10"
                  value={newTournament.maxParticipants}
                  onChange={(e) => setNewTournament({ ...newTournament, maxParticipants: parseInt(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 14, fontWeight: 500, color: '#cbd5e1', marginBottom: 8, display: 'block' }}>
                  Zawadi
                </label>
                <input
                  type="text"
                  value={newTournament.prize}
                  onChange={(e) => setNewTournament({ ...newTournament, prize: e.target.value })}
                  placeholder="Mfano: 1000 coins + Badge"
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

              <button
                onClick={handleCreateTournament}
                className="btn-primary"
                disabled={!newTournament.name || !newTournament.startDate || !newTournament.endDate}
              >
                Unda Shindano
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tournament Details Modal */}
      {selectedTournament && (
        <div className="modal-overlay" onClick={() => setSelectedTournament(null)}>
          <div
            className="glass-card"
            style={{ width: '100%', maxWidth: 700, margin: '0 16px', padding: 32, maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 72,
                  height: 72,
                  borderRadius: 20,
                  background: 'rgba(251, 191, 36, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 36,
                }}>
                  {selectedTournament.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{selectedTournament.name}</h3>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: 12,
                    background: `${getStatusColor(selectedTournament.status)}20`,
                    color: getStatusColor(selectedTournament.status),
                    fontSize: 13,
                    fontWeight: 600,
                  }}>
                    {getStatusLabel(selectedTournament.status)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedTournament(null)}
                style={{ padding: 8, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <X size={20} color="#cbd5e1" />
              </button>
            </div>

            <p style={{ fontSize: 15, color: '#cbd5e1', marginBottom: 24, lineHeight: 1.6 }}>
              {selectedTournament.description}
            </p>

            <div style={{
              padding: 20,
              borderRadius: 12,
              background: 'rgba(251, 191, 36, 0.1)',
              border: '1px solid rgba(251, 191, 36, 0.3)',
              marginBottom: 24,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Trophy size={20} color="#fbbf24" />
                <span style={{ fontSize: 16, fontWeight: 600, color: '#fbbf24' }}>Zawadi</span>
              </div>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#fbbf24', margin: 0 }}>
                {selectedTournament.prize}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div style={{
                padding: 16,
                borderRadius: 12,
                background: 'rgba(30, 41, 59, 0.3)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Calendar size={16} color="#a5b4fc" />
                  <span style={{ fontSize: 13, color: '#94a3b8' }}>Tarehe</span>
                </div>
                <p style={{ fontSize: 14, color: '#e2e8f0', margin: 0 }}>
                  {new Date(selectedTournament.startDate).toLocaleDateString('sw-TZ')}
                </p>
                <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0 0' }}>
                  hadi {new Date(selectedTournament.endDate).toLocaleDateString('sw-TZ')}
                </p>
              </div>
              <div style={{
                padding: 16,
                borderRadius: 12,
                background: 'rgba(30, 41, 59, 0.3)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Users size={16} color="#a5b4fc" />
                  <span style={{ fontSize: 13, color: '#94a3b8' }}>Washiriki</span>
                </div>
                <p style={{ fontSize: 20, fontWeight: 700, color: '#e2e8f0', margin: 0 }}>
                  {selectedTournament.participantIds.length} / {selectedTournament.maxParticipants}
                </p>
              </div>
            </div>

            {/* Winners (if completed) */}
            {selectedTournament.status === 'completed' && selectedTournament.winners && (
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Medal size={18} color="#fbbf24" />
                  Washindi
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {selectedTournament.winners.map((winner, i) => {
                    const user = users.find(u => u.id === winner.userId);
                    if (!user) return null;
                    return (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: 12,
                          borderRadius: 10,
                          background: i === 0 ? 'rgba(251, 191, 36, 0.1)' : 'rgba(30, 41, 59, 0.3)',
                          border: `1px solid ${i === 0 ? 'rgba(251, 191, 36, 0.3)' : 'rgba(51, 65, 85, 0.3)'}`,
                        }}
                      >
                        <div style={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          background: i === 0 ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : 'linear-gradient(135deg, #6366f1, #9333ea)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 16,
                          fontWeight: 'bold',
                        }}>
                          {user.avatar}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>{user.username}</p>
                          <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Nafasi #{winner.position}</p>
                        </div>
                        {i === 0 && <Crown size={20} color="#fbbf24" />}
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#fbbf24' }}>
                          {winner.prize}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Participants */}
            <div>
              <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Users size={18} color="#a5b4fc" />
                Washiriki ({selectedTournament.participantIds.length})
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {selectedTournament.participantIds.map((participantId) => {
                  const participant = users.find(u => u.id === participantId);
                  if (!participant) return null;
                  return (
                    <div
                      key={participantId}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 12px',
                        borderRadius: 20,
                        background: 'rgba(30, 41, 59, 0.3)',
                        border: '1px solid rgba(51, 65, 85, 0.3)',
                      }}
                    >
                      <div style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1, #9333ea)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: 'bold',
                      }}>
                        {participant.avatar}
                      </div>
                      <span style={{ fontSize: 13, color: '#e2e8f0' }}>{participant.username}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
