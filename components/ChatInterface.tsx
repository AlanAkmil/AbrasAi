"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import MessageBubble from "./MessageBubble";
import StatusBar from "./StatusBar";
import ModelSelector from "./ModelSelector";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

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

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content:
        "Selamat datang di MIMO AI Brutalist Interface. Pilih model dari dropdown, ketik pesan, dan tekan ENTER. Semua request dienkripsi XOR + HMAC-SHA256.",
    },
  ]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState("xiaomi/mimo-v2.5-pro");
  const [isStreaming, setIsStreaming] = useState(false);
  const [status, setStatus] = useState<"online" | "streaming" | "error">("online");
  const [tokenCount, setTokenCount] = useState(0);
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

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
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = {
            role: "assistant",
            content: `ERROR: ${err.error || "Unknown error"}`,
          };
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
                copy[copy.length - 1] = {
                  role: "assistant",
                  content: accumulated,
                };
                return copy;
              });
            }
            if (parsed.error) {
              setStatus("error");
            }
          } catch {
            // ignore
          }
        }
      }

      setStatus("online");
    } catch (e) {
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          role: "assistant",
          content: `ERROR: ${e instanceof Error ? e.message : "Network failure"}`,
        };
        return copy;
      });
      setStatus("error");
    } finally {
      setIsStreaming(false);
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
        <ModelSelector selected={model} onChange={setModel} />
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
          ref={inputRef}
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
