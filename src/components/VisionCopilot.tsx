import { useState } from 'react';
import { Camera, Monitor, PhoneOff, ShieldCheck, Sparkles } from 'lucide-react';
import { useVisionCopilot } from '../live/useVisionCopilot';
import type { VideoSourceMode } from '../media/videoSampler';

export function VisionCopilot() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY ?? '';
  const [sourceMode, setSourceMode] = useState<VideoSourceMode>('screen');

  const {
    videoRef,
    connected,
    voiceGatedVideo,
    setVoiceGatedVideo,
    framesSent,
    framesSkipped,
    error,
    turns,
    connect,
    disconnect,
  } = useVisionCopilot(apiKey);

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: '#050811' }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 24px',
          borderBottom: '1px solid #1e293b',
          background: '#0b1120',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Sparkles size={18} color="#38bdf8" />
          <strong>Gemini Live Vision Copilot</strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: '#cbd5e1' }}>
            <input
              type="checkbox"
              checked={voiceGatedVideo}
              onChange={(e) => setVoiceGatedVideo(e.target.checked)}
            />
            <ShieldCheck size={14} color="#34d399" />
            Voice-Gated 1 FPS (Saves Video Tokens)
          </label>
          <span style={{ color: '#34d399' }}>Sent: {framesSent}</span>
          <span style={{ color: '#94a3b8' }}>Skipped: {framesSkipped}</span>
        </div>
      </header>

      <main style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, padding: 16, minHeight: 0 }}>
        <section style={{ background: '#0b1120', borderRadius: 14, border: '1px solid #1e293b', padding: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <video
            ref={videoRef}
            muted
            playsInline
            style={{ width: '100%', flex: 1, objectFit: 'contain', borderRadius: 10, background: '#020617' }}
          />
          {error && <p style={{ color: '#f87171', fontSize: 13, margin: 0 }}>{error}</p>}
        </section>

        <section style={{ background: '#0b1120', borderRadius: 14, border: '1px solid #1e293b', padding: 16, display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>
          <strong style={{ fontSize: 14 }}>Multimodal Transcript</strong>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
            {turns.length === 0 ? (
              <span style={{ color: '#64748b' }}>Share your screen or camera and speak to Gemini Live...</span>
            ) : (
              turns.map((t) => (
                <div key={t.id}>
                  <strong style={{ color: t.role === 'user' ? '#38bdf8' : '#34d399' }}>
                    {t.role === 'user' ? 'You' : 'Gemini'}:
                  </strong>{' '}
                  {t.text}
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      <footer style={{ padding: 14, borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'center', gap: 12 }}>
        <button
          disabled={connected}
          onClick={() => setSourceMode('screen')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 16px',
            borderRadius: 10,
            border: sourceMode === 'screen' ? '1px solid #38bdf8' : '1px solid #334155',
            background: '#0f172a',
            color: '#f8fafc',
            cursor: 'pointer',
          }}
        >
          <Monitor size={16} /> Screen Share
        </button>

        <button
          disabled={connected}
          onClick={() => setSourceMode('camera')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 16px',
            borderRadius: 10,
            border: sourceMode === 'camera' ? '1px solid #38bdf8' : '1px solid #334155',
            background: '#0f172a',
            color: '#f8fafc',
            cursor: 'pointer',
          }}
        >
          <Camera size={16} /> Camera
        </button>

        <button
          onClick={connected ? disconnect : () => void connect(sourceMode)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 24px',
            borderRadius: 10,
            border: 'none',
            background: connected ? '#ef4444' : '#34d399',
            color: connected ? '#fff' : '#020617',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {connected ? <PhoneOff size={16} /> : <Sparkles size={16} />}
          {connected ? 'Stop Copilot' : 'Start Live Vision'}
        </button>
      </footer>
    </div>
  );
}
