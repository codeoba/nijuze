import { Post } from '../types';
import { db } from './database';

export interface TrendingScore {
  postId: string;
  score: number;
  post: Post;
}

// Calculate trending score based on multiple factors
export const calculateTrendingScore = (post: Post): number => {
  const now = Date.now();
  const postTime = new Date(post.createdAt).getTime();
  const ageInHours = (now - postTime) / (1000 * 60 * 60);
  
  // Base score from engagement
  const upvoteScore = post.upvotes * 3;
  const commentScore = post.commentsCount * 5;
  const viewScore = Math.log(post.views + 1) * 2;
  
  // Time decay - newer posts get boost
  const timeDecay = Math.max(0.1, 1 / Math.pow(ageInHours / 6 + 2, 1.5));
  
  // Bonus for recent activity
  const recentBonus = ageInHours < 24 ? 1.5 : ageInHours < 48 ? 1.2 : 1;
  
  // Calculate final score
  const baseScore = upvoteScore + commentScore + viewScore;
  const finalScore = baseScore * timeDecay * recentBonus;
  
  return finalScore;
};

// Get trending posts
export const getTrendingPosts = (limit: number = 10): Post[] => {
  const posts = db.getPosts();
  
  const scoredPosts: TrendingScore[] = posts.map(post => ({
    postId: post.id,
    score: calculateTrendingScore(post),
    post,
  }));
  
  // Sort by score
  scoredPosts.sort((a, b) => b.score - a.score);
  
  return scoredPosts.slice(0, limit).map(sp => sp.post);
};

// Get hot posts (last 24 hours)
export const getHotPosts = (limit: number = 10): Post[] => {
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  
  const recentPosts = db.getPosts().filter(post => {
    const postTime = new Date(post.createdAt).getTime();
    return postTime >= oneDayAgo;
  });
  
  const scoredPosts: TrendingScore[] = recentPosts.map(post => ({
    postId: post.id,
    score: calculateTrendingScore(post),
    post,
  }));
  
  scoredPosts.sort((a, b) => b.score - a.score);
  
  return scoredPosts.slice(0, limit).map(sp => sp.post);
};

// Get top posts (all time)
export const getTopPosts = (limit: number = 10): Post[] => {
  const posts = db.getPosts();
  
  const scoredPosts = posts.map(post => ({
    postId: post.id,
    score: post.upvotes * 3 + post.commentsCount * 5 + Math.log(post.views + 1) * 2,
    post,
  }));
  
  scoredPosts.sort((a, b) => b.score - a.score);
  
  return scoredPosts.slice(0, limit).map(sp => sp.post);
};

// Get rising posts (gaining traction quickly)
export const getRisingPosts = (limit: number = 10): Post[] => {
  const now = Date.now();
  const sixHoursAgo = now - 6 * 60 * 60 * 1000;
  
  const recentPosts = db.getPosts().filter(post => {
    const postTime = new Date(post.createdAt).getTime();
    return postTime >= sixHoursAgo && post.upvotes >= 5;
  });
  
  const scoredPosts: TrendingScore[] = recentPosts.map(post => {
    const postTime = new Date(post.createdAt).getTime();
    const ageInHours = Math.max(1, (now - postTime) / (1000 * 60 * 60));
    
    // Score based on engagement per hour
    const engagementRate = (post.upvotes + post.commentsCount) / ageInHours;
    
    return {
      postId: post.id,
      score: engagementRate * 10,
      post,
    };
  });
  
  scoredPosts.sort((a, b) => b.score - a.score);
  
  return scoredPosts.slice(0, limit).map(sp => sp.post);
};

// Get personalized feed based on user interests
export const getPersonalizedFeed = (userId: string, limit: number = 20): Post[] => {
  const user = db.getUserById(userId);
  if (!user) return getTrendingPosts(limit);
  
  // Get user's own posts to extract tags
  const userPosts = db.getPostsByUser(userId);
  
  // Get tags from user's activity
  const tagCounts: { [tag: string]: number } = {};
  
  userPosts.forEach(post => {
    post.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  
  // Get top tags
  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag]) => tag);
  
  // Score all posts
  const allPosts = db.getPosts();
  const scoredPosts = allPosts.map(post => {
    let score = 0;
    
    // Boost posts with matching tags
    post.tags.forEach(tag => {
      if (topTags.includes(tag)) {
        score += (tagCounts[tag] || 0) * 2;
      }
    });
    
    // Add trending score
    score += calculateTrendingScore(post) * 0.1;
    
    return {
      postId: post.id,
      score,
      post,
    };
  });
  
  scoredPosts.sort((a, b) => b.score - a.score);
  
  return scoredPosts.slice(0, limit).map(sp => sp.post);
};
