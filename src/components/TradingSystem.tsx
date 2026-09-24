import React, { useState, useEffect } from 'react';
import { ShoppingCart, Coins, Tag, X, Check } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface TradeItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  price: number;
  sellerId: string;
  category: 'badge' | 'title' | 'perk' | 'customization';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  createdAt: string;
}

interface TradeOffer {
  id: string;
  itemId: string;
  buyerId: string;
  offeredPrice: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export const TradingSystem: React.FC = () => {
  const { currentUser } = useApp();
  const [items, setItems] = useState<TradeItem[]>([]);
  const [offers, setOffers] = useState<TradeOffer[]>([]);
  const [coins, setCoins] = useState(0);
  const [showSellModal, setShowSellModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TradeItem | null>(null);
  const [offerAmount, setOfferAmount] = useState(0);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    icon: '🎁',
    price: 100,
    category: 'badge' as const,
    rarity: 'common' as const,
  });

  useEffect(() => {
    if (!currentUser) return;

    // Load items from localStorage
    const savedItems = localStorage.getItem('trade_items');
    if (savedItems) {
      setItems(JSON.parse(savedItems));
    } else {
      // Create sample items
      const sampleItems: TradeItem[] = [
        {
          id: 'item-1',
          name: 'Golden Badge',
          description: 'Badge ya dhahabu ya kipekee',
          icon: '🏆',
          price: 500,
          sellerId: 'user1',
          category: 'badge',
          rarity: 'rare',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'item-2',
          name: 'VIP Title',
          description: 'Title ya VIP kwa profile yako',
          icon: '👑',
          price: 1000,
          sellerId: 'user2',
          category: 'title',
          rarity: 'epic',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'item-3',
          name: 'Custom Avatar',
          description: 'Avatar yako maalum',
          icon: '🎨',
          price: 300,
          sellerId: 'user3',
          category: 'customization',
          rarity: 'common',
          createdAt: new Date().toISOString(),
        },
      ];
      setItems(sampleItems);
      localStorage.setItem('trade_items', JSON.stringify(sampleItems));
    }

    // Load offers
    const savedOffers = localStorage.getItem('trade_offers');
    if (savedOffers) {
      setOffers(JSON.parse(savedOffers));
    }

    // Load coins
    const savedCoins = localStorage.getItem(`coins_${currentUser.id}`);
    setCoins(savedCoins ? parseInt(savedCoins) : 1000);
  }, [currentUser]);

  const handleSellItem = () => {
    if (!currentUser || !newItem.name) return;

    const item: TradeItem = {
      id: `item-${Date.now()}`,
      ...newItem,
      sellerId: currentUser.id,
      createdAt: new Date().toISOString(),
    };

    const updated = [...items, item];
    setItems(updated);
    localStorage.setItem('trade_items', JSON.stringify(updated));
    setShowSellModal(false);
    setNewItem({ name: '', description: '', icon: '🎁', price: 100, category: 'badge', rarity: 'common' });
  };

