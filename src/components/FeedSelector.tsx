import React, { useState } from 'react';
import { Users, TrendingUp, Clock, Star } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Post } from '../types';
import { getTrendingPosts, getHotPosts, getTopPosts, getRisingPosts } from '../services/trending';

type FeedType = 'following' | 'trending' | 'hot' | 'top' | 'rising';

interface FeedSelectorProps {
  activeFeed: FeedType;
  onFeedChange: (feed: FeedType) => void;
}

export const FeedSelector: React.FC<FeedSelectorProps> = ({ activeFeed, onFeedChange }) => {
  const feeds = [
    { id: 'following' as FeedType, label: 'Unaowafuata', icon: Users, description: 'Posts za watu unaowafuata' },
    { id: 'trending' as FeedType, label: 'Trending', icon: TrendingUp, description: 'Posts zinazovuma sasa' },
    { id: 'hot' as FeedType, label: 'Moto', icon: TrendingUp, description: 'Posts za masaa 24 yaliyopita' },
    { id: 'top' as FeedType, label: 'Bora', icon: Star, description: 'Posts bora za wakati wote' },
    { id: 'rising' as FeedType, label: 'Inayopanda', icon: TrendingUp, description: 'Posts zinazopata traction' },
  ];

  return (
    <div style={{
      display: 'flex',
      gap: 8,
      marginBottom: 16,
      overflowX: 'auto',
      paddingBottom: 8,
    }}>
      {feeds.map((feed) => {
        const isActive = activeFeed === feed.id;
        const Icon = feed.icon;
        
        return (
          <button
            key={feed.id}
            onClick={() => onFeedChange(feed.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 16px',
              borderRadius: 12,
              background: isActive ? 'rgba(99, 102, 241, 0.2)' : 'rgba(30, 41, 59, 0.3)',
              border: `1px solid ${isActive ? 'rgba(99, 102, 241, 0.5)' : 'rgba(51, 65, 85, 0.3)'}`,
              color: isActive ? '#a5b4fc' : '#94a3b8',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500,
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = 'rgba(30, 41, 59, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = 'rgba(30, 41, 59, 0.3)';
              }
            }}
            title={feed.description}
          >
            <Icon size={16} />
            {feed.label}
          </button>
        );
      })}
    </div>
  );
};

// Hook to get posts based on feed type
export const useFeedPosts = (feedType: FeedType, userId?: string): Post[] => {
  const { posts } = useApp();
  
  switch (feedType) {
    case 'trending':
      return getTrendingPosts(20);
    case 'hot':
      return getHotPosts(20);
    case 'top':
      return getTopPosts(20);
    case 'rising':
      return getRisingPosts(20);
    case 'following':
      // For now, return all posts. In production, filter by followed users
      return posts;
    default:
      return posts;
  }
};
