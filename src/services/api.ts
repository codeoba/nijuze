// ============================================
// API Service - Connects Frontend to Backend
// Replaces localStorage with real API calls
// ============================================

import { User, Post, Comment, Notification } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function for API calls with timeout
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('nijuze_token');
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  const config: RequestInit = {
    signal: controller.signal,
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    clearTimeout(timeoutId);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Connection timeout - backend offline');
    }
    console.warn(`API call to ${endpoint} failed, falling back to local storage:`, error.message);
    throw error;
  }
};

// ============================================
// AUTH API
// ============================================
export const authAPI = {
  register: async (username: string, email: string, password: string) => {
    const response = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });

    if (response.data.token) {
      localStorage.setItem('nijuze_token', response.data.token);
      localStorage.setItem('nijuze_user', JSON.stringify(response.data.user));
    }

    return response;
  },

  login: async (email: string, password: string) => {
    const response = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.data.token) {
      localStorage.setItem('nijuze_token', response.data.token);
      localStorage.setItem('nijuze_user', JSON.stringify(response.data.user));
    }

    return response;
  },

  logout: () => {
    localStorage.removeItem('nijuze_token');
    localStorage.removeItem('nijuze_user');
  },

  getCurrentUser: async () => {
    const response = await apiCall('/auth/me');
    return response.data;
  },
};

