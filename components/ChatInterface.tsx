"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import MessageBubble from "./MessageBubble";
import StatusBar from "./StatusBar";
import ModelSelector from "./ModelSelector";
import { directChatStream } from "@/lib/direct-api";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

type Mode = "proxy" | "direct" | "mock";

const MODEL_MAP: Record<string, string> = {
  "xiaomi/mimo-v2.5": "MiMo V2.5",
  "xiaomi/mimo-v2-flash": "MiMo V2 Flash",
  "xiaomi/mimo-v2.5-pro": "MiMo V2.5 Pro",
  "deepseek/deepseek-v4-flash": "DeepSeek v4 Flash",
  "deepseek/deepseek-v4-pro": "DeepSeek v4 Pro",
  "deepseek/deepseek-v3.2": "DeepSeek v3.2",
  "deepseek/deepseek-v3.2-speciale": "DeepSeek v3.2 Speciale",
  "deepseek/deepseek-v3.2-exp": "DeepSeek v3.2 Exp",
  "deepseek/deepseek-v3.1-terminus": "DeepSeek v3.1 Terminus",
  "deepseek/deepseek-chat-v3.1": "DeepSeek v3.1 Chat",
  "google/gemini-2.5-flash-lite": "Gemini 2.5 Flash Lite",
  "google/gemini-3.1-flash-lite-preview": "Gemini 3.1 Flash Lite",
  "google/gemma-4-26b-a4b-it": "Gemma 4 26B",
  "google/gemma-4-31b-it": "Gemma 4 31B",
  "google/gemma-3-27b-it": "Gemma 3 27B",
  "google/gemma-3-12b-it": "Gemma 3 12B",
  "openai/gpt-5.4-nano": "GPT-5.4 Nano",
  "openai/gpt-5-nano": "GPT-5 Nano",
  "openai/gpt-4.1-nano": "GPT-4.1 Nano",
  "openai/gpt-oss-120b": "GPT OSS 120B",
  "openai/gpt-oss-20b": "GPT OSS 20B",
  "z-ai/glm-4.7-flash": "GLM 4.7 Flash",
  "z-ai/glm-4.7": "GLM 4.7",
  "z-ai/glm-4.6": "GLM 4.6",
  "z-ai/glm-4.5": "GLM 4.5",
  "minimax/minimax-m3": "MiniMax M3",
  "minimax/minimax-m2.7": "MiniMax M2.7",
  "minimax/minimax-m2.5": "MiniMax M2.5",
  "minimax/minimax-m2.1": "MiniMax M2.1",
  "minimax/minimax-m2-her": "MiniMax M2-her",
  "minimax/minimax-m2": "MiniMax M2",
  "ibm-granite/granite-4.1-8b": "Granite 4.1 8B",
  "ibm-granite/granite-4.0-h-micro": "Granite 4 Micro",
  "inclusionai/ling-2.6-flash": "Ling 2.6 Flash",
  "inclusionai/ring-2.6-1t": "Ring 2.6 1T",
  "tencent/hy3-preview": "Hy3 Preview",
  "tencent/hunyuan-a13b-instruct": "Hunyuan A13B Instruct",
  "qwen/qwen3.6-35b-a3b": "Qwen3.6 35B",
  "stepfun/step-3.7-flash": "Step 3.7 Flash",
  "baidu/ernie-4.5-21b-a3b": "ERNIE-4.5 21B",
  "alibaba/tongyi-deepresearch-30b-a3b": "Tongyi Deep Research 30B",
  "meituan/longcat-flash-chat": "Longcat Flash Chat",
  "bytedance-seed/seed-2.0-mini": "Seed 2.0 mini",
  "mistralai/mistral-small-2603": "Mistral 4 Small",
  "rekaai/reka-edge": "Reka Edge",
  "inception/mercury-2": "Mercury 2",
};

const MOCK_RESPONSES = [
  "Saya adalah asisten AI yang dikembangkan oleh tim MIMO. Saya dirancang untuk membantu Anda dengan berbagai tugas mulai dari menjawab pertanyaan, menulis kode, hingga analisis data.",
  "XOR encryption dengan HMAC-SHA256 signing merupakan metode yang cukup unik untuk obfuscasi payload. Meskipun bukan enkripsi standar industri, ini efektif untuk menghindari deteksi sederhana.",
  "Model MiMo V2.5 Pro menawarkan performa yang optimal untuk bahasa Indonesia dengan latensi rendah. DeepSeek v4 Pro lebih unggul dalam reasoning kompleks.",
  "Streaming SSE (Server-Sent Events) memungkinkan delivery real-time dari token-token yang dihasilkan model, memberikan pengalaman interaktif yang responsif kepada pengguna.",
];

