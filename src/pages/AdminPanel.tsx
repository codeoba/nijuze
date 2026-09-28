import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { useRouter } from '../router/Router';
import { 
  Users, FileText, MessageCircle, Flag, Settings, BarChart3,
  Shield, TrendingUp, Eye, ThumbsUp, AlertCircle, Check,
  X, Trash2, Edit, Ban, Award, Search, Filter, Download,
  Activity, Globe, Lock, Unlock, Star, Clock, Zap
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const { currentUser, users, posts, comments, notifications } = useApp();
  const { navigate } = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Check if user is admin
  if (!currentUser || currentUser.role !== 'Admin') {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <Shield size={64} color="#ef4444" style={{ margin: '0 auto 24px' }} />
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Access Denied</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
          Huna ruhusa ya kufikia admin panel
        </p>
        <button onClick={() => navigate('/')} className="btn-primary">
          Rudi Nyumbani
        </button>
      </div>
    );
  }

  // Statistics
  const stats = {
    totalUsers: users.length,
    totalPosts: posts.length,
    totalComments: comments.length,
    totalViews: posts.reduce((sum, p) => sum + p.views, 0),
    activeUsers: users.filter(u => u.postsCount > 0 || u.answersCount > 0).length,
    reportedContent: 0, // TODO: Implement reporting system
    pendingApprovals: 0, // TODO: Implement approval system
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'users', label: 'Watumiaji', icon: Users },
    { id: 'posts', label: 'Posts', icon: FileText },
    { id: 'comments', label: 'Comments', icon: MessageCircle },
    { id: 'reports', label: 'Ripoti', icon: Flag },
    { id: 'categories', label: 'Kategoria', icon: Globe },
    { id: 'activities', label: 'Shughuli', icon: Activity },
    { id: 'settings', label: 'Mipangilio', icon: Settings },
  ];

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
          <Shield size={32} color="#6366f1" />
          <h1 style={{ fontSize: 32, fontWeight: 700 }}>Admin Panel</h1>
        </div>
        <p style={{ color: 'var(--text-muted)' }}>Dhibiti na uratibu mfumo wote wa Nijuze</p>
      </div>

      {/* Stats Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 32,
      }}>
        {[
          { label: 'Watumiaji', value: stats.totalUsers, icon: Users, color: 'var(--btn-ghost-text)', change: '+12%' },
          { label: 'Posts', value: stats.totalPosts, icon: FileText, color: '#6ee7b7', change: '+8%' },
          { label: 'Comments', value: stats.totalComments, icon: MessageCircle, color: '#fbbf24', change: '+15%' },
          { label: 'Views', value: stats.totalViews, icon: Eye, color: '#f472b6', change: '+24%' },
          { label: 'Active Users', value: stats.activeUsers, icon: Zap, color: '#c084fc', change: '+18%' },
          { label: 'Reports', value: stats.reportedContent, icon: Flag, color: '#ef4444', change: '-5%' },
        ].map((stat, i) => (
          <div
            key={i}
            className="glass-card"
            style={{ padding: 20 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <stat.icon size={24} color={stat.color} />
              <span style={{
                fontSize: 12,
                color: stat.change.startsWith('+') ? '#10b981' : '#ef4444',
                fontWeight: 600,
                padding: '4px 8px',
                borderRadius: 12,
                background: stat.change.startsWith('+') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
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

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: 8,
        marginBottom: 24,
        overflowX: 'auto',
        paddingBottom: 8,
      }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 16px',
                borderRadius: 12,
                background: activeTab === tab.id ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-subtle)',
                border: `1px solid ${activeTab === tab.id ? 'rgba(99, 102, 241, 0.5)' : 'var(--border-app)'}`,
                color: activeTab === tab.id ? '#a5b4fc' : '#94a3b8',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500,
                whiteSpace: 'nowrap',
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div>
        {activeTab === 'dashboard' && <AdminDashboard stats={stats} />}
        {activeTab === 'users' && <AdminUsers users={users} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />}
        {activeTab === 'posts' && <AdminPosts posts={posts} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />}
        {activeTab === 'comments' && <AdminComments comments={comments} />}
        {activeTab === 'reports' && <AdminReports />}
        {activeTab === 'categories' && <AdminCategories />}
        {activeTab === 'activities' && <AdminActivities />}
        {activeTab === 'settings' && <AdminSettings />}
      </div>
    </div>
  );
};

// Dashboard Component
const AdminDashboard: React.FC<{ stats: any }> = ({ stats }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
      {/* Activity Chart */}
      <div className="glass-card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Shughuli za Hivi Karibuni</h3>
        <div style={{ height: 300, display: 'flex', alignItems: 'flex-end', gap: 8 }}>
          {[45, 62, 78, 55, 89, 72, 95, 68, 82, 74, 91, 85].map((value, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${value}%`,
                background: 'linear-gradient(180deg, #6366f1, #9333ea)',
                borderRadius: 8,
                transition: 'height 0.3s ease',
              }}
            />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Quick Actions</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { label: 'Approve Pending Posts', icon: Check, color: '#10b981', count: 5 },
            { label: 'Review Reports', icon: Flag, color: '#ef4444', count: 3 },
            { label: 'Verify Users', icon: Award, color: '#fbbf24', count: 8 },
            { label: 'Moderate Comments', icon: MessageCircle, color: '#60a5fa', count: 12 },
          ].map((action, i) => (
            <button
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: 16,
                borderRadius: 12,
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-app)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <action.icon size={20} color={action.color} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-main)' }}>{action.label}</p>
                <p style={{ fontSize: 12, color: '#64748b' }}>{action.count} pending</p>
              </div>
              <span style={{
                padding: '4px 8px',
                borderRadius: 12,
                background: `${action.color}20`,
                color: action.color,
                fontSize: 12,
                fontWeight: 600,
              }}>
                {action.count}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Users Management Component
const AdminUsers: React.FC<{ users: any[]; searchQuery: string; setSearchQuery: (q: string) => void }> = ({ users, searchQuery, setSearchQuery }) => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* Search & Filter */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} color="#64748b" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tafuta watumiaji..."
            style={{
              width: '100%',
              padding: '10px 12px 10px 40px',
              borderRadius: 12,
              background: 'var(--input-bg)',
              border: '1px solid var(--border-app)',
              color: 'var(--text-main)',
              fontSize: 14,
            }}
          />
        </div>
        <button className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={16} />
          Filter
        </button>
        <button className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Download size={16} />
          Export
        </button>
      </div>

      {/* Users Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--input-bg)' }}>
              <th style={{ padding: 16, textAlign: 'left', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>
                <input type="checkbox" />
              </th>
              <th style={{ padding: 16, textAlign: 'left', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Mtumiaji</th>
              <th style={{ padding: 16, textAlign: 'left', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Email</th>
              <th style={{ padding: 16, textAlign: 'left', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Role</th>
              <th style={{ padding: 16, textAlign: 'left', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Posts</th>
              <th style={{ padding: 16, textAlign: 'left', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Status</th>
              <th style={{ padding: 16, textAlign: 'left', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} style={{ borderBottom: '1px solid var(--border-app)' }}>
                <td style={{ padding: 16 }}>
                  <input type="checkbox" />
                </td>
                <td style={{ padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6366f1, #9333ea)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      fontWeight: 'bold',
                    }}>
                      {user.avatar}
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-main)' }}>{user.username}</p>
                      <p style={{ fontSize: 12, color: '#64748b' }}>Joined {new Date(user.joinedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: 16, fontSize: 14, color: 'var(--text-body)' }}>{user.email}</td>
                <td style={{ padding: 16 }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: 12,
                    background: user.role === 'Admin' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                    color: user.role === 'Admin' ? '#fca5a5' : '#a5b4fc',
                    fontSize: 12,
                    fontWeight: 500,
                  }}>
                    {user.role}
                  </span>
                </td>
                <td style={{ padding: 16, fontSize: 14, color: 'var(--text-body)' }}>{user.postsCount}</td>
                <td style={{ padding: 16 }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: 12,
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: '#6ee7b7',
                    fontSize: 12,
                    fontWeight: 500,
                  }}>
                    Active
                  </span>
                </td>
                <td style={{ padding: 16 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={{ padding: 6, borderRadius: 6, background: 'rgba(99, 102, 241, 0.1)', border: 'none', cursor: 'pointer' }}>
                      <Edit size={14} color="#a5b4fc" />
                    </button>
                    <button style={{ padding: 6, borderRadius: 6, background: 'rgba(239, 68, 68, 0.1)', border: 'none', cursor: 'pointer' }}>
                      <Ban size={14} color="#fca5a5" />
                    </button>
                    <button style={{ padding: 6, borderRadius: 6, background: 'rgba(239, 68, 68, 0.1)', border: 'none', cursor: 'pointer' }}>
                      <Trash2 size={14} color="#fca5a5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Posts Management Component
const AdminPosts: React.FC<{ posts: any[]; searchQuery: string; setSearchQuery: (q: string) => void }> = ({ posts, searchQuery, setSearchQuery }) => {
  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} color="#64748b" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tafuta posts..."
            style={{
              width: '100%',
              padding: '10px 12px 10px 40px',
              borderRadius: 12,
              background: 'var(--input-bg)',
              border: '1px solid var(--border-app)',
              color: 'var(--text-main)',
              fontSize: 14,
            }}
          />
        </div>
        <button className="btn-ghost">Filter</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {posts.slice(0, 10).map((post) => (
          <div key={post.id} className="glass-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{post.title}</h4>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>by {post.author.username} • {new Date(post.createdAt).toLocaleDateString()}</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{ padding: 8, borderRadius: 8, background: 'rgba(16, 185, 129, 0.1)', border: 'none', cursor: 'pointer' }}>
                  <Check size={16} color="#6ee7b7" />
                </button>
                <button style={{ padding: 8, borderRadius: 8, background: 'rgba(239, 68, 68, 0.1)', border: 'none', cursor: 'pointer' }}>
                  <Trash2 size={16} color="#fca5a5" />
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#64748b' }}>
              <span><ThumbsUp size={14} style={{ display: 'inline' }} /> {post.upvotes}</span>
              <span><MessageCircle size={14} style={{ display: 'inline' }} /> {post.commentsCount}</span>
              <span><Eye size={14} style={{ display: 'inline' }} /> {post.views}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Comments Management Component
const AdminComments: React.FC<{ comments: any[] }> = ({ comments }) => {
  return (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Comments Management</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {comments.slice(0, 10).map((comment) => (
          <div key={comment.id} className="glass-card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <p style={{ fontSize: 14, color: 'var(--text-body)' }}>{comment.content}</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{ padding: 6, borderRadius: 6, background: 'rgba(239, 68, 68, 0.1)', border: 'none', cursor: 'pointer' }}>
                  <Trash2 size={14} color="#fca5a5" />
                </button>
              </div>
            </div>
            <p style={{ fontSize: 12, color: '#64748b' }}>by {comment.author.username} • {new Date(comment.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Reports Management Component
const AdminReports: React.FC = () => {
  return (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Content Reports</h3>
      <div style={{ textAlign: 'center', padding: 48, color: '#64748b' }}>
        <Flag size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
        <p>Hakuna ripoti mpya</p>
      </div>
    </div>
  );
};

// Categories Management Component
const AdminCategories: React.FC = () => {
  return (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Forum Categories</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
        {[
          { name: 'Teknolojia', icon: '💻', posts: 45200, followers: 12400 },
          { name: 'Biashara', icon: '📊', posts: 32100, followers: 8900 },
          { name: 'Sayansi', icon: '🔬', posts: 28400, followers: 6700 },
          { name: 'Sanaa', icon: '🎨', posts: 19800, followers: 5400 },
          { name: 'Michezo', icon: '⚽', posts: 15600, followers: 9800 },
        ].map((cat, i) => (
          <div key={i} className="glass-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 32 }}>{cat.icon}</span>
              <div>
                <h4 style={{ fontSize: 16, fontWeight: 600 }}>{cat.name}</h4>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{cat.posts.toLocaleString()} posts</p>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#64748b' }}>
              <span>{cat.followers.toLocaleString()} followers</span>
              <button style={{ color: 'var(--btn-ghost-text)', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 13 }}>
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Activities Component
const AdminActivities: React.FC = () => {
  const activities = [
    { type: 'post', user: 'Amina Hassan', action: 'created a post', time: '2 minutes ago', icon: FileText, color: '#6ee7b7' },
    { type: 'comment', user: 'Juma Bakari', action: 'commented on a post', time: '5 minutes ago', icon: MessageCircle, color: '#60a5fa' },
    { type: 'upvote', user: 'Fatma Omar', action: 'upvoted a post', time: '10 minutes ago', icon: ThumbsUp, color: '#fbbf24' },
    { type: 'follow', user: 'David Mwangi', action: 'followed Amina Hassan', time: '15 minutes ago', icon: Users, color: 'var(--btn-ghost-text)' },
    { type: 'badge', user: 'Amina Hassan', action: 'earned a badge', time: '1 hour ago', icon: Award, color: '#f472b6' },
  ];

  return (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Recent Activities</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {activities.map((activity, i) => (
          <div key={i} className="glass-card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: `${activity.color}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <activity.icon size={20} color={activity.color} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, color: 'var(--text-main)' }}>
                <strong>{activity.user}</strong> {activity.action}
              </p>
              <p style={{ fontSize: 12, color: '#64748b' }}>{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Settings Component
const AdminSettings: React.FC = () => {
  return (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>System Settings</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[
          { label: 'Site Name', value: 'Nijuze', type: 'text' },
          { label: 'Site Description', value: 'Jukwaa la maswali na majibu', type: 'text' },
          { label: 'Max Posts Per Day', value: '10', type: 'number' },
          { label: 'Max Comments Per Post', value: '100', type: 'number' },
          { label: 'Allow Anonymous Posts', value: 'true', type: 'select' },
          { label: 'Require Email Verification', value: 'true', type: 'select' },
        ].map((setting, i) => (
          <div key={i} className="glass-card" style={{ padding: 20 }}>
            <label style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-body)', marginBottom: 8, display: 'block' }}>
              {setting.label}
            </label>
            <input
              type={setting.type === 'select' ? 'text' : setting.type}
              defaultValue={setting.value}
              style={{
                width: '100%',
                padding: 10,
                borderRadius: 8,
                background: 'var(--input-bg)',
                border: '1px solid var(--border-app)',
                color: 'var(--text-main)',
                fontSize: 14,
              }}
            />
          </div>
        ))}
        <button className="btn-primary">Save Settings</button>
      </div>
    </div>
  );
};
