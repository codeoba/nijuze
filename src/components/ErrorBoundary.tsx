import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ maxWidth: 600, margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
          <div className="glass-card" style={{ padding: 40, borderRadius: 20 }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              color: '#ef4444'
            }}>
              <AlertCircle size={32} />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10, color: 'var(--text-main)' }}>
              Kuna Hitilafu Imegundulika
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
              Samahani, ukurasa huu umepata changamoto ndogo ya kiufundi wakati wa kupakia. Tafadhali jaribu kupakia upya au urudi ukurasa wa mwanzo.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                onClick={this.handleReload} 
                className="btn-primary" 
                style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}
              >
                <RotateCcw size={16} /> Pakia Upya
              </button>
              <button 
                onClick={this.handleGoHome} 
                className="btn-ghost" 
                style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}
              >
                <Home size={16} /> Rudi Mwanzo
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
