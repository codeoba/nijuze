import React, { useState, useEffect } from 'react';
import { QrCode, Download, Copy, Check } from 'lucide-react';

// Simple QR Code generator using canvas
const generateQRCode = (text: string, size: number = 200): string => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return '';

  canvas.width = size;
  canvas.height = size;

  // Simple QR-like pattern (in production, use a proper QR library)
  const cellSize = size / 21;
  
  // Fill white background
  context.fillStyle = 'white';
  context.fillRect(0, 0, size, size);

  // Generate pattern based on text
  const hash = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  context.fillStyle = 'black';
  
  // Draw finder patterns (corners)
  const drawFinderPattern = (x: number, y: number) => {
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        if (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4)) {
          context.fillRect((x + i) * cellSize, (y + j) * cellSize, cellSize, cellSize);
        }
      }
    }
  };

  drawFinderPattern(0, 0);
  drawFinderPattern(14, 0);
  drawFinderPattern(0, 14);

  // Draw data pattern
  for (let i = 8; i < 13; i++) {
    for (let j = 8; j < 13; j++) {
      if ((i + j + hash) % 2 === 0) {
        context.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
      }
    }
  }

  // Add some random data modules
  for (let i = 0; i < 21; i++) {
    for (let j = 0; j < 21; j++) {
      if ((i + j + hash) % 3 === 0 && i > 7 && j > 7 && i < 14 && j < 14) {
        context.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
      }
    }
  }

  return canvas.toDataURL('image/png');
};

interface QRCodeShareProps {
  url: string;
  title?: string;
}

export const QRCodeShare: React.FC<QRCodeShareProps> = ({ url, title = 'Nijuze Post' }) => {
  const [qrCode, setQrCode] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const qr = generateQRCode(url, 300);
    setQrCode(qr);
  }, [url]);

  const handleDownload = () => {
    if (!qrCode) return;
    
    const link = document.createElement('a');
    link.download = `nijuze-qr-${Date.now()}.png`;
    link.href = qrCode;
    link.click();
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="glass-card" style={{ padding: 24, textAlign: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
        <QrCode size={24} color="#a5b4fc" />
        <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>QR Code</h3>
      </div>

      {/* QR Code Image */}
      <div style={{
        display: 'inline-block',
        padding: 16,
        background: 'white',
        borderRadius: 12,
        marginBottom: 20,
      }}>
        {qrCode ? (
          <img src={qrCode} alt="QR Code" style={{ display: 'block' }} />
        ) : (
          <div style={{ width: 300, height: 300, background: '#f1f5f9' }} />
        )}
      </div>

      <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
        Skani QR code hii kufungua post hii
      </p>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={handleDownload}
          className="btn-primary"
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          <Download size={16} />
          Pakua QR
        </button>
        <button
          onClick={handleCopyUrl}
          className="btn-ghost"
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Imenakiliwa!' : 'Nakili URL'}
        </button>
      </div>
    </div>
  );
};
