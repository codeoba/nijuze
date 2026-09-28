import React, { useState, useRef } from 'react';
import { Video, Play, Pause, Volume2, VolumeX, Maximize, X } from 'lucide-react';

interface VideoPostProps {
  videoUrl: string;
  thumbnail?: string;
  title: string;
  duration?: string;
}

export const VideoPost: React.FC<VideoPostProps> = ({ videoUrl, thumbnail, title, duration }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(progress);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div style={{
      borderRadius: 16,
      overflow: 'hidden',
      background: '#000',
      position: 'relative',
      aspectRatio: '16/9',
      marginBottom: 16,
    }}>
      <video
        ref={videoRef}
        src={videoUrl}
        poster={thumbnail}
        onTimeUpdate={handleTimeUpdate}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />

      {/* Play Overlay */}
      {!isPlaying && (
        <div
          onClick={togglePlay}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'rgba(99, 102, 241, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Play size={32} color="white" fill="white" />
          </div>
        </div>
      )}

      {/* Controls */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 12,
        background: 'linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent)',
      }}>
        {/* Progress Bar */}
        <div style={{
          height: 4,
          borderRadius: 2,
          background: 'rgba(255, 255, 255, 0.3)',
          marginBottom: 8,
          cursor: 'pointer',
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: '#6366f1',
            borderRadius: 2,
            transition: 'width 0.1s ease',
          }} />
        </div>

        {/* Control Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={togglePlay}
            style={{
              padding: 6,
              borderRadius: 6,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {isPlaying ? <Pause size={20} color="white" /> : <Play size={20} color="white" />}
          </button>

          <button
            onClick={toggleMute}
            style={{
              padding: 6,
              borderRadius: 6,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {isMuted ? <VolumeX size={20} color="white" /> : <Volume2 size={20} color="white" />}
          </button>

          <div style={{ flex: 1 }} />

          {duration && (
            <span style={{ fontSize: 13, color: 'white', fontWeight: 500 }}>
              {duration}
            </span>
          )}

          <button
            onClick={handleFullscreen}
            style={{
              padding: 6,
              borderRadius: 6,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Maximize size={20} color="white" />
          </button>
        </div>
      </div>

      {/* Title Overlay */}
      <div style={{
        position: 'absolute',
        top: 12,
        left: 12,
        right: 12,
        padding: 12,
        background: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 8,
        backdropFilter: 'blur(8px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Video size={16} color="#a5b4fc" />
          <h4 style={{ fontSize: 14, fontWeight: 600, color: 'white', margin: 0 }}>
            {title}
          </h4>
        </div>
      </div>
    </div>
  );
};

interface AudioPostProps {
  audioUrl: string;
  title: string;
  artist?: string;
  duration?: string;
}

export const AudioPost: React.FC<AudioPostProps> = ({ audioUrl, title, artist, duration }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(progress);
    }
  };

  return (
    <div style={{
      padding: 16,
      borderRadius: 16,
      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(147, 51, 234, 0.1))',
      border: '1px solid rgba(99, 102, 241, 0.3)',
      marginBottom: 16,
    }}>
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
        <button
          onClick={togglePlay}
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #9333ea)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {isPlaying ? <Pause size={20} color="white" /> : <Play size={20} color="white" fill="white" />}
        </button>

        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{title}</h4>
          {artist && <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{artist}</p>}
        </div>

        {duration && (
          <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
            {duration}
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div style={{
        height: 6,
        borderRadius: 3,
        background: 'var(--input-bg)',
        cursor: 'pointer',
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #6366f1, #9333ea)',
          borderRadius: 3,
          transition: 'width 0.1s ease',
        }} />
      </div>
    </div>
  );
};
