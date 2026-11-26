/**
 * Captures <= 1 FPS JPEG frames from a live <video> element (screen share or camera)
 * for Gemini Live API multimodal streaming.
 */
export type VideoSourceMode = 'screen' | 'camera';

export async function startVideoStream(
  videoEl: HTMLVideoElement,
  mode: VideoSourceMode
): Promise<MediaStream> {
  const stream =
    mode === 'screen'
      ? await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 5 }, audio: false })
      : await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: false });

  videoEl.srcObject = stream;
  await videoEl.play();
  return stream;
}

export function captureJpegFrameBase64(
  videoEl: HTMLVideoElement,
  maxWidth = 1024,
  quality = 0.72
): string | null {
  if (!videoEl.videoWidth || !videoEl.videoHeight) return null;

  const scale = Math.min(1, maxWidth / videoEl.videoWidth);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(videoEl.videoWidth * scale);
  canvas.height = Math.round(videoEl.videoHeight * scale);

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
  const dataUrl = canvas.toDataURL('image/jpeg', quality);
  return dataUrl.split(',')[1] ?? null;
}
