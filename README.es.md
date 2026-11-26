<p align="right">
  <a href="./README.md">🇺🇸 Read in English</a>
</p>

<p align="center">
  <img src="./assets/banner.svg" alt="Banner de Gemini Live Vision Copilot" width="100%" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Gemini_Live_API-3.8_Live-38BDF8?style=for-the-badge&logo=google&logoColor=white" alt="Gemini Live API" />
  <img src="https://img.shields.io/badge/Multimodal-1FPS_Vision_+_PCM-34D399?style=for-the-badge&logo=webrtc&logoColor=white" alt="Multimodal" />
  <img src="https://img.shields.io/badge/React_19-TypeScript-3178C6?style=for-the-badge&logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/License-MIT-818CF8?style=for-the-badge" alt="Licencia MIT" />
</p>

# gemini-live-vision-copilot

Copiloto **Multimodal de Voz + Visión en tiempo real** construido con **React 19**, **TypeScript** y la **Gemini Live API** (`@google/genai`). Transmite **voz PCM a 16 kHz** junto con **frames JPEG de pantalla o cámara a 1 FPS** sobre un único WebSocket con estado, incorporando **muestreo de video activado por voz (*Voice-Gated*)** para ahorrar tokens en silencios y **barge-in** instantáneo a 24 kHz.

---

## Por qué importa el muestreo activado por voz

<p align="center">
  <img src="./assets/video-token-optimization.svg" alt="Optimización de tokens de video" width="100%" />
</p>

---

## Flujo Multimodal

```mermaid
flowchart LR
    Mic["Micrófono AudioWorklet 16kHz"] -->|"realtimeInput audio"| Live["Gemini 3.8 Live WSS"]
    Screen["Pantalla compartida o Cámara"] -->|"Canvas 1 FPS JPEG"| Gate{"Puerta de Actividad de Voz"}
    Gate -->|"Voz Activa"| Live
    Gate -->|"Silencio"| Skip["Omitir Frame para Ahorrar Tokens"]
    Live -->|"PCM 24kHz + Transcripción"| Out["PcmPlayer24k + Barge-In"]
```

---

## Inicio rápido

```bash
git clone https://github.com/stephanocamoretti-dotcom/gemini-live-vision-copilot.git
cd gemini-live-vision-copilot
npm install
cp .env.example .env
# Agrega tu VITE_GEMINI_API_KEY
npm run dev
```

---

## Ideas de escalado para producción

1. **Tokens Efímeros**: Genera tokens de corta duración en tu backend antes de abrir sesiones Live desde el navegador.
2. **`mediaResolution` adaptativa**: Reduce la resolución en monitoreo ambiental y súbela cuando el usuario pida leer texto pequeño o código en pantalla.
3. **Tool Calling asíncrono**: Combina la inspección visual con funciones `NON_BLOCKING` para crear tickets o disparar flujos CRM mientras el copiloto sigue hablando.

---

## Referencias

- [Resumen de Gemini Live API — Google AI for Developers](https://ai.google.dev/gemini-api/docs/live)
- [Guía de capacidades de Live API (Video 1 FPS, Turn Coverage, Media Resolution)](https://aistudio.google.com/docs/live-api/capabilities)
- [Inicio rápido con Gemini Live API (`@google/genai`)](https://aistudio.google.com/docs/live-api/get-started-sdk)
