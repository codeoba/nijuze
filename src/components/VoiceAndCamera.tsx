import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Camera, Image as ImageIcon, X, Check } from 'lucide-react';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  placeholder?: string;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscript, placeholder = 'Anza kuzungumza...' }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'sw-TZ'; // Swahili

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      setTranscript('');
    }
  };

  const handleConfirm = () => {
    if (transcript) {
      onTranscript(transcript);
      setTranscript('');
    }
  };

  const handleCancel = () => {
    setTranscript('');
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  if (!supported) {
    return (
      <div style={{
        padding: 16,
        borderRadius: 12,
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        textAlign: 'center',
      }}>
        <MicOff size={24} color="#fca5a5" style={{ margin: '0 auto 8px' }} />
        <p style={{ fontSize: 14, color: '#fca5a5', margin: 0 }}>
          Voice input haiwezi kutumika kwenye browser hii
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <Mic size={20} color="#a5b4fc" />
        <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Voice Input</h3>
      </div>

      {/* Microphone Button */}
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <button
          onClick={toggleListening}
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: isListening
              ? 'linear-gradient(135deg, #ef4444, #dc2626)'
              : 'linear-gradient(135deg, #6366f1, #9333ea)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            position: 'relative',
            transition: 'all 0.3s ease',
          }}
        >
          {isListening && (
            <>
              <div style={{
                position: 'absolute',
                inset: -10,
                borderRadius: '50%',
                border: '2px solid rgba(239, 68, 68, 0.5)',
                animation: 'pulse 1.5s infinite',
              }} />
              <div style={{
                position: 'absolute',
                inset: -20,
                borderRadius: '50%',
                border: '2px solid rgba(239, 68, 68, 0.3)',
                animation: 'pulse 1.5s infinite 0.5s',
              }} />
            </>
          )}
          <Mic size={32} color="white" />
        </button>
        <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 12 }}>
          {isListening ? 'Inasikiliza...' : 'Bofya kuanza kuzungumza'}
        </p>
      </div>

      {/* Transcript */}
      {transcript && (
        <div style={{
          padding: 16,
          borderRadius: 12,
          background: 'rgba(30, 41, 59, 0.3)',
          border: '1px solid rgba(51, 65, 85, 0.3)',
          marginBottom: 16,
        }}>
          <p style={{ fontSize: 14, color: '#e2e8f0', marginBottom: 12, lineHeight: 1.6 }}>
            {transcript}
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleConfirm}
              className="btn-primary"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <Check size={16} />
              Tumia
            </button>
            <button
              onClick={handleCancel}
              className="btn-ghost"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <X size={16} />
              Ghairi
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
};

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture }) => {
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setShowCamera(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Haiwezi kufikia kamera. Tafadhali ruhusu access.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
        stopCamera();
      }
    }
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      setCapturedImage(null);
    }
  };

  const handleCancel = () => {
    setCapturedImage(null);
    stopCamera();
  };

  return (
    <div>
      {/* Camera Button */}
      {!showCamera && !capturedImage && (
        <button
          onClick={startCamera}
          className="btn-ghost"
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <Camera size={16} />
          Piga Picha
        </button>
      )}

      {/* Camera View */}
      {showCamera && (
        <div className="glass-card" style={{ padding: 20 }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{
              width: '100%',
              borderRadius: 12,
              marginBottom: 16,
            }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={capturePhoto}
              className="btn-primary"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <Camera size={16} />
              Piga Picha
            </button>
            <button
              onClick={stopCamera}
              className="btn-ghost"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <X size={16} />
              Ghairi
            </button>
          </div>
        </div>
      )}

      {/* Captured Image Preview */}
      {capturedImage && (
        <div className="glass-card" style={{ padding: 20 }}>
          <img
            src={capturedImage}
            alt="Captured"
            style={{
              width: '100%',
              borderRadius: 12,
              marginBottom: 16,
            }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleConfirm}
              className="btn-primary"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <Check size={16} />
              Tumia Picha
            </button>
            <button
              onClick={handleCancel}
              className="btn-ghost"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <X size={16} />
              Piga Tena
            </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};