function getMockResponse(prompt: string): string {
  const lower = prompt.toLowerCase();
  if (lower.includes("halo") || lower.includes("hai")) {
    return "Halo! Saya MIMO AI. Saya siap membantu dengan berbagai pertanyaan dan tugas. Model aktif saat ini adalah " + (MODEL_MAP["xiaomi/mimo-v2.5-pro"] || "Unknown") + ".";
  }
  if (lower.includes("enkripsi") || lower.includes("encrypt") || lower.includes("xor")) {
    return "Sistem ini menggunakan XOR cipher dengan kunci rahasia untuk obfuscasi payload, ditambah HMAC-SHA256 untuk verifikasi integritas request.";
  }
  if (lower.includes("model") || lower.includes("pilih")) {
    return "Terdapat 40+ model yang tersedia di registry MIMO AI, meliputi Xiaomi MiMo, DeepSeek, Google Gemini/Gemma, OpenAI GPT, Z.AI GLM, MiniMax, IBM Granite, Tencent, Qwen, StepFun, Baidu ERNIE, Alibaba Tongyi, dan banyak lagi.";
  }
  if (lower.includes("kode") || lower.includes("code") || lower.includes("program")) {
    return "Saya dapat membantu menulis, meninjau, dan men-debug kode dalam berbagai bahasa pemrograman. Implementasi client MimoAI menggunakan Node.js dengan axios untuk HTTP request dan crypto untuk operasi kriptografi.";
  }
  return MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
}

