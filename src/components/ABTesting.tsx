import React, { useState, useEffect } from 'react';
import { FlaskConical, BarChart3, Users, TrendingUp, Check, X } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface ABTest {
  id: string;
  name: string;
  description: string;
  variantA: { name: string; value: any };
  variantB: { name: string; value: any };
  metric: string;
  startDate: Date;
  endDate: Date;
  status: 'running' | 'completed' | 'draft';
  results?: {
    variantA: { users: number; conversions: number; rate: number };
    variantB: { users: number; conversions: number; rate: number };
    winner: 'A' | 'B' | 'tie';
  };
}

export const ABTesting: React.FC = () => {
  const { currentUser } = useApp();
  const [tests, setTests] = useState<ABTest[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    // Load A/B tests
    const savedTests = localStorage.getItem('ab_tests');
    if (savedTests) {
      setTests(JSON.parse(savedTests));
    } else {
      // Create sample tests
      const sampleTests: ABTest[] = [
        {
          id: 'test-1',
          name: 'Button Color',
          description: 'Test blue vs purple button color',
          variantA: { name: 'Blue Button', value: '#3b82f6' },
          variantB: { name: 'Purple Button', value: '#9333ea' },
          metric: 'Click Rate',
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          status: 'running',
        },
        {
          id: 'test-2',
          name: 'CTA Text',
          description: 'Test "Sign Up" vs "Get Started"',
          variantA: { name: 'Sign Up', value: 'Sign Up' },
          variantB: { name: 'Get Started', value: 'Get Started' },
          metric: 'Conversion Rate',
          startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          status: 'completed',
          results: {
            variantA: { users: 500, conversions: 45, rate: 9.0 },
            variantB: { users: 500, conversions: 62, rate: 12.4 },
            winner: 'B',
          },
        },
      ];
      setTests(sampleTests);
      localStorage.setItem('ab_tests', JSON.stringify(sampleTests));
    }
  }, []);

  const createTest = (test: Omit<ABTest, 'id' | 'status'>) => {
    const newTest: ABTest = {
      ...test,
      id: `test-${Date.now()}`,
      status: 'draft',
    };
    const updated = [...tests, newTest];
    setTests(updated);
    localStorage.setItem('ab_tests', JSON.stringify(updated));
    setShowCreateModal(false);
  };

  const startTest = (testId: string) => {
    const updated = tests.map(t =>
      t.id === testId ? { ...t, status: 'running' as const } : t
    );
    setTests(updated);
    localStorage.setItem('ab_tests', JSON.stringify(updated));
  };

  const deleteTest = (testId: string) => {
    if (confirm('Una uhakika unataka kufuta test hii?')) {
      const updated = tests.filter(t => t.id !== testId);
      setTests(updated);
      localStorage.setItem('ab_tests', JSON.stringify(updated));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return '#10b981';
      case 'completed': return '#6366f1';
      case 'draft': return '#94a3b8';
      default: return '#94a3b8';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'running': return 'Inaendelea';
      case 'completed': return 'Imekamilika';
      case 'draft': return 'Draft';
      default: return status;
    }
  };

  if (!currentUser) return null;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <FlaskConical size={32} color="#6366f1" />
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>A/B Testing</h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
              Jaribu variations tofauti na upime matokeo
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <FlaskConical size={16} />
          Unda Test Mpya
        </button>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 32,
      }}>
        {[
          { label: 'Tests Zote', value: tests.length, icon: FlaskConical, color: 'var(--btn-ghost-text)' },
          { label: 'Zinaendelea', value: tests.filter(t => t.status === 'running').length, icon: TrendingUp, color: '#10b981' },
          { label: 'Zimekamilika', value: tests.filter(t => t.status === 'completed').length, icon: Check, color: '#6366f1' },
          { label: 'Winners', value: tests.filter(t => t.results?.winner).length, icon: BarChart3, color: '#fbbf24' },
        ].map((stat, i) => (
          <div key={i} className="glass-card" style={{ padding: 20 }}>
            <stat.icon size={24} color={stat.color} style={{ marginBottom: 12 }} />
            <p style={{ fontSize: 28, fontWeight: 700, color: stat.color, marginBottom: 4 }}>
              {stat.value}
            </p>
            <p style={{ fontSize: 13, color: '#64748b' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tests List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {tests.map((test) => (
          <div key={test.id} className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>{test.name}</h3>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: 12,
                    background: `${getStatusColor(test.status)}20`,
                    color: getStatusColor(test.status),
                    fontSize: 12,
                    fontWeight: 600,
                  }}>
                    {getStatusLabel(test.status)}
                  </span>
                </div>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>{test.description}</p>
              </div>
              <button
                onClick={() => deleteTest(test.id)}
                style={{
                  padding: 8,
                  borderRadius: 8,
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <X size={16} color="#fca5a5" />
              </button>
            </div>

            {/* Variants */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div style={{
                padding: 16,
                borderRadius: 12,
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
              }}>
                <p style={{ fontSize: 12, color: '#60a5fa', marginBottom: 4 }}>Variant A</p>
                <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
                  {test.variantA.name}
                </p>
                {test.results && (
                  <div style={{ marginTop: 12 }}>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                      {test.results.variantA.users} users • {test.results.variantA.rate}% conversion
                    </p>
                  </div>
                )}
              </div>
              <div style={{
                padding: 16,
                borderRadius: 12,
                background: 'rgba(147, 51, 234, 0.1)',
                border: '1px solid rgba(147, 51, 234, 0.3)',
              }}>
                <p style={{ fontSize: 12, color: '#c084fc', marginBottom: 4 }}>Variant B</p>
                <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
                  {test.variantB.name}
                </p>
                {test.results && (
                  <div style={{ marginTop: 12 }}>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                      {test.results.variantB.users} users • {test.results.variantB.rate}% conversion
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Results */}
            {test.results && (
              <div style={{
                padding: 16,
                borderRadius: 12,
                background: test.results.winner === 'A' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(147, 51, 234, 0.1)',
                border: `1px solid ${test.results.winner === 'A' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(147, 51, 234, 0.3)'}`,
                marginBottom: 16,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <TrendingUp size={18} color={test.results.winner === 'A' ? '#60a5fa' : '#c084fc'} />
                  <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: 'var(--text-main)' }}>
                    Winner: Variant {test.results.winner}
                  </p>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                  Variant {test.results.winner} ilifanikiwa zaidi kwa {Math.abs(test.results.variantA.rate - test.results.variantB.rate).toFixed(1)}%
                </p>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8 }}>
              {test.status === 'draft' && (
                <button
                  onClick={() => startTest(test.id)}
                  className="btn-primary"
                  style={{ flex: 1 }}
                >
                  Anza Test
                </button>
              )}
              <button
                className="btn-ghost"
                style={{ flex: 1 }}
              >
                Tazama Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Test Modal */}
      {showCreateModal && (
        <CreateTestModal
          onClose={() => setShowCreateModal(false)}
          onCreate={createTest}
        />
      )}
    </div>
  );
};

interface CreateTestModalProps {
  onClose: () => void;
  onCreate: (test: Omit<ABTest, 'id' | 'status'>) => void;
}

const CreateTestModal: React.FC<CreateTestModalProps> = ({ onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [variantAName, setVariantAName] = useState('');
  const [variantBName, setVariantBName] = useState('');
  const [metric, setMetric] = useState('Conversion Rate');
  const [duration, setDuration] = useState(7);

  const handleSubmit = () => {
    if (!name || !variantAName || !variantBName) {
      alert('Tafadhali jaza taarifa zote');
      return;
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + duration);

    onCreate({
      name,
      description,
      variantA: { name: variantAName, value: variantAName },
      variantB: { name: variantBName, value: variantBName },
      metric,
      startDate,
      endDate,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-card"
        style={{ width: '100%', maxWidth: 600, margin: '0 16px', padding: 32 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Unda A/B Test Mpya</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-body)', marginBottom: 8, display: 'block' }}>
              Jina la Test
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Mfano: Button Color Test"
              style={{
                width: '100%',
                padding: 12,
                borderRadius: 12,
                background: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(51, 65, 85, 0.5)',
                color: 'var(--text-main)',
                fontSize: 14,
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-body)', marginBottom: 8, display: 'block' }}>
              Maelezo
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Eleza lengo la test hii..."
              style={{
                width: '100%',
                padding: 12,
                borderRadius: 12,
                background: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(51, 65, 85, 0.5)',
                color: 'var(--text-main)',
                fontSize: 14,
                resize: 'vertical',
                minHeight: 80,
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-body)', marginBottom: 8, display: 'block' }}>
                Variant A
              </label>
              <input
                type="text"
                value={variantAName}
                onChange={(e) => setVariantAName(e.target.value)}
                placeholder="Control"
                style={{
                  width: '100%',
                  padding: 12,
                  borderRadius: 12,
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(51, 65, 85, 0.5)',
                  color: 'var(--text-main)',
                  fontSize: 14,
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-body)', marginBottom: 8, display: 'block' }}>
                Variant B
              </label>
              <input
                type="text"
                value={variantBName}
                onChange={(e) => setVariantBName(e.target.value)}
                placeholder="Variation"
                style={{
                  width: '100%',
                  padding: 12,
                  borderRadius: 12,
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(51, 65, 85, 0.5)',
                  color: 'var(--text-main)',
                  fontSize: 14,
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-body)', marginBottom: 8, display: 'block' }}>
              Metric
            </label>
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              style={{
                width: '100%',
                padding: 12,
                borderRadius: 12,
                background: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(51, 65, 85, 0.5)',
                color: 'var(--text-main)',
                fontSize: 14,
              }}
            >
              <option>Conversion Rate</option>
              <option>Click Rate</option>
              <option>Engagement Rate</option>
              <option>Bounce Rate</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-body)', marginBottom: 8, display: 'block' }}>
              Muda (siku)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              min="1"
              max="90"
              style={{
                width: '100%',
                padding: 12,
                borderRadius: 12,
                background: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(51, 65, 85, 0.5)',
                color: 'var(--text-main)',
                fontSize: 14,
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button onClick={onClose} className="btn-ghost" style={{ flex: 1 }}>
              Ghairi
            </button>
            <button onClick={handleSubmit} className="btn-primary" style={{ flex: 1 }}>
              Unda Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
