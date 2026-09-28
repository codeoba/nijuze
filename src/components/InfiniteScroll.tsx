import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface InfiniteScrollProps {
  children: React.ReactNode;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  loading?: boolean;
}

export const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  children,
  loadMore,
  hasMore,
  loading = false,
}) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading || !hasMore) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading, hasMore, loadMore]);

  return (
    <div>
      {children}
      
      {/* Load More Trigger */}
      <div ref={loadMoreRef} style={{ padding: 20, textAlign: 'center' }}>
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Loader2 size={20} className="animate-spin" color="#a5b4fc" />
            <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Inapakia zaidi...</span>
          </div>
        )}
        
        {!hasMore && !loading && (
          <p style={{ color: '#64748b', fontSize: 14 }}>
            Umeifikia mwisho 🎉
          </p>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

// Skeleton Loading Component
interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: number;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  className = '',
}) => {
  return (
    <div
      className={className}
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, rgba(30, 41, 59, 0.5) 25%, rgba(51, 65, 85, 0.5) 50%, rgba(30, 41, 59, 0.5) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }}
    >
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};

// Post Card Skeleton
export const PostCardSkeleton: React.FC = () => {
  return (
    <div className="glass-card" style={{ padding: 20, marginBottom: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <Skeleton width={40} height={40} borderRadius={20} />
        <div style={{ flex: 1 }}>
          <Skeleton width="60%" height={16} />
          <div style={{ marginTop: 8 }}>
            <Skeleton width="40%" height={12} />
          </div>
        </div>
      </div>

      {/* Title */}
      <Skeleton width="80%" height={20} />
      <div style={{ marginTop: 8 }}>
        <Skeleton width="60%" height={20} />
      </div>

      {/* Content */}
      <div style={{ marginTop: 16 }}>
        <Skeleton width="100%" height={14} />
        <div style={{ marginTop: 8 }}>
          <Skeleton width="90%" height={14} />
        </div>
        <div style={{ marginTop: 8 }}>
          <Skeleton width="70%" height={14} />
        </div>
      </div>

      {/* Tags */}
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <Skeleton width={60} height={24} borderRadius={12} />
        <Skeleton width={80} height={24} borderRadius={12} />
        <Skeleton width={70} height={24} borderRadius={12} />
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
        <Skeleton width={60} height={32} borderRadius={8} />
        <Skeleton width={60} height={32} borderRadius={8} />
        <Skeleton width={60} height={32} borderRadius={8} />
      </div>
    </div>
  );
};

// Profile Skeleton
export const ProfileSkeleton: React.FC = () => {
  return (
    <div style={{ padding: 24 }}>
      {/* Cover */}
      <Skeleton width="100%" height={200} borderRadius={16} />

      {/* Avatar */}
      <div style={{ marginTop: -50, marginBottom: 24 }}>
        <Skeleton width={120} height={120} borderRadius={60} />
      </div>

      {/* Name */}
      <Skeleton width="50%" height={32} />
      <div style={{ marginTop: 8 }}>
        <Skeleton width="30%" height={16} />
      </div>

      {/* Bio */}
      <div style={{ marginTop: 16 }}>
        <Skeleton width="100%" height={14} />
        <div style={{ marginTop: 8 }}>
          <Skeleton width="80%" height={14} />
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginTop: 24 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <Skeleton width={40} height={40} borderRadius={20} className="mx-auto" />
            <div style={{ marginTop: 8 }}>
              <Skeleton width="60%" height={20} className="mx-auto" />
            </div>
            <div style={{ marginTop: 4 }}>
              <Skeleton width="80%" height={12} className="mx-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
