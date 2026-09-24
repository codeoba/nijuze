import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Users, Phone, PhoneOff } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface VoiceRoom {
  id: string;
  name: string;
  description: string;
  hostId: string;
  participantIds: string[];
  maxParticipants: number;
  isPrivate: boolean;
  createdAt: string;
}

export const VoiceChatRooms: React.FC = () => {
  const { currentUser, users } = useApp();
  const [rooms, setRooms] = useState<VoiceRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<VoiceRoom | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoom, setNewRoom] = useState({
    name: '',
    description: '',
    maxParticipants: 10,
    isPrivate: false,
  });

  useEffect(() => {
    // Load rooms from localStorage
    const saved = localStorage.getItem('voice_rooms');
    if (saved) {
      setRooms(JSON.parse(saved));
    } else {
      // Create sample rooms
      const sampleRooms: VoiceRoom[] = [
        {
          id: 'room-1',
          name: 'Tech Discussion',
          description: 'Jadili teknolojia na programming',
          hostId: 'user1',
          participantIds: ['user1', 'user2'],
          maxParticipants: 10,
          isPrivate: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'room-2',
          name: 'Business Networking',
          description: 'Mtandao wa biashara na fursa',
          hostId: 'user2',
          participantIds: ['user2', 'user3', 'user4'],
          maxParticipants: 15,
          isPrivate: false,
          createdAt: new Date().toISOString(),
        },
      ];
      setRooms(sampleRooms);
      localStorage.setItem('voice_rooms', JSON.stringify(sampleRooms));
    }
  }, []);

  const handleCreateRoom = () => {
    if (!currentUser || !newRoom.name) return;

    const room: VoiceRoom = {
      id: `room-${Date.now()}`,
      ...newRoom,
      hostId: currentUser.id,
      participantIds: [currentUser.id],
      createdAt: new Date().toISOString(),
    };

    const updated = [...rooms, room];
    setRooms(updated);
    localStorage.setItem('voice_rooms', JSON.stringify(updated));
    setShowCreateModal(false);
    setNewRoom({ name: '', description: '', maxParticipants: 10, isPrivate: false });
    setCurrentRoom(room);
  };

  const handleJoinRoom = (roomId: string) => {
    if (!currentUser) return;

    const updated = rooms.map(r => {
      if (r.id === roomId && !r.participantIds.includes(currentUser.id) && r.participantIds.length < r.maxParticipants) {
        return { ...r, participantIds: [...r.participantIds, currentUser.id] };
      }
      return r;
    });

    setRooms(updated);
    localStorage.setItem('voice_rooms', JSON.stringify(updated));

    const room = updated.find(r => r.id === roomId);
    if (room) setCurrentRoom(room);
  };

  const handleLeaveRoom = () => {
    if (!currentUser || !currentRoom) return;

    const updated = rooms.map(r => {
      if (r.id === currentRoom.id) {
        return { ...r, participantIds: r.participantIds.filter(id => id !== currentUser.id) };
      }
      return r;
    });

    setRooms(updated);
    localStorage.setItem('voice_rooms', JSON.stringify(updated));
    setCurrentRoom(null);
  };

  const handleDeleteRoom = (roomId: string) => {
    if (!currentUser) return;

    const room = rooms.find(r => r.id === roomId);
    if (!room || room.hostId !== currentUser.id) return;

    const updated = rooms.filter(r => r.id !== roomId);
    setRooms(updated);
    localStorage.setItem('voice_rooms', JSON.stringify(updated));

    if (currentRoom?.id === roomId) {
      setCurrentRoom(null);
    }
  };

  if (!currentUser) return null;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Mic size={32} color="#6366f1" />
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Voice Chat Rooms</h2>
            <p style={{ fontSize: 14, color: '#94a3b8', margin: 0 }}>
              Ongea na watumiaji wengine kwa sauti
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <Phone size={16} />
          Unda Room
        </button>
      </div>

      {/* Current Room */}
      {currentRoom && (
        <div className="glass-card" style={{ padding: 24, marginBottom: 24, background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(147, 51, 234, 0.1))' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>{currentRoom.name}</h3>
              <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>{currentRoom.description}</p>
            </div>
            <button
              onClick={handleLeaveRoom}
              style={{
                padding: '10px 20px',
                borderRadius: 10,
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              <PhoneOff size={16} />
              Ondoka
            </button>
          </div>

          {/* Participants */}
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={16} color="#a5b4fc" />
              Washiriki ({currentRoom.participantIds.length})
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {currentRoom.participantIds.map((participantId) => {
                const participant = users.find(u => u.id === participantId);
                if (!participant) return null;
                const isHost = currentRoom.hostId === participantId;
                const isCurrentUser = currentUser.id === participantId;

                return (
                  <div
                    key={participantId}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 8,
                      padding: 12,
                      borderRadius: 12,
                      background: isCurrentUser ? 'rgba(99, 102, 241, 0.2)' : 'rgba(30, 41, 59, 0.3)',
                      border: `1px solid ${isCurrentUser ? 'rgba(99, 102, 241, 0.5)' : 'rgba(51, 65, 85, 0.3)'}`,
                      minWidth: 100,
                    }}
                  >
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1, #9333ea)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 20,
                        fontWeight: 'bold',
                        color: 'white',
                      }}>
                        {participant.avatar}
                      </div>
                      {isHost && (
                        <div style={{
                          position: 'absolute',
                          top: -4,
                          right: -4,
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          background: '#fbbf24',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '2px solid #0f0f23',
                        }}>
                          <span style={{ fontSize: 12 }}>👑</span>
                        </div>
                      )}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#e2e8f0' }}>
                      {isCurrentUser ? 'Wewe' : participant.username}
                    </span>
                    {isCurrentUser && (isMuted || isDeafened) && (
                      <div style={{ display: 'flex', gap: 4 }}>
                        {isMuted && <MicOff size={14} color="#ef4444" />}
                        {isDeafened && <VolumeX size={14} color="#ef4444" />}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
            <button
              onClick={() => setIsMuted(!isMuted)}
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: isMuted ? 'rgba(239, 68, 68, 0.2)' : 'rgba(30, 41, 59, 0.5)',
                border: `2px solid ${isMuted ? '#ef4444' : 'rgba(51, 65, 85, 0.5)'}`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isMuted ? <MicOff size={24} color="#ef4444" /> : <Mic size={24} color="#e2e8f0" />}
            </button>
            <button
              onClick={() => setIsDeafened(!isDeafened)}
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: isDeafened ? 'rgba(239, 68, 68, 0.2)' : 'rgba(30, 41, 59, 0.5)',
                border: `2px solid ${isDeafened ? '#ef4444' : 'rgba(51, 65, 85, 0.5)'}`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isDeafened ? <VolumeX size={24} color="#ef4444" /> : <Volume2 size={24} color="#e2e8f0" />}
            </button>
          </div>
        </div>
      )}

      {/* Available Rooms */}
      <div>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Vyumba Vinavyopatikana</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {rooms.filter(r => !currentRoom || r.id !== currentRoom.id).map((room) => {
            const isFull = room.participantIds.length >= room.maxParticipants;
            const isHost = room.hostId === currentUser.id;

            return (
              <div key={room.id} className="glass-card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <h4 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{room.name}</h4>
                  {isHost && (
                    <button
                      onClick={() => handleDeleteRoom(room.id)}
                      style={{
                        padding: 6,
                        borderRadius: 6,
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <PhoneOff size={14} color="#fca5a5" />
                    </button>
                  )}
                </div>
                <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12 }}>
                  {room.description}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: 13, color: '#64748b' }}>
                  <Users size={14} />
                  <span>{room.participantIds.length}/{room.maxParticipants} washiriki</span>
                </div>
                <button
                  onClick={() => handleJoinRoom(room.id)}
                  className="btn-primary"
                  style={{ width: '100%' }}
                  disabled={isFull}
                >
                  {isFull ? 'Imejaa' : 'Jiunga'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div
            className="glass-card"
            style={{ width: '100%', maxWidth: 500, margin: '0 16px', padding: 32 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Unda Voice Room Mpya</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 14, fontWeight: 500, color: '#cbd5e1', marginBottom: 8, display: 'block' }}>
                  Jina la Room
                </label>
                <input
                  type="text"
                  value={newRoom.name}
                  onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                  placeholder="Mfano: Tech Discussion"
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
                  value={newRoom.description}
                  onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                  placeholder="Eleza kuhusu room yako..."
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
                  Max Participants: {newRoom.maxParticipants}
                </label>
                <input
                  type="range"
                  min="2"
                  max="50"
                  value={newRoom.maxParticipants}
                  onChange={(e) => setNewRoom({ ...newRoom, maxParticipants: parseInt(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={newRoom.isPrivate}
                  onChange={(e) => setNewRoom({ ...newRoom, isPrivate: e.target.checked })}
                  style={{ width: 18, height: 18 }}
                />
                <span style={{ fontSize: 14, color: '#cbd5e1' }}>Room ya Faragha (Private)</span>
              </label>

              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setShowCreateModal(false)} className="btn-ghost" style={{ flex: 1 }}>
                  Ghairi
                </button>
                <button onClick={handleCreateRoom} className="btn-primary" style={{ flex: 1 }} disabled={!newRoom.name}>
                  Unda Room
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
