import React, { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';

interface ImageUploadProps {
  onImageSelect: (imageData: string) => void;
  currentImage?: string;
  onRemove?: () => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelect, currentImage, onRemove }) => {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Tafadhali chagua picha tu');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Picha lazima iwe chini ya 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const imageData = reader.result as string;
      setPreview(imageData);
      onImageSelect(imageData);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (onRemove) {
      onRemove();
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      {preview ? (
        <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden' }}>
          <img
            src={preview}
            alt="Preview"
            style={{
              width: '100%',
              maxHeight: 300,
              objectFit: 'cover',
              borderRadius: 12,
            }}
          />
          <button
            onClick={handleRemove}
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              padding: 8,
              borderRadius: 8,
              background: 'rgba(0, 0, 0, 0.7)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Trash2 size={16} color="white" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            padding: 32,
            borderRadius: 12,
            border: `2px dashed ${isDragging ? '#6366f1' : 'rgba(51, 65, 85, 0.5)'}`,
            background: isDragging ? 'rgba(99, 102, 241, 0.05)' : 'rgba(30, 41, 59, 0.3)',
            cursor: 'pointer',
            textAlign: 'center',
            transition: 'all 0.2s ease',
          }}
        >
          <Upload size={32} color="#64748b" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 4 }}>
            Bofya au buruta picha hapa
          </p>
          <p style={{ fontSize: 12, color: '#64748b' }}>
            PNG, JPG, GIF (max 5MB)
          </p>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        style={{ display: 'none' }}
      />
    </div>
  );
};
