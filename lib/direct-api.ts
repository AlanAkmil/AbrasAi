"use client";

import { clientObfuscate, clientSignRequest, clientMakeUuid, Message } from "./mimo";

export async function directChatStream(
  model: string,
  messages: Message[],
  prompt: string,
  onChunk: (text: string) => void
): Promise<void> {
  const currentTime = Date.now();
  const installedTime = currentTime - 86400000;
  const conversationHistory = [...messages];
  if (prompt) conversationHistory.push({ role: "user", content: prompt });
  const characterCount = conversationHistory.reduce((t, m) => t + (m.content?.length || 0), 0);

  const randHex = (len: number) =>
    Array.from(crypto.getRandomValues(new Uint8Array(len)), (b) =>
      b.toString(16).padStart(2, "0")
    ).join("");

  const payload = {
    package: clientObfuscate("info.camposha.mimo"),
    uuid: clientObfuscate(clientMakeUuid(installedTime, "full_edition")),
    edition: clientObfuscate("full_edition"),
    subscription: clientObfuscate("monthly"),
    order_id: "GPA.3312-4567-8901-23456",
    last_purchase_date: "2026-08-01",
    ai_model: clientObfuscate(model),
    messages: conversationHistory,
    token_usage: 0,
    thread_char_count: characterCount,
    is_premium: true,
    current_language: clientObfuscate("in"),
    app_version: clientObfuscate("3"),
    request_date: clientObfuscate(new Date().toISOString().split("T")[0]),
    request_time: currentTime,
    first_install: installedTime,
    version: clientObfuscate("android__14__API__34)"),
    session_requests: 1,
    current_session_ads: 0,
    android_id: clientObfuscate(randHex(8)),
    hw_fp: clientObfuscate(randHex(16)),
    is_rooted: false,
    is_emulator: false,
    tz: clientObfuscate("Asia/Jakarta"),
    currency: clientObfuscate("IDR"),
    country: clientObfuscate("ID"),
    gpa_id: "GPA.3312-4567-8901-23456",
    extra: "",
  };

  const payloadJsonStr = JSON.stringify(payload);
  const timestampStr = String(currentTime);
  const signature = await clientSignRequest(payloadJsonStr, timestampStr);

  const res = await fetch("https://aiv1.clemy.top/chat-completion-stream", {
    method: "POST",
    headers: {
      Accept: "text/event-stream",
      "Content-Type": "application/json; charset=utf-8",
      "X-Signature": signature,
      "X-Timestamp": timestampStr,
      "User-Agent": "Neo/1.0",
    },
    body: payloadJsonStr,
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
