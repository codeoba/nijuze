import React from 'react';
import { useRouter } from '../router/Router';
import { DailyChallenges } from '../components/DailyChallenges';
import { ArrowLeft } from 'lucide-react';

export const ChallengesPage: React.FC = () => {
  const { navigate } = useRouter();
  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px', minHeight: '100vh' }}>
      <button 
        onClick={() => navigate('/')} 
        className="btn-ghost" 
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 20, cursor: 'pointer' }}
      >
        <ArrowLeft size={16} /> Rudi Nyumbani
      </button>
      <DailyChallenges />
    </div>
  );
};
