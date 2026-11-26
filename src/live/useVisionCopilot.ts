import { useCallback, useEffect, useRef, useState } from 'react';
import { GoogleGenAI, Modality, type LiveServerMessage } from '@google/genai';
import { PcmPlayer24k, startMicStream } from '../media/audioPipeline';
import { captureJpegFrameBase64, startVideoStream, type VideoSourceMode } from '../media/videoSampler';

export interface CopilotTurn {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

export function useVisionCopilot(apiKey: string) {
  const [connected, setConnected] = useState(false);
  const [voiceGatedVideo, setVoiceGatedVideo] = useState(true);
  const [framesSent, setFramesSent] = useState(0);
  const [framesSkipped, setFramesSkipped] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [turns, setTurns] = useState<CopilotTurn[]>([]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const sessionRef = useRef<Awaited<ReturnType<GoogleGenAI['live']['connect']>> | null>(null);
  const micRef = useRef<{ stop: () => void } | null>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const playerRef = useRef<PcmPlayer24k | null>(null);
  const frameTimerRef = useRef<number | null>(null);
  const lastVoiceActiveRef = useRef<number>(0);

  const appendTurn = useCallback((role: 'user' | 'assistant', text: string) => {
    if (!text.trim()) return;
    setTurns((prev) => [...prev.slice(-30), { id: `${Date.now()}-${Math.random()}`, role, text: text.trim() }]);
  }, []);

  const disconnect = useCallback(() => {
    if (frameTimerRef.current) window.clearInterval(frameTimerRef.current);
    frameTimerRef.current = null;
    micRef.current?.stop();
    micRef.current = null;
    videoStreamRef.current?.getTracks().forEach((t) => t.stop());
    videoStreamRef.current = null;
    playerRef.current?.dispose();
    playerRef.current = null;
    sessionRef.current?.close();
    sessionRef.current = null;
    setConnected(false);
  }, []);

  const connect = useCallback(
    async (sourceMode: VideoSourceMode) => {
      if (!apiKey) {
        setError('Missing VITE_GEMINI_API_KEY in .env');
        return;
      }
      if (!videoRef.current) return;

      try {
        setError(null);
        const videoStream = await startVideoStream(videoRef.current, sourceMode);
        videoStreamRef.current = videoStream;

        const ai = new GoogleGenAI({ apiKey });
        const player = new PcmPlayer24k();
        playerRef.current = player;

        const session = await ai.live.connect({
          model: 'gemini-3.8-live',
          config: {
            responseModalities: [Modality.AUDIO],
            systemInstruction: {
              parts: [
                {
                  text: 'You are a sharp real-time multimodal copilot. You see the user screen or camera at 1 FPS and hear their voice. Give concise, actionable visual guidance.',
                },
              ],
            },
            inputAudioTranscription: {},
            outputAudioTranscription: {},
          },
          callbacks: {
            onopen: () => setConnected(true),
            onmessage: (msg: LiveServerMessage) => {
              const sc = msg.serverContent;
              if (!sc) return;
              if (sc.interrupted) player.flush();
              if (sc.inputTranscription?.text) appendTurn('user', sc.inputTranscription.text);
              if (sc.outputTranscription?.text) appendTurn('assistant', sc.outputTranscription.text);
              for (const part of sc.modelTurn?.parts ?? []) {
                if (part.inlineData?.data && part.inlineData.mimeType?.startsWith('audio/pcm')) {
                  player.enqueue(part.inlineData.data);
                }
              }
            },
            onerror: (err: ErrorEvent) => setError(err.message || 'Live WebSocket error'),
            onclose: () => setConnected(false),
          },
        });

        sessionRef.current = session;

        micRef.current = await startMicStream((base64Pcm, rms) => {
          if (rms > 0.018) lastVoiceActiveRef.current = Date.now();
          session.sendRealtimeInput({
            audio: { data: base64Pcm, mimeType: 'audio/pcm;rate=16000' },
          });
        });

        // 1 FPS JPEG video sampler with optional Voice-Gated token optimization
        frameTimerRef.current = window.setInterval(() => {
          if (!videoRef.current || !sessionRef.current) return;
          const recentlySpoke = Date.now() - lastVoiceActiveRef.current < 3000;
          if (voiceGatedVideo && !recentlySpoke) {
            setFramesSkipped((n) => n + 1);
            return;
          }
          const jpeg = captureJpegFrameBase64(videoRef.current);
          if (jpeg) {
            sessionRef.current.sendRealtimeInput({
              video: { data: jpeg, mimeType: 'image/jpeg' },
            });
            setFramesSent((n) => n + 1);
          }
        }, 1000);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to start Vision Copilot');
        disconnect();
      }
    },
    [apiKey, voiceGatedVideo, appendTurn, disconnect]
  );

  useEffect(() => () => disconnect(), [disconnect]);

  return {
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
  };
}
