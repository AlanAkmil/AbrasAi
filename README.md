# MIMO AI — Brutalist Interface

A raw, high-contrast AI chat interface built with Next.js + the Mimo AI API.

## Features
- **40+ AI Models** — Xiaomi MiMo, DeepSeek, Google Gemini/Gemma, OpenAI GPT, Z.AI GLM, MiniMax, IBM Granite, Tencent, Qwen, StepFun, Baidu ERNIE, Alibaba Tongyi, and more.
- **3 Connection Modes** — PROXY (via Vercel), DIRECT (browser → API), MOCK (local simulation).
- **Streaming SSE** — Real-time token streaming with visible cursor.
- **XOR + HMAC-SHA256** — Payload obfuscation & request signing (server-side + client-side).
- **Brutalist UI** — Hard borders, monospace typography, zero radius, raw structure.

## Why 3 Modes?

| Mode | How it works | When to use |
|------|-------------|-------------|
| **PROXY** | Frontend → Vercel Server → Mimo API | Default. But Cloudflare may block Vercel datacenter IPs. |
| **DIRECT** | Frontend → Mimo API (bypass server) | Use when PROXY gets Cloudflare-blocked. Uses your browser IP. |
| **MOCK** | Local simulation, no API call | Use for testing UI or when API is completely down. |

## Deploy to Vercel

```bash
npm install
npm run build
```

Push to GitHub, then import to [Vercel](https://vercel.com).

## Environment Variables

No env vars required.

## Structure

```
app/
  page.tsx              — Main chat page
  layout.tsx            — Root layout + Space Mono font
  globals.css           — Brutalist design system
  api/chat/route.ts     — SSE proxy to Mimo API (with Cloudflare detection)
  api/models/route.ts   — Model registry endpoint
components/
  ChatInterface.tsx     — Chat logic + mode toggle
  MessageBubble.tsx     — Message component (error styling)
  ModelSelector.tsx     — Model dropdown
  StatusBar.tsx         — Stats bar
lib/
  mimo.ts               — MimoCrypto (Node + Browser)
  direct-api.ts         — Client-side direct fetch helper
```
