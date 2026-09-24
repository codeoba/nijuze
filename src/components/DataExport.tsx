import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, Database, Check } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export const DataExport: React.FC = () => {
  const { currentUser, posts, comments, users } = useApp();
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'excel'>('csv');
  const [exportType, setExportType] = useState<'posts' | 'comments' | 'users' | 'all'>('all');
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  const convertToCSV = (data: any[]): string => {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header];
          const escaped = ('' + value).replace(/"/g, '""');
          return `"${escaped}"`;
        }).join(',')
      )
    ];

    return csvRows.join('\n');
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportComplete(false);

    // Simulate export delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    let data: any[] = [];
    let filename = '';

    switch (exportType) {
      case 'posts':
        data = posts.map(p => ({
          id: p.id,
          title: p.title,
          content: p.content,
          author: p.author.username,
          category: p.category,
          tags: p.tags.join('; '),
          upvotes: p.upvotes,
          downvotes: p.downvotes,
          comments: p.commentsCount,
          views: p.views,
          createdAt: new Date(p.createdAt).toISOString(),
        }));
        filename = `nijuze_posts_${Date.now()}`;
        break;

      case 'comments':
        data = comments.map(c => ({
          id: c.id,
          content: c.content,
          author: c.author.username,
          upvotes: c.upvotes,
          downvotes: c.downvotes,
          isBestAnswer: c.isBestAnswer,
          createdAt: new Date(c.createdAt).toISOString(),
        }));
        filename = `nijuze_comments_${Date.now()}`;
        break;

      case 'users':
        data = users.map(u => ({
          id: u.id,
          username: u.username,
          email: u.email,
          role: u.role,
          reputation: u.reputation,
          postsCount: u.postsCount,
          answersCount: u.answersCount,
          followers: u.followers,
          following: u.following,
          joinedAt: new Date(u.joinedAt).toISOString(),
        }));
        filename = `nijuze_users_${Date.now()}`;
        break;

      case 'all':
        data = [{
          type: 'complete_export',
          posts: posts.map(p => ({
            id: p.id,
            title: p.title,
            content: p.content,
            author: p.author.username,
            category: p.category,
            tags: p.tags,
            upvotes: p.upvotes,
            comments: p.commentsCount,
            views: p.views,
            createdAt: p.createdAt,
          })),
          comments: comments.map(c => ({
            id: c.id,
            content: c.content,
            author: c.author.username,
            upvotes: c.upvotes,
            createdAt: c.createdAt,
          })),
          users: users.map(u => ({
            id: u.id,
            username: u.username,
            email: u.email,
            role: u.role,
            reputation: u.reputation,
          })),
          exportedAt: new Date().toISOString(),
          version: '1.0.0',
        }];
        filename = `nijuze_all_data_${Date.now()}`;
        break;
    }

    let content = '';
    let mimeType = '';

    switch (exportFormat) {
      case 'csv':
        content = convertToCSV(Array.isArray(data) ? data : [data]);
        mimeType = 'text/csv';
        filename += '.csv';
        break;

      case 'json':
        content = JSON.stringify(data, null, 2);
        mimeType = 'application/json';
        filename += '.json';
        break;

      case 'excel':
        // For Excel, we'll use CSV format (can be opened in Excel)
        content = convertToCSV(Array.isArray(data) ? data : [data]);
        mimeType = 'text/csv';
        filename += '.csv';
        break;
    }

    downloadFile(content, filename, mimeType);

    setIsExporting(false);
    setExportComplete(true);

    setTimeout(() => setExportComplete(false), 3000);
  };

  if (!currentUser) return null;

  return (
    <div className="glass-card" style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <Download size={24} color="#a5b4fc" />
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Export Data</h3>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
            Pakua data yako kwa format tofauti
          </p>
        </div>
      </div>

      {/* Export Type */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 14, fontWeight: 500, color: '#cbd5e1', marginBottom: 12, display: 'block' }}>
          Aina ya Data
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
          {[
            { id: 'posts', label: 'Posts', icon: FileText, count: posts.length },
            { id: 'comments', label: 'Comments', icon: FileText, count: comments.length },
            { id: 'users', label: 'Users', icon: Database, count: users.length },
            { id: 'all', label: 'Data Zote', icon: Database, count: posts.length + comments.length + users.length },
          ].map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setExportType(type.id as any)}
                style={{
                  padding: 16,
                  borderRadius: 12,
                  background: exportType === type.id ? 'rgba(99, 102, 241, 0.15)' : 'rgba(30, 41, 59, 0.3)',
                  border: `1px solid ${exportType === type.id ? 'rgba(99, 102, 241, 0.5)' : 'rgba(51, 65, 85, 0.3)'}`,
                  color: exportType === type.id ? '#a5b4fc' : '#94a3b8',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.2s ease',
                }}
              >
                <Icon size={24} />
                <span style={{ fontSize: 14, fontWeight: 500 }}>{type.label}</span>
                <span style={{ fontSize: 12, opacity: 0.7 }}>{type.count} items</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Export Format */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ fontSize: 14, fontWeight: 500, color: '#cbd5e1', marginBottom: 12, display: 'block' }}>
          Format
        </label>
        <div style={{ display: 'flex', gap: 12 }}>
          {[
            { id: 'csv', label: 'CSV', icon: FileSpreadsheet, description: 'Compatible na Excel, Google Sheets' },
            { id: 'json', label: 'JSON', icon: FileText, description: 'Format ya data, rahisi kusoma' },
            { id: 'excel', label: 'Excel', icon: FileSpreadsheet, description: 'Microsoft Excel format' },
          ].map((format) => {
            const Icon = format.icon;
            return (
              <button
                key={format.id}
                onClick={() => setExportFormat(format.id as any)}
                style={{
                  flex: 1,
                  padding: 16,
                  borderRadius: 12,
                  background: exportFormat === format.id ? 'rgba(99, 102, 241, 0.15)' : 'rgba(30, 41, 59, 0.3)',
                  border: `1px solid ${exportFormat === format.id ? 'rgba(99, 102, 241, 0.5)' : 'rgba(51, 65, 85, 0.3)'}`,
                  color: exportFormat === format.id ? '#a5b4fc' : '#94a3b8',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.2s ease',
                }}
              >
                <Icon size={24} />
                <span style={{ fontSize: 14, fontWeight: 500 }}>{format.label}</span>
                <span style={{ fontSize: 11, opacity: 0.7, textAlign: 'center' }}>{format.description}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Export Button */}
      <button
        onClick={handleExport}
        disabled={isExporting}
        className="btn-primary"
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          opacity: isExporting ? 0.7 : 1,
          cursor: isExporting ? 'not-allowed' : 'pointer',
        }}
      >
        {isExporting ? (
          <>
            <div style={{
              width: 16,
              height: 16,
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderTopColor: 'white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }} />
            Inaexport...
          </>
        ) : exportComplete ? (
          <>
            <Check size={16} />
            Imeexportwa!
          </>
        ) : (
          <>
            <Download size={16} />
            Export Sasa
          </>
        )}
      </button>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
