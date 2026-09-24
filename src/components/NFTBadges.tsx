import React, { useState, useEffect } from 'react';
import { Gem, Shield, Sparkles, Lock, Unlock, ExternalLink } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface NFTBadge {
  id: string;
  name: string;
  description: string;
  image: string;
  tokenId: string;
  owner: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  mintedAt: string;
  blockchain: 'ethereum' | 'polygon' | 'solana';
}

export const NFTBadges: React.FC = () => {
  const { currentUser } = useApp();
  const [badges, setBadges] = useState<NFTBadge[]>([]);
  const [showMintModal, setShowMintModal] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<NFTBadge | null>(null);
  const [newBadge, setNewBadge] = useState({
    name: '',
    description: '',
    image: '🏆',
    rarity: 'common' as const,
    blockchain: 'polygon' as const,
  });

  useEffect(() => {
    if (!currentUser) return;

    // Load NFT badges from localStorage
    const saved = localStorage.getItem('nft_badges');
    if (saved) {
      setBadges(JSON.parse(saved));
    } else {
      // Create sample NFT badges
      const sampleBadges: NFTBadge[] = [
        {
          id: 'nft-1',
          name: 'Founding Member',
          description: 'Badge ya kwanza ya wanachama waanzilishi',
          image: '🏆',
          tokenId: '0x1234...5678',
          owner: currentUser.id,
          rarity: 'legendary',
          mintedAt: new Date().toISOString(),
          blockchain: 'polygon',
        },
        {
          id: 'nft-2',
          name: 'Top Contributor',
          description: 'Badge ya wachangiaji bora',
          image: '⭐',
          tokenId: '0x2345...6789',
          owner: currentUser.id,
          rarity: 'epic',
          mintedAt: new Date().toISOString(),
          blockchain: 'polygon',
        },
        {
          id: 'nft-3',
          name: 'Community Leader',
          description: 'Badge ya viongozi wa jamii',
          image: '👑',
          tokenId: '0x3456...7890',
          owner: 'user2',
          rarity: 'rare',
          mintedAt: new Date().toISOString(),
          blockchain: 'ethereum',
        },
      ];
      setBadges(sampleBadges);
      localStorage.setItem('nft_badges', JSON.stringify(sampleBadges));
    }
  }, [currentUser]);

  const handleMintBadge = () => {
    if (!currentUser || !newBadge.name) return;

    // Simulate minting process
    const tokenId = `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`;

    const badge: NFTBadge = {
      id: `nft-${Date.now()}`,
      ...newBadge,
      tokenId,
      owner: currentUser.id,
      mintedAt: new Date().toISOString(),
    };

    const updated = [...badges, badge];
    setBadges(updated);
    localStorage.setItem('nft_badges', JSON.stringify(updated));
    setShowMintModal(false);
    setNewBadge({ name: '', description: '', image: '🏆', rarity: 'common', blockchain: 'polygon' });

    alert(`Badge "${badge.name}" imetengenezwa! Token ID: ${tokenId}`);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#94a3b8';
      case 'rare': return '#60a5fa';
      case 'epic': return '#c084fc';
      case 'legendary': return '#fbbf24';
      default: return '#94a3b8';
    }
  };

  const getRarityLabel = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'Common';
      case 'rare': return 'Rare';
      case 'epic': return 'Epic';
      case 'legendary': return 'Legendary';
      default: return rarity;
    }
  };

  const getBlockchainColor = (blockchain: string) => {
    switch (blockchain) {
      case 'ethereum': return '#627eea';
      case 'polygon': return '#8247e5';
      case 'solana': return '#14f195';
      default: return '#94a3b8';
    }
  };

  const getBlockchainLabel = (blockchain: string) => {
    switch (blockchain) {
      case 'ethereum': return 'Ethereum';
      case 'polygon': return 'Polygon';
      case 'solana': return 'Solana';
      default: return blockchain;
    }
  };

  const myBadges = badges.filter(b => b.owner === currentUser?.id);
  const otherBadges = badges.filter(b => b.owner !== currentUser?.id);

  const images = ['🏆', '⭐', '👑', '💎', '🎨', '🎭', '🌟', '🔥', '💫', '🎯'];

  if (!currentUser) return null;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Gem size={32} color="#c084fc" />
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>NFT Badges</h2>
            <p style={{ fontSize: 14, color: '#94a3b8', margin: 0 }}>
              Badges za blockchain - unique na za kudumu
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowMintModal(true)}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <Sparkles size={16} />
          Tengeneza Badge
        </button>
      </div>

      {/* Info Banner */}
      <div className="glass-card" style={{
        padding: 20,
        marginBottom: 32,
        background: 'linear-gradient(135deg, rgba(192, 132, 252, 0.1), rgba(147, 51, 234, 0.1))',
        border: '1px solid rgba(192, 132, 252, 0.3)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <Shield size={24} color="#c084fc" />
          <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Nini ni NFT Badges?</h3>
        </div>
        <p style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
          NFT Badges ni badges za kipekee zinazotumia blockchain technology. Kila badge ni unique na haiwezi kuigwa.
          Unaweza kuonyesha badges zako kwenye profile yako na kuzishare na watumiaji wengine.
        </p>
      </div>

      {/* My NFT Badges */}
      {myBadges.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Lock size={18} color="#10b981" />
            NFT Badges Zangu ({myBadges.length})
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {myBadges.map((badge) => (
              <div
                key={badge.id}
                className="glass-card"
                style={{
                  padding: 20,
                  cursor: 'pointer',
                  border: `2px solid ${getRarityColor(badge.rarity)}40`,
                }}
                onClick={() => setSelectedBadge(badge)}
              >
                <div style={{
                  width: '100%',
                  height: 160,
                  borderRadius: 12,
                  background: `linear-gradient(135deg, ${getRarityColor(badge.rarity)}20, ${getRarityColor(badge.rarity)}10)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 72,
                  marginBottom: 16,
                  position: 'relative',
                }}>
                  {badge.image}
                  <div style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    padding: '4px 12px',
                    borderRadius: 8,
                    background: `${getRarityColor(badge.rarity)}20`,
                    border: `1px solid ${getRarityColor(badge.rarity)}40`,
                    fontSize: 11,
                    fontWeight: 600,
                    color: getRarityColor(badge.rarity),
                  }}>
                    {getRarityLabel(badge.rarity)}
                  </div>
                </div>

                <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{badge.name}</h4>
                <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12, lineHeight: 1.5 }}>
                  {badge.description}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: '#64748b' }}>
                  <span style={{ fontFamily: 'monospace' }}>
                    Token: {badge.tokenId}
                  </span>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: 6,
                    background: `${getBlockchainColor(badge.blockchain)}20`,
                    color: getBlockchainColor(badge.blockchain),
                    fontWeight: 600,
                  }}>
                    {getBlockchainLabel(badge.blockchain)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other NFT Badges */}
      {otherBadges.length > 0 && (
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Unlock size={18} color="#94a3b8" />
            NFT Badges Zingine ({otherBadges.length})
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {otherBadges.map((badge) => (
              <div
                key={badge.id}
                className="glass-card"
                style={{
                  padding: 20,
                  cursor: 'pointer',
                  border: `2px solid ${getRarityColor(badge.rarity)}40`,
                  opacity: 0.7,
                }}
                onClick={() => setSelectedBadge(badge)}
              >
                <div style={{
                  width: '100%',
                  height: 160,
                  borderRadius: 12,
                  background: `linear-gradient(135deg, ${getRarityColor(badge.rarity)}20, ${getRarityColor(badge.rarity)}10)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 72,
                  marginBottom: 16,
                  position: 'relative',
                }}>
                  {badge.image}
                  <div style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    padding: '4px 12px',
                    borderRadius: 8,
                    background: `${getRarityColor(badge.rarity)}20`,
                    border: `1px solid ${getRarityColor(badge.rarity)}40`,
                    fontSize: 11,
                    fontWeight: 600,
                    color: getRarityColor(badge.rarity),
                  }}>
                    {getRarityLabel(badge.rarity)}
                  </div>
                </div>

                <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{badge.name}</h4>
                <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12, lineHeight: 1.5 }}>
                  {badge.description}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: '#64748b' }}>
                  <span style={{ fontFamily: 'monospace' }}>
                    Token: {badge.tokenId}
                  </span>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: 6,
                    background: `${getBlockchainColor(badge.blockchain)}20`,
                    color: getBlockchainColor(badge.blockchain),
                    fontWeight: 600,
                  }}>
                    {getBlockchainLabel(badge.blockchain)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Badge Details Modal */}
      {selectedBadge && (
        <div className="modal-overlay" onClick={() => setSelectedBadge(null)}>
          <div
            className="glass-card"
            style={{ width: '100%', maxWidth: 500, margin: '0 16px', padding: 32 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              width: '100%',
              height: 200,
              borderRadius: 16,
              background: `linear-gradient(135deg, ${getRarityColor(selectedBadge.rarity)}20, ${getRarityColor(selectedBadge.rarity)}10)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 96,
              marginBottom: 24,
              position: 'relative',
            }}>
              {selectedBadge.image}
              <div style={{
                position: 'absolute',
                top: 16,
                right: 16,
                padding: '6px 16px',
                borderRadius: 12,
                background: `${getRarityColor(selectedBadge.rarity)}20`,
                border: `1px solid ${getRarityColor(selectedBadge.rarity)}40`,
                fontSize: 13,
                fontWeight: 600,
                color: getRarityColor(selectedBadge.rarity),
              }}>
                {getRarityLabel(selectedBadge.rarity)}
              </div>
            </div>

            <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{selectedBadge.name}</h3>
            <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 24, lineHeight: 1.6 }}>
              {selectedBadge.description}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              <div style={{
                padding: 12,
                borderRadius: 10,
                background: 'rgba(30, 41, 59, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: 13, color: '#94a3b8' }}>Token ID</span>
                <span style={{ fontSize: 13, fontFamily: 'monospace', color: '#e2e8f0' }}>
                  {selectedBadge.tokenId}
                </span>
              </div>
              <div style={{
                padding: 12,
                borderRadius: 10,
                background: 'rgba(30, 41, 59, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: 13, color: '#94a3b8' }}>Blockchain</span>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: 8,
                  background: `${getBlockchainColor(selectedBadge.blockchain)}20`,
                  color: getBlockchainColor(selectedBadge.blockchain),
                  fontSize: 13,
                  fontWeight: 600,
                }}>
                  {getBlockchainLabel(selectedBadge.blockchain)}
                </span>
              </div>
              <div style={{
                padding: 12,
                borderRadius: 10,
                background: 'rgba(30, 41, 59, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: 13, color: '#94a3b8' }}>Minted</span>
                <span style={{ fontSize: 13, color: '#e2e8f0' }}>
                  {new Date(selectedBadge.mintedAt).toLocaleDateString('sw-TZ')}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setSelectedBadge(null)}
                className="btn-ghost"
                style={{ flex: 1 }}
              >
                Funga
              </button>
              <button
                className="btn-primary"
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                <ExternalLink size={16} />
                View on Blockchain
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mint Badge Modal */}
      {showMintModal && (
        <div className="modal-overlay" onClick={() => setShowMintModal(false)}>
          <div
            className="glass-card"
            style={{ width: '100%', maxWidth: 500, margin: '0 16px', padding: 32 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Tengeneza NFT Badge</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 14, fontWeight: 500, color: '#cbd5e1', marginBottom: 8, display: 'block' }}>
                  Jina la Badge
                </label>
                <input
                  type="text"
                  value={newBadge.name}
                  onChange={(e) => setNewBadge({ ...newBadge, name: e.target.value })}
                  placeholder="Mfano: Founding Member"
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
                  value={newBadge.description}
                  onChange={(e) => setNewBadge({ ...newBadge, description: e.target.value })}
                  placeholder="Eleza kuhusu badge yako..."
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
                  Image
                </label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {images.map((image) => (
                    <button
                      key={image}
                      onClick={() => setNewBadge({ ...newBadge, image })}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        background: newBadge.image === image ? 'rgba(192, 132, 252, 0.2)' : 'rgba(30, 41, 59, 0.3)',
                        border: `2px solid ${newBadge.image === image ? '#c084fc' : 'transparent'}`,
                        cursor: 'pointer',
                        fontSize: 24,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {image}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 14, fontWeight: 500, color: '#cbd5e1', marginBottom: 8, display: 'block' }}>
                  Rarity
                </label>
                <select
                  value={newBadge.rarity}
                  onChange={(e) => setNewBadge({ ...newBadge, rarity: e.target.value as any })}
                  style={{
                    width: '100%',
                    padding: 12,
                    borderRadius: 12,
                    background: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid rgba(51, 65, 85, 0.5)',
                    color: '#e2e8f0',
                    fontSize: 14,
                  }}
                >
                  <option value="common">Common</option>
                  <option value="rare">Rare</option>
                  <option value="epic">Epic</option>
                  <option value="legendary">Legendary</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 14, fontWeight: 500, color: '#cbd5e1', marginBottom: 8, display: 'block' }}>
                  Blockchain
                </label>
                <select
                  value={newBadge.blockchain}
                  onChange={(e) => setNewBadge({ ...newBadge, blockchain: e.target.value as any })}
                  style={{
                    width: '100%',
                    padding: 12,
                    borderRadius: 12,
                    background: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid rgba(51, 65, 85, 0.5)',
                    color: '#e2e8f0',
                    fontSize: 14,
                  }}
                >
                  <option value="polygon">Polygon (Low fees)</option>
                  <option value="ethereum">Ethereum</option>
                  <option value="solana">Solana (Fast)</option>
                </select>
              </div>

              <div style={{
                padding: 16,
                borderRadius: 12,
                background: 'rgba(192, 132, 252, 0.1)',
                border: '1px solid rgba(192, 132, 252, 0.3)',
              }}>
                <p style={{ fontSize: 13, color: '#c084fc', margin: 0, lineHeight: 1.6 }}>
                  <strong>Cost:</strong> 100 coins<br />
                  <strong>Time:</strong> ~2-5 minutes<br />
                  <strong>Blockchain:</strong> {getBlockchainLabel(newBadge.blockchain)}
                </p>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setShowMintModal(false)} className="btn-ghost" style={{ flex: 1 }}>
                  Ghairi
                </button>
                <button
                  onClick={handleMintBadge}
                  className="btn-primary"
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  disabled={!newBadge.name}
                >
                  <Sparkles size={16} />
                  Tengeneza (100 coins)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