// ============================================
// POSTS API
// ============================================
export const postsAPI = {
  getAll: async (params: { page?: number; limit?: number; category?: string; search?: string; sort?: string } = {}) => {
    const queryString = new URLSearchParams(params as any).toString();
    const response = await apiCall(`/posts?${queryString}`);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiCall(`/posts/${id}`);
    return response.data;
  },

  create: async (data: { title: string; content: string; tags: string[]; category: string; isAnonymous?: boolean }) => {
    const response = await apiCall('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  update: async (id: string, data: Partial<Post>) => {
    const response = await apiCall(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiCall(`/posts/${id}`, {
      method: 'DELETE',
    });
    return response.data;
  },

  upvote: async (id: string) => {
    const response = await apiCall(`/posts/${id}/upvote`, {
      method: 'POST',
    });
    return response.data;
  },

  downvote: async (id: string) => {
    const response = await apiCall(`/posts/${id}/downvote`, {
      method: 'POST',
    });
    return response.data;
  },

  bookmark: async (id: string) => {
    const response = await apiCall(`/posts/${id}/bookmark`, {
      method: 'POST',
    });
    return response.data;
  },

  addReaction: async (id: string, emoji: string) => {
    const response = await apiCall(`/posts/${id}/react`, {
      method: 'POST',
      body: JSON.stringify({ emoji }),
    });
    return response.data;
  },
};

// ============================================
// COMMENTS API
// ============================================
export const commentsAPI = {
  getByPost: async (postId: string, sort: string = 'best') => {
    const response = await apiCall(`/posts/${postId}/comments?sort=${sort}`);
    return response.data;
  },

  create: async (postId: string, content: string) => {
    const response = await apiCall(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
    return response.data;
  },

  update: async (id: string, content: string) => {
    const response = await apiCall(`/comments/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiCall(`/comments/${id}`, {
      method: 'DELETE',
    });
    return response.data;
  },

  upvote: async (id: string) => {
    const response = await apiCall(`/comments/${id}/upvote`, {
      method: 'POST',
    });
    return response.data;
  },

  markBest: async (id: string) => {
    const response = await apiCall(`/comments/${id}/best`, {
      method: 'POST',
    });
    return response.data;
  },
};

// ============================================
// USERS API
// ============================================
export const usersAPI = {
  getAll: async () => {
    const response = await apiCall('/users');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiCall(`/users/${id}`);
    return response.data;
  },

  follow: async (id: string) => {
    const response = await apiCall(`/users/${id}/follow`, {
      method: 'POST',
    });
    return response.data;
  },

  unfollow: async (id: string) => {
    const response = await apiCall(`/users/${id}/follow`, {
      method: 'DELETE',
    });
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await apiCall('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  },
};

// ============================================
// NOTIFICATIONS API
// ============================================
export const notificationsAPI = {
  getAll: async () => {
    const response = await apiCall('/notifications');
    return response.data;
  },

  markRead: async (id: string) => {
    const response = await apiCall(`/notifications/${id}/read`, {
      method: 'PUT',
    });
    return response.data;
  },

  markAllRead: async () => {
    const response = await apiCall('/notifications/read-all', {
      method: 'PUT',
    });
    return response.data;
  },
};

// ============================================
// ADMIN API
// ============================================
export const adminAPI = {
  getStats: async () => {
    const response = await apiCall('/admin/stats');
    return response.data;
  },

  getUsers: async (params: { page?: number; limit?: number; search?: string } = {}) => {
    const queryString = new URLSearchParams(params as any).toString();
    const response = await apiCall(`/admin/users?${queryString}`);
    return response.data;
  },

  banUser: async (id: string) => {
    const response = await apiCall(`/admin/users/${id}/ban`, {
      method: 'POST',
    });
    return response.data;
  },

  unbanUser: async (id: string) => {
    const response = await apiCall(`/admin/users/${id}/unban`, {
      method: 'POST',
    });
    return response.data;
  },

  getReports: async () => {
    const response = await apiCall('/admin/reports');
    return response.data;
  },
};

// ============================================
// UPLOAD API
// ============================================
export const uploadAPI = {
  upload: async (file: File): Promise<{ url: string; filename: string; originalName: string; size: number }> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('image', file);

      const token = localStorage.getItem('nijuze_token');
      
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success && data.data) {
        return data.data;
      }
      throw new Error(data.error || 'Upload failed');
    } catch {
      // Fallback to Base64 data URL for offline or local preview resilience
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            url: reader.result as string,
            filename: file.name,
            originalName: file.name,
            size: file.size,
          });
        };
        reader.onerror = () => reject(new Error('Hitilafu wakati wa kusoma faili'));
        reader.readAsDataURL(file);
      });
    }
  },

  image: async (file: File) => {
    return uploadAPI.upload(file);
  },

  file: async (file: File) => {
    return uploadAPI.upload(file);
  },
};

// ============================================
// STORIES API
// ============================================
export const storiesAPI = {
  getAll: async () => {
    const response = await apiCall('/stories');
    return response.data;
  },
  create: async (data: { content: string; backgroundColor?: string }) => {
    const response = await apiCall('/stories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },
  view: async (id: string) => {
    const response = await apiCall(`/stories/${id}/view`, { method: 'POST' });
    return response;
  },
};

// ============================================
// MESSAGES API
// ============================================
export const messagesAPI = {
  getConversations: async () => {
    const response = await apiCall('/messages/conversations');
    return response.data;
  },
  getMessages: async (userId: string) => {
    const response = await apiCall(`/messages/${userId}`);
    return response.data;
  },
  send: async (userId: string, content: string) => {
    const response = await apiCall(`/messages/${userId}`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
    return response.data;
  },
};

// ============================================
// GUILDS API
// ============================================
export const guildsAPI = {
  getAll: async () => {
    const response = await apiCall('/guilds');
    return response.data;
  },
  create: async (data: { name: string; description: string; icon?: string; maxMembers?: number; isPrivate?: boolean }) => {
    const response = await apiCall('/guilds', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },
  join: async (id: string) => {
    const response = await apiCall(`/guilds/${id}/join`, { method: 'POST' });
    return response;
  },
  leave: async (id: string) => {
    const response = await apiCall(`/guilds/${id}/leave`, { method: 'POST' });
    return response;
  },
};

// ============================================
// TOURNAMENTS API
// ============================================
export const tournamentsAPI = {
  getAll: async () => {
    const response = await apiCall('/tournaments');
    return response.data;
  },
  join: async (id: string) => {
    const response = await apiCall(`/tournaments/${id}/join`, { method: 'POST' });
    return response;
  },
};

// ============================================
// AI API
// ============================================
export const aiAPI = {
  chat: async (message: string) => {
    const response = await apiCall('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
    return response;
  },
};
// ============================================
// HEALTH CHECK
// ============================================
export const healthAPI = {
  check: async () => {
    const response = await fetch(`${API_URL.replace('/api', '')}/health`);
    return response.json();
  },
};
