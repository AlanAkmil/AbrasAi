# MIMO AI — Brutalist Interface

A raw, high-contrast AI chat interface built with Next.js + the Mimo AI API.

## Features
- **40+ AI Models** — Xiaomi MiMo, DeepSeek, Google Gemini/Gemma, OpenAI GPT, Z.AI GLM, MiniMax, IBM Granite, Tencent, Qwen, StepFun, Baidu, Alibaba, and more.
- **Streaming SSE** — Real-time token streaming with visible cursor.
- **XOR + HMAC-SHA256** — Payload obfuscation & request signing (handled server-side).
- **Brutalist UI** — Hard borders, monospace typography, zero radius, raw structure.

## Deploy to Vercel

```bash
npm install
npm run build
```

Push to GitHub, then import to [Vercel](https://vercel.com).

## Environment Variables

No env vars required — the API endpoint is baked in. If you want to proxy through your own backend, edit `lib/mimo.ts`.

## Structure

```
app/
  page.tsx          — Main chat page
  layout.tsx        — Root layout + fonts
  globals.css       — Brutalist design tokens
  api/chat/route.ts — SSE proxy to Mimo API
  api/models/route.ts — Model registry endpoint
components/
  ChatInterface.tsx — Main chat logic
  ModelSelector.tsx — Model dropdown
  MessageBubble.tsx — Message component
  StatusBar.tsx     — Stats bar
lib/
  mimo.ts           — Mimo API client
```