  const handleMakeOffer = (itemId: string) => {
    if (!currentUser || offerAmount <= 0) return;

    const item = items.find(i => i.id === itemId);
    if (!item || offerAmount < item.price) {
      alert('Bei ya chini sana!');
      return;
    }

    if (offerAmount > coins) {
      alert('Huna coins za kutosha!');
      return;
    }

    const offer: TradeOffer = {
      id: `offer-${Date.now()}`,
      itemId,
      buyerId: currentUser.id,
      offeredPrice: offerAmount,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const updatedOffers = [...offers, offer];
    setOffers(updatedOffers);
    localStorage.setItem('trade_offers', JSON.stringify(updatedOffers));

    // Deduct coins
    const newCoins = coins - offerAmount;
    setCoins(newCoins);
    localStorage.setItem(`coins_${currentUser.id}`, newCoins.toString());

    setSelectedItem(null);
    setOfferAmount(0);
    alert('Offer imetumwa! Subiri jibu kutoka kwa muuzaji.');
  };

  const handleAcceptOffer = (offerId: string) => {
    const offer = offers.find(o => o.id === offerId);
    if (!offer || !currentUser) return;

    // Update offer status
    const updatedOffers = offers.map(o =>
      o.id === offerId ? { ...o, status: 'accepted' as const } : o
    );
    setOffers(updatedOffers);
    localStorage.setItem('trade_offers', JSON.stringify(updatedOffers));

    // Add coins to seller
    const newCoins = coins + offer.offeredPrice;
    setCoins(newCoins);
    localStorage.setItem(`coins_${currentUser.id}`, newCoins.toString());

    // Remove item from market
    const updatedItems = items.filter(i => i.id !== offer.itemId);
    setItems(updatedItems);
    localStorage.setItem('trade_items', JSON.stringify(updatedItems));

    alert('Offer imekubaliwa! Coins zimeongezwa.');
  };

  const handleRejectOffer = (offerId: string) => {
    const offer = offers.find(o => o.id === offerId);
    if (!offer) return;

    // Update offer status
    const updatedOffers = offers.map(o =>
      o.id === offerId ? { ...o, status: 'rejected' as const } : o
    );
    setOffers(updatedOffers);
    localStorage.setItem('trade_offers', JSON.stringify(updatedOffers));

    // Refund coins to buyer (in production, this would be done via backend)
    alert('Offer imekataliwa. Coins zitarudishwa kwa mnunuzi.');
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

  const myOffers = offers.filter(o => o.buyerId === currentUser?.id);
  const pendingOffers = offers.filter(o => {
    const item = items.find(i => i.id === o.itemId);
    return item && item.sellerId === currentUser?.id && o.status === 'pending';
  });

  const icons = ['🎁', '🏆', '👑', '💎', '🎨', '🎭', '⭐', '🌟', '🔥', '💫'];

  if (!currentUser) return null;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <ShoppingCart size={32} color="#6366f1" />
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Soko la Biashara</h2>
            <p style={{ fontSize: 14, color: '#94a3b8', margin: 0 }}>
              Nunua na uuze virtual items
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{
            padding: '12px 20px',
            borderRadius: 12,
            background: 'rgba(251, 191, 36, 0.1)',
            border: '1px solid rgba(251, 191, 36, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <Coins size={20} color="#fbbf24" />
            <span style={{ fontSize: 18, fontWeight: 700, color: '#fbbf24' }}>
              {coins.toLocaleString()}
            </span>
          </div>
          <button
            onClick={() => setShowSellModal(true)}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Tag size={16} />
            Uza Item
          </button>
        </div>
      </div>

      {/* Pending Offers (for sellers) */}
      {pendingOffers.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Offers Zinazosubiri</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pendingOffers.map((offer) => {
              const item = items.find(i => i.id === offer.itemId);
              if (!item) return null;

              return (
                <div key={offer.id} className="glass-card" style={{ padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                      width: 56,
                      height: 56,
                      borderRadius: 12,
                      background: `${getRarityColor(item.rarity)}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 28,
                    }}>
                      {item.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{item.name}</h4>
                      <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
                        Offer: {offer.offeredPrice} coins
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => handleAcceptOffer(offer.id)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: 8,
                          background: 'rgba(16, 185, 129, 0.2)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          color: '#10b981',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: 13,
                          fontWeight: 500,
                        }}
                      >
                        <Check size={14} />
                        Kubali
                      </button>
                      <button
                        onClick={() => handleRejectOffer(offer.id)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: 8,
                          background: 'rgba(239, 68, 68, 0.2)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#ef4444',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: 13,
                          fontWeight: 500,
                        }}
                      >
                        <X size={14} />
                        Kataa
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* My Offers */}
      {myOffers.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Offers Zangu</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {myOffers.slice(0, 5).map((offer) => {
              const item = items.find(i => i.id === offer.itemId);
              if (!item) return null;

              return (
                <div key={offer.id} className="glass-card" style={{ padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: `${getRarityColor(item.rarity)}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 20,
                    }}>
                      {item.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>{item.name}</p>
                      <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>
                        Offer: {offer.offeredPrice} coins
                      </p>
                    </div>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: 8,
                      background: offer.status === 'accepted' ? 'rgba(16, 185, 129, 0.2)' : offer.status === 'rejected' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(251, 191, 36, 0.2)',
                      color: offer.status === 'accepted' ? '#10b981' : offer.status === 'rejected' ? '#ef4444' : '#fbbf24',
                      fontSize: 12,
                      fontWeight: 600,
                    }}>
                      {offer.status === 'accepted' ? 'Imekubaliwa' : offer.status === 'rejected' ? 'Imekataliwa' : 'Inasubiri'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Marketplace */}
      <div>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Items Zinazouzwa</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {items.map((item) => (
            <div key={item.id} className="glass-card" style={{ padding: 20 }}>
              <div style={{
                width: '100%',
                height: 120,
                borderRadius: 12,
                background: `${getRarityColor(item.rarity)}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 56,
                marginBottom: 16,
              }}>
                {item.icon}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <h4 style={{ fontSize: 16, fontWeight: 600, margin: 0, flex: 1 }}>{item.name}</h4>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: 8,
                  background: `${getRarityColor(item.rarity)}20`,
                  color: getRarityColor(item.rarity),
                  fontSize: 11,
                  fontWeight: 600,
                }}>
                  {getRarityLabel(item.rarity)}
                </span>
              </div>

              <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16, lineHeight: 1.5 }}>
                {item.description}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Coins size={16} color="#fbbf24" />
                  <span style={{ fontSize: 20, fontWeight: 700, color: '#fbbf24' }}>
                    {item.price}
                  </span>
                </div>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: 8,
                  background: 'rgba(30, 41, 59, 0.5)',
                  fontSize: 12,
                  color: '#94a3b8',
                  textTransform: 'capitalize',
                }}>
                  {item.category}
                </span>
              </div>

              <button
                onClick={() => {
                  setSelectedItem(item);
                  setOfferAmount(item.price);
                }}
                className="btn-primary"
                style={{ width: '100%' }}
              >
                Nunua Sasa
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Make Offer Modal */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div
            className="glass-card"
            style={{ width: '100%', maxWidth: 400, margin: '0 16px', padding: 32 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Nunua {selectedItem.name}</h3>

            <div style={{
              width: '100%',
              height: 120,
              borderRadius: 12,
              background: `${getRarityColor(selectedItem.rarity)}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 56,
              marginBottom: 24,
            }}>
              {selectedItem.icon}
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 14, fontWeight: 500, color: '#cbd5e1', marginBottom: 8, display: 'block' }}>
                Bei ya Offer (coins)
              </label>
              <input
                type="number"
                value={offerAmount}
                onChange={(e) => setOfferAmount(parseInt(e.target.value) || 0)}
                min={selectedItem.price}
                style={{
                  width: '100%',
                  padding: 12,
                  borderRadius: 12,
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(51, 65, 85, 0.5)',
                  color: '#e2e8f0',
                  fontSize: 16,
                }}
              />
              <p style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>
                Bei ya chini: {selectedItem.price} coins
              </p>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setSelectedItem(null)} className="btn-ghost" style={{ flex: 1 }}>
                Ghairi
              </button>
              <button
                onClick={() => handleMakeOffer(selectedItem.id)}
                className="btn-primary"
                style={{ flex: 1 }}
                disabled={offerAmount < selectedItem.price || offerAmount > coins}
              >
                Nunua
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sell Item Modal */}
      {showSellModal && (
        <div className="modal-overlay" onClick={() => setShowSellModal(false)}>
          <div
            className="glass-card"
            style={{ width: '100%', maxWidth: 500, margin: '0 16px', padding: 32 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Uza Item Mpya</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 14, fontWeight: 500, color: '#cbd5e1', marginBottom: 8, display: 'block' }}>
                  Jina la Item
                </label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="Mfano: Golden Badge"
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
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="Eleza kuhusu item yako..."
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
                      onClick={() => setNewItem({ ...newItem, icon })}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        background: newItem.icon === icon ? 'rgba(99, 102, 241, 0.2)' : 'rgba(30, 41, 59, 0.3)',
                        border: `2px solid ${newItem.icon === icon ? '#6366f1' : 'transparent'}`,
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
                  Bei (coins)
                </label>
                <input
                  type="number"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: parseInt(e.target.value) || 0 })}
                  min="1"
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
                  Category
                </label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value as any })}
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
                  <option value="badge">Badge</option>
                  <option value="title">Title</option>
                  <option value="perk">Perk</option>
                  <option value="customization">Customization</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 14, fontWeight: 500, color: '#cbd5e1', marginBottom: 8, display: 'block' }}>
                  Rarity
                </label>
                <select
                  value={newItem.rarity}
                  onChange={(e) => setNewItem({ ...newItem, rarity: e.target.value as any })}
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

              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setShowSellModal(false)} className="btn-ghost" style={{ flex: 1 }}>
                  Ghairi
                </button>
                <button onClick={handleSellItem} className="btn-primary" style={{ flex: 1 }} disabled={!newItem.name}>
                  Uza Sasa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
