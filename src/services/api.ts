// ============================================
// API Service - Connects Frontend to Backend
// Replaces localStorage with real API calls
// ============================================

import { User, Post, Comment, Notification } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function for API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('nijuze_token');
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
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
  image: async (file: File) => {
    const formData = new FormData();
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

    if (!response.ok) {
      throw new Error(data.error || 'Upload failed');
    }

    return data;
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
