import React, { useState, useEffect } from 'react';
import { Coins, ShoppingBag, Gift, Trophy, Star, Check } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  category: 'badge' | 'title' | 'perk' | 'customization';
  owned: boolean;
}

export const VirtualCurrency: React.FC = () => {
  const { currentUser } = useApp();
  const [coins, setCoins] = useState(0);
  const [selectedTab, setSelectedTab] = useState<'shop' | 'inventory' | 'history'>('shop');
  const [purchasedItems, setPurchasedItems] = useState<string[]>([]);

  useEffect(() => {
    if (!currentUser) return;

    // Load coins from localStorage
    const savedCoins = localStorage.getItem(`coins_${currentUser.id}`);
    setCoins(savedCoins ? parseInt(savedCoins) : 500); // Start with 500 coins

    // Load purchased items
    const savedItems = localStorage.getItem(`purchased_items_${currentUser.id}`);
    if (savedItems) {
      setPurchasedItems(JSON.parse(savedItems));
    }
  }, [currentUser]);

  const shopItems: ShopItem[] = [
    {
      id: 'badge-gold',
      name: 'Badge ya Dhahabu',
      description: 'Badge maalum ya dhahabu kwenye profile yako',
      price: 500,
      icon: '🏆',
      category: 'badge',
      owned: purchasedItems.includes('badge-gold'),
    },
    {
      id: 'badge-diamond',
      name: 'Badge ya Almasi',
      description: 'Badge ya almasi ya kipekee',
      price: 1000,
      icon: '💎',
      category: 'badge',
      owned: purchasedItems.includes('badge-diamond'),
    },
    {
      id: 'title-expert',
      name: 'Title ya Mtaalamu',
      description: 'Pata title ya "Mtaalamu" kwenye profile',
      price: 750,
      icon: '⭐',
      category: 'title',
      owned: purchasedItems.includes('title-expert'),
    },
    {
      id: 'title-vip',
      name: 'Title ya VIP',
      description: 'Pata title ya "VIP" kwenye profile',
      price: 1500,
      icon: '👑',
      category: 'title',
      owned: purchasedItems.includes('title-vip'),
    },
    {
      id: 'perk-featured',
      name: 'Featured Post',
      description: 'Post yako itaonyeshwa kwenye homepage kwa siku 1',
      price: 300,
      icon: '🌟',
      category: 'perk',
      owned: purchasedItems.includes('perk-featured'),
    },
    {
      id: 'perk-priority',
      name: 'Priority Support',
      description: 'Pata msaada wa kwanza kutoka kwa timu',
      price: 2000,
      icon: '🚀',
      category: 'perk',
      owned: purchasedItems.includes('perk-priority'),
    },
    {
      id: 'custom-avatar',
      name: 'Custom Avatar',
      description: 'Weka avatar yako maalum',
      price: 400,
      icon: '🎨',
      category: 'customization',
      owned: purchasedItems.includes('custom-avatar'),
    },
    {
      id: 'custom-theme',
      name: 'Custom Theme',
      description: 'Tengeneza theme yako mwenyewe',
      price: 600,
      icon: '🎭',
      category: 'customization',
      owned: purchasedItems.includes('custom-theme'),
    },
  ];

  const handlePurchase = (item: ShopItem) => {
    if (!currentUser || coins < item.price) {
      alert('Huna coins za kutosha!');
      return;
    }

    if (confirm(`Unataka kununua ${item.name} kwa ${item.price} coins?`)) {
      const newCoins = coins - item.price;
      setCoins(newCoins);
      localStorage.setItem(`coins_${currentUser.id}`, newCoins.toString());

      const newItems = [...purchasedItems, item.id];
      setPurchasedItems(newItems);
      localStorage.setItem(`purchased_items_${currentUser.id}`, JSON.stringify(newItems));

      alert(`Hongera! Umenunua ${item.name}! 🎉`);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'badge': return <Trophy size={16} />;
      case 'title': return <Star size={16} />;
      case 'perk': return <Gift size={16} />;
      case 'customization': return <ShoppingBag size={16} />;
      default: return <Coins size={16} />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'badge': return '#fbbf24';
      case 'title': return '#a5b4fc';
      case 'perk': return '#f472b6';
      case 'customization': return '#6ee7b7';
      default: return '#94a3b8';
    }
  };

  if (!currentUser) return null;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Coins size={32} color="white" />
          </div>
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Duka la Nijuze</h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
              Nunua badges, titles, na perks za kipekee
            </p>
          </div>
        </div>
        <div style={{
          padding: '16px 24px',
          borderRadius: 16,
          background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.1))',
          border: '1px solid rgba(251, 191, 36, 0.3)',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: 12, color: '#fcd34d', margin: 0 }}>Coins Zako</p>
          <p style={{ fontSize: 32, fontWeight: 700, color: '#fbbf24', margin: 0 }}>
            {coins.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[
          { id: 'shop', label: 'Duka', icon: ShoppingBag },
          { id: 'inventory', label: 'Vitu Vyangu', icon: Gift },
          { id: 'history', label: 'Historia', icon: Coins },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 20px',
                borderRadius: 12,
                background: selectedTab === tab.id ? 'rgba(99, 102, 241, 0.2)' : 'rgba(30, 41, 59, 0.3)',
                border: `1px solid ${selectedTab === tab.id ? 'rgba(99, 102, 241, 0.5)' : 'rgba(51, 65, 85, 0.3)'}`,
                color: selectedTab === tab.id ? '#a5b4fc' : '#94a3b8',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Shop Tab */}
      {selectedTab === 'shop' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
          {shopItems.map((item) => (
            <div
              key={item.id}
              className="glass-card"
              style={{
                padding: 20,
                opacity: item.owned ? 0.6 : 1,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {item.owned && (
                <div style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  padding: '4px 12px',
                  borderRadius: 12,
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 11,
                  color: '#10b981',
                  fontWeight: 600,
                }}>
                  <Check size={12} />
                  Umenunua
                </div>
              )}

              <div style={{ fontSize: 48, marginBottom: 12, textAlign: 'center' }}>
                {item.icon}
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 8,
              }}>
                <span style={{ color: getCategoryColor(item.category) }}>
                  {getCategoryIcon(item.category)}
                </span>
                <h4 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>
                  {item.name}
                </h4>
              </div>

              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.5 }}>
                {item.description}
              </p>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Coins size={16} color="#fbbf24" />
                  <span style={{ fontSize: 18, fontWeight: 700, color: '#fbbf24' }}>
                    {item.price}
                  </span>
                </div>
                <span style={{
                  fontSize: 11,
                  color: '#64748b',
                  padding: '4px 8px',
                  borderRadius: 8,
                  background: 'rgba(30, 41, 59, 0.5)',
                  textTransform: 'capitalize',
                }}>
                  {item.category}
                </span>
              </div>

              <button
                onClick={() => handlePurchase(item)}
                disabled={item.owned || coins < item.price}
                className={item.owned ? 'btn-ghost' : 'btn-primary'}
                style={{
                  width: '100%',
                  opacity: item.owned || coins < item.price ? 0.5 : 1,
                  cursor: item.owned || coins < item.price ? 'not-allowed' : 'pointer',
                }}
              >
                {item.owned ? 'Umenunua' : coins < item.price ? 'Coins Hazitoshi' : 'Nunua Sasa'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Inventory Tab */}
      {selectedTab === 'inventory' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {shopItems.filter(item => item.owned).length === 0 ? (
            <div className="glass-card" style={{ padding: 48, textAlign: 'center', gridColumn: '1 / -1' }}>
              <Gift size={48} color="#475569" style={{ margin: '0 auto 16px' }} />
              <p style={{ fontSize: 16, color: 'var(--text-muted)' }}>Bado hujanutua chochote</p>
            </div>
          ) : (
            shopItems.filter(item => item.owned).map((item) => (
              <div
                key={item.id}
                className="glass-card"
                style={{ padding: 20, textAlign: 'center' }}
              >
                <div style={{ fontSize: 48, marginBottom: 12 }}>{item.icon}</div>
                <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{item.name}</h4>
                <p style={{ fontSize: 12, color: '#64748b' }}>{item.description}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* History Tab */}
      {selectedTab === 'history' && (
        <div className="glass-card" style={{ padding: 24 }}>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
            Historia ya manunuzi itaonekana hapa
          </p>
        </div>
      )}
    </div>
  );
};
