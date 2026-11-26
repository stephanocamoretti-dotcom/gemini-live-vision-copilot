<p align="right">
  <a href="./README.es.md">🇪🇸 Leer en Español</a>
</p>

<p align="center">
  <img src="./assets/banner.svg" alt="Gemini Live Vision Copilot Banner" width="100%" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Gemini_Live_API-3.8_Live-38BDF8?style=for-the-badge&logo=google&logoColor=white" alt="Gemini Live API" />
  <img src="https://img.shields.io/badge/Multimodal-1FPS_Vision_+_PCM-34D399?style=for-the-badge&logo=webrtc&logoColor=white" alt="Multimodal" />
  <img src="https://img.shields.io/badge/React_19-TypeScript-3178C6?style=for-the-badge&logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/License-MIT-818CF8?style=for-the-badge" alt="MIT License" />
</p>

# gemini-live-vision-copilot

A real-time **Multimodal Voice + Vision Copilot** built with **React 19**, **TypeScript**, and the **Gemini Live API** (`@google/genai`). It streams **16kHz PCM voice** alongside **1 FPS JPEG screen-share or camera frames** over a single stateful WebSocket—featuring **Voice-Gated Video Sampling** to cut idle video token costs and instant 24kHz audio **barge-in**.

---

## Why Voice-Gated 1 FPS Streaming Matters

<p align="center">
  <img src="./assets/video-token-optimization.svg" alt="Voice-Gated Video Token Optimization" width="100%" />
</p>

---

## Multimodal Pipeline

```mermaid
flowchart LR
    Mic["Mic AudioWorklet 16kHz"] -->|"realtimeInput audio"| Live["Gemini 3.8 Live WSS"]
    Screen["Screen Share or Camera"] -->|"Canvas 1 FPS JPEG"| Gate{"Voice Activity Gate"}
    Gate -->|"Active Speech"| Live
    Gate -->|"Silent Idle"| Skip["Skip Frame to Save Tokens"]
    Live -->|"24kHz PCM + Transcript"| Out["PcmPlayer24k + Barge-In"]
```

---

## Quick Start

```bash
git clone https://github.com/stephanocamoretti-dotcom/gemini-live-vision-copilot.git
cd gemini-live-vision-copilot
npm install
cp .env.example .env
# Add your VITE_GEMINI_API_KEY
npm run dev
```

---

## Scaling Ideas for Production

1. **Ephemeral Tokens**: Mint short-lived Live API tokens on your backend before connecting from client browsers.
2. **Adaptive `mediaResolution`**: Dynamically lower `mediaResolution` for ambient camera monitoring and boost it when the user asks to read small UI text or code.
3. **Async UI Tool Execution**: Pair visual inspection with `NON_BLOCKING` function calling so the copilot can open tickets, annotate screenshots, or trigger workflows mid-conversation.

---

## References

- [Gemini Live API Overview — Google AI for Developers](https://ai.google.dev/gemini-api/docs/live)
- [Live API Capabilities Guide (1 FPS Video, Turn Coverage, Media Resolution)](https://aistudio.google.com/docs/live-api/capabilities)
- [Get Started with Gemini Live API (`@google/genai`)](https://aistudio.google.com/docs/live-api/get-started-sdk)
