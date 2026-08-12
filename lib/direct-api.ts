"use client";

import { buildPayload, Message } from "./mimo";

export async function directChatStream(
  model: string,
  messages: Message[],
  prompt: string,
  onChunk: (text: string) => void
): Promise<void> {
  const { jsonStr, timestamp, signature } = await buildPayload(model, messages, prompt);

  const res = await fetch("https://aiv1.clemy.top/chat-completion-stream", {
    method: "POST",
    headers: {
      Accept: "text/event-stream",
      "Content-Type": "application/json; charset=utf-8",
      "X-Signature": signature,
      "X-Timestamp": timestamp,
      "User-Agent": "Neo/1.0",
    },
    body: jsonStr,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error");
    if (text.trimStart().startsWith("<") && text.includes("</html>")) {
      throw new Error("CLOUDFLARE_BLOCKED");
    }
    throw new Error(text.slice(0, 300));
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");

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
      if (trimmed.startsWith("data: ")) {
        const dataStr = trimmed.substring(6).trim();
        if (dataStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(dataStr);
          const chunk = parsed.choices?.[0]?.delta?.content;
          if (chunk) onChunk(chunk);
        } catch {}
      }
    }
  }
}