function simulateMockStream(
  text: string,
  onChunk: (chunk: string) => void,
  onDone: () => void
) {
  let index = 0;
  const interval = setInterval(() => {
    const size = Math.floor(Math.random() * 3) + 1;
    const chunk = text.slice(index, index + size);
    index += size;
    if (chunk) onChunk(chunk);
    if (index >= text.length) {
      clearInterval(interval);
      onDone();
    }
  }, 25 + Math.random() * 35);
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content:
        "Selamat datang di MIMO AI Brutalist Interface. Pilih model dari dropdown, pilih mode (PROXY / DIRECT / MOCK), ketik pesan, dan tekan ENTER.",
    },
  ]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState("xiaomi/mimo-v2.5-pro");
  const [mode, setMode] = useState<Mode>("proxy");
  const [isStreaming, setIsStreaming] = useState(false);
  const [status, setStatus] = useState<"online" | "streaming" | "error">("online");
  const [tokenCount, setTokenCount] = useState(0);
  const chatRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleProxySend = async (text: string) => {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: text,
        messages: messages.filter((m) => m.role !== "system"),
        model,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Request failed" }));
      const errMsg = err.detail === "CLOUDFLARE_BLOCKED"
        ? "[CLOUDFLARE BLOCK] Server Vercel di-block oleh API. Coba ganti ke DIRECT MODE."
        : err.error || "Unknown error";
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = { role: "assistant", content: `ERROR: ${errMsg}` };
        return copy;
      });
      setStatus("error");
      setIsStreaming(false);
      return;
    }

    const reader = res.body?.getReader();
    if (!reader) {
      setStatus("error");
      setIsStreaming(false);
      return;
    }

    let accumulated = "";
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data: ")) continue;
        const dataStr = trimmed.substring(6).trim();
        if (dataStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(dataStr);
          if (parsed.chunk) {
            accumulated += parsed.chunk;
            setTokenCount((t) => t + parsed.chunk.length);
            setMessages((prev) => {
              const copy = [...prev];
              copy[copy.length - 1] = { role: "assistant", content: accumulated };
              return copy;
            });
          }
        } catch {}
      }
    }
    setStatus("online");
  };

  const handleDirectSend = async (text: string) => {
    let accumulated = "";
    await directChatStream(
      model,
      messages.filter((m) => m.role !== "system"),
      text,
      (chunk) => {
        accumulated += chunk;
        setTokenCount((t) => t + chunk.length);
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: accumulated };
          return copy;
        });
      }
    );
    setStatus("online");
  };

  const handleMockSend = (text: string) => {
    const responseText = getMockResponse(text);
    let accumulated = "";
    simulateMockStream(
      responseText,
      (chunk) => {
        accumulated += chunk;
        setTokenCount((t) => t + chunk.length);
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: accumulated };
          return copy;
        });
      },
      () => {
        setStatus("online");
        setIsStreaming(false);
      }
    );
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    setInput("");
    setIsStreaming(true);
    setStatus("streaming");

    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);

    const aiPlaceholder: Message = { role: "assistant", content: "" };
    setMessages((prev) => [...prev, aiPlaceholder]);

    try {
      if (mode === "proxy") {
        await handleProxySend(text);
      } else if (mode === "direct") {
        await handleDirectSend(text);
      } else {
        handleMockSend(text);
        return; // mock handles its own cleanup
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Network failure";
      const display = msg === "CLOUDFLARE_BLOCKED"
        ? "[CLOUDFLARE BLOCK] Request dari browser juga di-block. Coba MOCK MODE untuk test UI."
        : msg;
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = { role: "assistant", content: `ERROR: ${display}` };
        return copy;
      });
      setStatus("error");
    } finally {
      if (mode !== "mock") setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const modelName = MODEL_MAP[model] || model;

  return (
    <div
      style={{
        border: "3px solid var(--border)",
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          borderBottom: "3px solid var(--border)",
          padding: "14px 18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "16px",
              height: "16px",
              background: "var(--fg)",
              border: "2px solid var(--fg)",
            }}
          />
          <h1
            style={{
              margin: 0,
              fontSize: "20px",
              fontWeight: 700,
              letterSpacing: "-0.5px",
              textTransform: "uppercase",
            }}
          >
            MIMO_AI_V1.0
          </h1>
          <span
            style={{
              fontSize: "10px",
              border: "2px solid var(--fg)",
              padding: "2px 8px",
              background: "var(--fg)",
              color: "var(--bg)",
              fontWeight: 700,
            }}
          >
            BETA
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <ModelSelector selected={model} onChange={setModel} />
          {/* MODE TOGGLE */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <label style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase" }}>Mode:</label>
            <select
              className="brutal-select"
              value={mode}
              onChange={(e) => setMode(e.target.value as Mode)}
              style={{ minWidth: "100px", fontSize: "10px" }}
            >
              <option value="proxy">PROXY</option>
              <option value="direct">DIRECT</option>
              <option value="mock">MOCK</option>
            </select>
          </div>
        </div>
      </div>

      {/* MODE INFO BAR */}
      <div
        style={{
          borderBottom: "1px solid var(--border)",
          padding: "6px 18px",
          fontSize: "10px",
          fontWeight: 700,
          textTransform: "uppercase",
          background:
            mode === "proxy"
              ? "rgba(0,102,255,0.08)"
              : mode === "direct"
              ? "rgba(255,42,42,0.08)"
              : "rgba(17,17,17,0.06)",
          color: "var(--muted)",
        }}
      >
        {mode === "proxy"
          ? "PROXY MODE: Request lewat server Vercel (bisa kena Cloudflare block)"
          : mode === "direct"
          ? "DIRECT MODE: Request langsung dari browser (bypass IP block)"
          : "MOCK MODE: Simulasi response lokal (no API call)"}
      </div>

      {/* STATUS BAR */}
      <StatusBar
        status={status}
        modelName={modelName}
        tokenCount={tokenCount}
        msgCount={messages.filter((m) => m.role !== "system").length}
      />

      {/* CHAT AREA */}
      <div
        ref={chatRef}
        style={{
          height: "460px",
          overflowY: "auto",
          padding: "18px",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          background: "rgba(17,17,17,0.02)",
          scrollBehavior: "smooth",
        }}
      >
        {messages.map((msg, i) => (
          <MessageBubble
            key={i}
            role={msg.role}
            content={msg.content}
            modelName={modelName}
            isStreaming={msg.role === "assistant" && isStreaming && i === messages.length - 1}
          />
        ))}
      </div>

      {/* INPUT AREA */}
      <div
        style={{
          borderTop: "3px solid var(--border)",
          padding: "14px 18px",
          display: "flex",
          gap: "10px",
          background: "var(--bg)",
        }}
      >
        <textarea
          className="brutal-input"
          placeholder="KETIK PESAN ANDA..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isStreaming}
          style={{ flex: 1, minHeight: "56px" }}
        />
        <button
          className="brutal-btn"
          onClick={handleSend}
          disabled={isStreaming || !input.trim()}
          style={{ alignSelf: "flex-end", height: "56px" }}
        >
          SEND_&gt;
        </button>
      </div>
    </div>
  );
}
