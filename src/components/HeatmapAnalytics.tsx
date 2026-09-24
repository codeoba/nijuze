import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Eye, MousePointer, Calendar } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export const HeatmapAnalytics: React.FC = () => {
  const { currentUser, posts } = useApp();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [clickData, setClickData] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    // Simulate heatmap data
    const generateHeatmapData = () => {
      const data: { [key: string]: number } = {};
      
      // Generate random click data for different areas
      const areas = ['header', 'search', 'posts', 'sidebar', 'footer', 'nav'];
      areas.forEach(area => {
        data[area] = Math.floor(Math.random() * 1000) + 100;
      });
      
      return data;
    };

    setClickData(generateHeatmapData());
  }, [timeRange]);

  // Calculate stats
  const totalClicks = Object.values(clickData).reduce((sum, val) => sum + val, 0);
  const avgClicks = totalClicks / Object.keys(clickData).length;
  const maxClicks = Math.max(...Object.values(clickData));

  // User journey data
  const userJourney = [
    { step: 'Landing', visits: 1000, conversion: 100 },
    { step: 'Browse Posts', visits: 850, conversion: 85 },
    { step: 'Read Post', visits: 620, conversion: 62 },
    { step: 'Comment', visits: 280, conversion: 28 },
    { step: 'Upvote', visits: 450, conversion: 45 },
    { step: 'Share', visits: 120, conversion: 12 },
  ];

  // Activity by hour
  const hourlyActivity = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    activity: Math.floor(Math.random() * 100) + (i >= 9 && i <= 17 ? 50 : 0),
  }));

  const maxHourlyActivity = Math.max(...hourlyActivity.map(h => h.activity));

  if (!currentUser) return null;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <MousePointer size={32} color="#6366f1" />
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Heatmap & Analytics</h2>
            <p style={{ fontSize: 14, color: '#94a3b8', margin: 0 }}>
              Chunguza tabia za watumiaji na user journey
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { id: '7d', label: 'Siku 7' },
            { id: '30d', label: 'Siku 30' },
            { id: '90d', label: 'Siku 90' },
          ].map((range) => (
            <button
              key={range.id}
              onClick={() => setTimeRange(range.id as any)}
              style={{
                padding: '8px 16px',
                borderRadius: 10,
                background: timeRange === range.id ? 'rgba(99, 102, 241, 0.2)' : 'rgba(30, 41, 59, 0.3)',
                border: `1px solid ${timeRange === range.id ? 'rgba(99, 102, 241, 0.5)' : 'rgba(51, 65, 85, 0.3)'}`,
                color: timeRange === range.id ? '#a5b4fc' : '#94a3b8',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 32,
      }}>
        {[
          { label: 'Total Clicks', value: totalClicks, icon: MousePointer, color: '#a5b4fc', change: '+18%' },
          { label: 'Avg per Area', value: Math.round(avgClicks), icon: BarChart3, color: '#6ee7b7', change: '+12%' },
          { label: 'Peak Activity', value: maxClicks, icon: TrendingUp, color: '#fbbf24', change: '+24%' },
          { label: 'Active Users', value: 245, icon: Users, color: '#f472b6', change: '+8%' },
        ].map((stat, i) => (
          <div key={i} className="glass-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <stat.icon size={24} color={stat.color} />
              <span style={{
                fontSize: 12,
                color: '#10b981',
                fontWeight: 600,
                padding: '4px 8px',
                borderRadius: 12,
                background: 'rgba(16, 185, 129, 0.1)',
              }}>
                {stat.change}
              </span>
            </div>
            <p style={{ fontSize: 28, fontWeight: 700, color: stat.color, marginBottom: 4 }}>
              {stat.value.toLocaleString()}
            </p>
            <p style={{ fontSize: 13, color: '#64748b' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Heatmap Grid */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <MousePointer size={20} color="#a5b4fc" />
          Click Heatmap
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {Object.entries(clickData).map(([area, clicks]) => {
            const intensity = (clicks / maxClicks) * 100;
            const color = intensity > 75 ? '#ef4444' : intensity > 50 ? '#f59e0b' : intensity > 25 ? '#eab308' : '#22c55e';
            
            return (
              <div
                key={area}
                style={{
                  padding: 20,
                  borderRadius: 12,
                  background: `${color}${Math.round(intensity * 0.3 + 10).toString(16).padStart(2, '0')}`,
                  border: `1px solid ${color}40`,
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                }}
              >
                <p style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', marginBottom: 8, textTransform: 'capitalize' }}>
                  {area}
                </p>
                <p style={{ fontSize: 24, fontWeight: 700, color, marginBottom: 4 }}>
                  {clicks.toLocaleString()}
                </p>
                <p style={{ fontSize: 12, color: '#94a3b8' }}>
                  {((clicks / totalClicks) * 100).toFixed(1)}%
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hourly Activity */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Calendar size={20} color="#60a5fa" />
          Shughuli kwa Saa
        </h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 200 }}>
          {hourlyActivity.map((hour) => {
            const height = (hour.activity / maxHourlyActivity) * 100;
            const isPeak = hour.activity > maxHourlyActivity * 0.7;
            
            return (
              <div
                key={hour.hour}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: `${height}%`,
                    background: isPeak
                      ? 'linear-gradient(180deg, #fbbf24, #f59e0b)'
                      : 'linear-gradient(180deg, #6366f1, #9333ea)',
                    borderRadius: 4,
                    minHeight: 4,
                    transition: 'height 0.3s ease',
                  }}
                  title={`${hour.hour}:00 - ${hour.activity} activities`}
                />
                {hour.hour % 3 === 0 && (
                  <span style={{ fontSize: 10, color: '#64748b' }}>
                    {hour.hour}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* User Journey */}
      <div className="glass-card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingUp size={20} color="#10b981" />
          User Journey
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {userJourney.map((step, i) => (
            <div key={i}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'rgba(99, 102, 241, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#a5b4fc',
                  }}>
                    {i + 1}
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#e2e8f0' }}>
                    {step.step}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontSize: 13, color: '#94a3b8' }}>
                    {step.visits.toLocaleString()} visits
                  </span>
                  <span style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: step.conversion > 50 ? '#10b981' : step.conversion > 25 ? '#fbbf24' : '#ef4444',
                  }}>
                    {step.conversion}%
                  </span>
                </div>
              </div>
              <div style={{
                height: 8,
                borderRadius: 4,
                background: 'rgba(30, 41, 59, 0.5)',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${step.conversion}%`,
                  background: step.conversion > 50
                    ? 'linear-gradient(90deg, #10b981, #059669)'
                    : step.conversion > 25
                    ? 'linear-gradient(90deg, #fbbf24, #f59e0b)'
                    : 'linear-gradient(90deg, #ef4444, #dc2626)',
                  borderRadius: 4,
                  transition: 'width 0.5s ease',
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
