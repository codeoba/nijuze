import React, { useState } from 'react';
import { MapPin, Users, Globe } from 'lucide-react';

interface UserLocation {
  id: string;
  username: string;
  avatar: string;
  lat: number;
  lng: number;
  city: string;
  country: string;
}

export const MapIntegration: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<UserLocation | null>(null);

  // Sample user locations (in production, get from backend)
  const userLocations: UserLocation[] = [
    { id: '1', username: 'Amina Hassan', avatar: 'AH', lat: -6.7924, lng: 39.2083, city: 'Dar es Salaam', country: 'Tanzania' },
    { id: '2', username: 'Juma Bakari', avatar: 'JB', lat: -3.3862, lng: 36.6830, city: 'Arusha', country: 'Tanzania' },
    { id: '3', username: 'Fatma Omar', avatar: 'FO', lat: -6.1630, lng: 35.7516, city: 'Dodoma', country: 'Tanzania' },
    { id: '4', username: 'David Mwangi', avatar: 'DM', lat: -1.2921, lng: 36.8219, city: 'Nairobi', country: 'Kenya' },
    { id: '5', username: 'Grace Wanjiku', avatar: 'GW', lat: -4.0435, lng: 39.6682, city: 'Mombasa', country: 'Kenya' },
  ];

  // Simple map visualization (in production, use Google Maps or Mapbox)
  const mapWidth = 800;
  const mapHeight = 400;

  // Convert lat/lng to x/y coordinates (simplified)
  const latToY = (lat: number) => {
    const minLat = -10;
    const maxLat = 5;
    return mapHeight - ((lat - minLat) / (maxLat - minLat)) * mapHeight;
  };

  const lngToX = (lng: number) => {
    const minLng = 30;
    const maxLng = 42;
    return ((lng - minLng) / (maxLng - minLng)) * mapWidth;
  };

  return (
    <div className="glass-card" style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <Globe size={24} color="#a5b4fc" />
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Ramani ya Watumiaji</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
            Ona watumiaji wako duniani kote
          </p>
        </div>
      </div>

      {/* Map Container */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: mapHeight,
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.5), rgba(15, 23, 42, 0.8))',
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid rgba(51, 65, 85, 0.3)',
      }}>
        {/* Simple map background (in production, use actual map tiles) */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 70%)',
        }} />

        {/* User Markers */}
        {userLocations.map((user) => {
          const x = lngToX(user.lng);
          const y = latToY(user.lat);
          const isSelected = selectedUser?.id === user.id;

          return (
            <div
              key={user.id}
              onClick={() => setSelectedUser(user)}
              style={{
                position: 'absolute',
                left: x - 20,
                top: y - 20,
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: isSelected
                  ? 'linear-gradient(135deg, #6366f1, #9333ea)'
                  : 'linear-gradient(135deg, #10b981, #059669)',
                border: isSelected ? '3px solid white' : '2px solid rgba(255, 255, 255, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 'bold',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isSelected ? '0 0 20px rgba(99, 102, 241, 0.5)' : '0 2px 8px rgba(0, 0, 0, 0.3)',
                zIndex: isSelected ? 10 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.transform = 'scale(1.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >
              {user.avatar}
            </div>
          );
        })}

        {/* Map Label */}
        <div style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          padding: '8px 16px',
          borderRadius: 8,
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(51, 65, 85, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <MapPin size={16} color="#a5b4fc" />
          <span style={{ fontSize: 13, color: 'var(--text-main)' }}>
            Afrika Mashariki
          </span>
        </div>
      </div>

      {/* Selected User Info */}
      {selectedUser && (
        <div style={{
          marginTop: 20,
          padding: 16,
          borderRadius: 12,
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #9333ea)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              fontWeight: 'bold',
              color: 'white',
            }}>
              {selectedUser.avatar}
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: 'var(--text-main)' }}>
                {selectedUser.username}
              </h4>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                {selectedUser.city}, {selectedUser.country}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Coordinates</p>
              <p style={{ fontSize: 13, color: 'var(--btn-ghost-text)', margin: 0, fontFamily: 'monospace' }}>
                {selectedUser.lat.toFixed(4)}, {selectedUser.lng.toFixed(4)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: 12,
        marginTop: 20,
      }}>
        <div style={{
          padding: 16,
          borderRadius: 12,
          background: 'rgba(30, 41, 59, 0.3)',
          border: '1px solid rgba(51, 65, 85, 0.3)',
          textAlign: 'center',
        }}>
          <Users size={24} color="#a5b4fc" style={{ margin: '0 auto 8px' }} />
          <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--btn-ghost-text)', margin: 0 }}>
            {userLocations.length}
          </p>
          <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Watumiaji</p>
        </div>
        <div style={{
          padding: 16,
          borderRadius: 12,
          background: 'rgba(30, 41, 59, 0.3)',
          border: '1px solid rgba(51, 65, 85, 0.3)',
          textAlign: 'center',
        }}>
          <MapPin size={24} color="#10b981" style={{ margin: '0 auto 8px' }} />
          <p style={{ fontSize: 20, fontWeight: 700, color: '#10b981', margin: 0 }}>
            {new Set(userLocations.map(u => u.country)).size}
          </p>
          <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Nchi</p>
        </div>
        <div style={{
          padding: 16,
          borderRadius: 12,
          background: 'rgba(30, 41, 59, 0.3)',
          border: '1px solid rgba(51, 65, 85, 0.3)',
          textAlign: 'center',
        }}>
          <Globe size={24} color="#fbbf24" style={{ margin: '0 auto 8px' }} />
          <p style={{ fontSize: 20, fontWeight: 700, color: '#fbbf24', margin: 0 }}>
            {new Set(userLocations.map(u => u.city)).size}
          </p>
          <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Miji</p>
        </div>
      </div>
    </div>
  );
};
