import crypto from "crypto";

const ENCRYPTION_KEY_STR = "@sk=Rigel5729%2-diordnA";

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  premium: boolean;
}

export const MODEL_REGISTRY: ModelInfo[] = [
  { id: "xiaomi/mimo-v2.5", name: "MiMo V2.5", provider: "Xiaomi", premium: false },
  { id: "xiaomi/mimo-v2-flash", name: "MiMo V2 Flash", provider: "Xiaomi", premium: false },
  { id: "xiaomi/mimo-v2.5-pro", name: "MiMo V2.5 Pro", provider: "Xiaomi", premium: true },
  { id: "deepseek/deepseek-v4-flash", name: "DeepSeek v4 Flash", provider: "DeepSeek", premium: false },
  { id: "deepseek/deepseek-v4-pro", name: "DeepSeek v4 Pro", provider: "DeepSeek", premium: true },
  { id: "deepseek/deepseek-v3.2", name: "DeepSeek v3.2", provider: "DeepSeek", premium: true },
  { id: "deepseek/deepseek-v3.2-speciale", name: "DeepSeek v3.2 Speciale", provider: "DeepSeek", premium: true },
  { id: "deepseek/deepseek-v3.2-exp", name: "DeepSeek v3.2 Exp", provider: "DeepSeek", premium: true },
  { id: "deepseek/deepseek-v3.1-terminus", name: "DeepSeek v3.1 Terminus", provider: "DeepSeek", premium: true },
  { id: "deepseek/deepseek-chat-v3.1", name: "DeepSeek v3.1 Chat", provider: "DeepSeek", premium: true },
  { id: "google/gemini-2.5-flash-lite", name: "Gemini 2.5 Flash Lite", provider: "Google", premium: false },
  { id: "google/gemini-3.1-flash-lite-preview", name: "Gemini 3.1 Flash Lite", provider: "Google", premium: true },
  { id: "google/gemma-4-26b-a4b-it", name: "Gemma 4 26B", provider: "Google", premium: false },
  { id: "google/gemma-4-31b-it", name: "Gemma 4 31B", provider: "Google", premium: false },
  { id: "google/gemma-3-27b-it", name: "Gemma 3 27B", provider: "Google", premium: false },
  { id: "google/gemma-3-12b-it", name: "Gemma 3 12B", provider: "Google", premium: false },
  { id: "openai/gpt-5.4-nano", name: "GPT-5.4 Nano", provider: "OpenAI", premium: true },
  { id: "openai/gpt-5-nano", name: "GPT-5 Nano", provider: "OpenAI", premium: true },
  { id: "openai/gpt-4.1-nano", name: "GPT-4.1 Nano", provider: "OpenAI", premium: true },
  { id: "openai/gpt-oss-120b", name: "GPT OSS 120B", provider: "OpenAI", premium: false },
  { id: "openai/gpt-oss-20b", name: "GPT OSS 20B", provider: "OpenAI", premium: false },
  { id: "z-ai/glm-4.7-flash", name: "GLM 4.7 Flash", provider: "Z.AI", premium: false },
  { id: "z-ai/glm-4.7", name: "GLM 4.7", provider: "Z.AI", premium: true },
  { id: "z-ai/glm-4.6", name: "GLM 4.6", provider: "Z.AI", premium: true },
  { id: "z-ai/glm-4.5", name: "GLM 4.5", provider: "Z.AI", premium: true },
  { id: "minimax/minimax-m3", name: "MiniMax M3", provider: "MiniMax", premium: true },
  { id: "minimax/minimax-m2.7", name: "MiniMax M2.7", provider: "MiniMax", premium: true },
  { id: "minimax/minimax-m2.5", name: "MiniMax M2.5", provider: "MiniMax", premium: true },
  { id: "minimax/minimax-m2.1", name: "MiniMax M2.1", provider: "MiniMax", premium: true },
  { id: "minimax/minimax-m2-her", name: "MiniMax M2-her", provider: "MiniMax", premium: true },
  { id: "minimax/minimax-m2", name: "MiniMax M2", provider: "MiniMax", premium: true },
  { id: "ibm-granite/granite-4.1-8b", name: "Granite 4.1 8B", provider: "IBM", premium: false },
  { id: "ibm-granite/granite-4.0-h-micro", name: "Granite 4 Micro", provider: "IBM", premium: false },
  { id: "inclusionai/ling-2.6-flash", name: "Ling 2.6 Flash", provider: "InclusionAI", premium: false },
  { id: "inclusionai/ring-2.6-1t", name: "Ring 2.6 1T", provider: "InclusionAI", premium: true },
  { id: "tencent/hy3-preview", name: "Hy3 Preview", provider: "Tencent", premium: true },
  { id: "tencent/hunyuan-a13b-instruct", name: "Hunyuan A13B Instruct", provider: "Tencent", premium: true },
  { id: "qwen/qwen3.6-35b-a3b", name: "Qwen3.6 35B", provider: "Qwen", premium: true },
  { id: "stepfun/step-3.7-flash", name: "Step 3.7 Flash", provider: "StepFun", premium: true },
  { id: "baidu/ernie-4.5-21b-a3b", name: "ERNIE-4.5 21B", provider: "Baidu", premium: true },
  { id: "alibaba/tongyi-deepresearch-30b-a3b", name: "Tongyi Deep Research 30B", provider: "Alibaba", premium: true },
  { id: "meituan/longcat-flash-chat", name: "Longcat Flash Chat", provider: "Meituan", premium: true },
  { id: "bytedance-seed/seed-2.0-mini", name: "Seed 2.0 mini", provider: "ByteDance", premium: true },
  { id: "mistralai/mistral-small-2603", name: "Mistral 4 Small", provider: "MistralAI", premium: true },
  { id: "rekaai/reka-edge", name: "Reka Edge", provider: "RekaAI", premium: true },
  { id: "inception/mercury-2", name: "Mercury 2", provider: "Inception", premium: true },
];

// ===================== SERVER-SIDE CRYPTO (Node.js) =====================
export class MimoCrypto {
  static obfuscate(text: string): string {
    if (!text) return "";
    const key = Buffer.from(ENCRYPTION_KEY_STR, "utf-8");
    const input = Buffer.from(String(text), "utf-8");
    const out = Buffer.alloc(input.length);
    for (let i = 0; i < input.length; i++) {
      out[i] = input[i] ^ key[i % key.length];
    }
    return out.toString("base64") + "\n";
  }

  static signRequest(rawJson: string, timestamp: string): string {
    const key = Buffer.from(ENCRYPTION_KEY_STR, "utf-8");
    return crypto.createHmac("sha256", key).update(`${rawJson}:${timestamp}`, "utf-8").digest("base64");
  }

  static makeUuid(installTime: number, edition = "full_edition"): string {
    const bytes = crypto.randomBytes(16).toString("hex");
    const parts = [bytes.slice(0,8), bytes.slice(8,12), bytes.slice(12,16), bytes.slice(16,20), bytes.slice(20,32)];
    return `user_fi-${installTime}_uu-${parts.join("-")}_pa-mimo_ed-${edition}_apv-3_anv-android__14__API__34)`;
  }
}

// ===================== CLIENT-SIDE CRYPTO (Browser) =====================
export function clientObfuscate(text: string): string {
  if (!text) return "";
  const key = new TextEncoder().encode(ENCRYPTION_KEY_STR);
  const input = new TextEncoder().encode(String(text));
  const out = new Uint8Array(input.length);
  for (let i = 0; i < input.length; i++) {
    out[i] = input[i] ^ key[i % key.length];
  }
  let binary = "";
  for (let i = 0; i < out.length; i++) binary += String.fromCharCode(out[i]);
  return btoa(binary) + "\n";
}

export async function clientSignRequest(rawJson: string, timestamp: string): Promise<string> {
  const key = new TextEncoder().encode(ENCRYPTION_KEY_STR);
  const msg = new TextEncoder().encode(`${rawJson}:${timestamp}`);
  const cryptoKey = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, msg);
  const bytes = new Uint8Array(sig);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export function clientMakeUuid(installTime: number, edition = "full_edition"): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  const hex = Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
  const parts = [hex.slice(0,8), hex.slice(8,12), hex.slice(12,16), hex.slice(16,20), hex.slice(20,32)];
  return `user_fi-${installTime}_uu-${parts.join("-")}_pa-mimo_ed-${edition}_apv-3_anv-android__14__API__34)`;
}

export interface ChatPayload {
  package: string;
  uuid: string;
  edition: string;
  subscription: string;
  order_id: string;
  last_purchase_date: string;
  ai_model: string;
  messages: Message[];
  token_usage: number;
  thread_char_count: number;
  is_premium: boolean;
  current_language: string;
  app_version: string;
  request_date: string;
  request_time: number;
  first_install: number;
  version: string;
  session_requests: number;
  current_session_ads: number;
  android_id: string;
  hw_fp: string;
  is_rooted: boolean;
  is_emulator: boolean;
  tz: string;
  currency: string;
  country: string;
  gpa_id: string;
  extra: string;
}

export function buildPayload(
  model: string,
  messages: Message[],
  prompt?: string,
  isClient = false
): { payload: ChatPayload; jsonStr: string; timestamp: string; signature: string } {
  const currentTime = Date.now();
  const installedTime = currentTime - 86400000;
  const conversationHistory = [...messages];
  if (prompt) conversationHistory.push({ role: "user", content: prompt });
  const characterCount = conversationHistory.reduce((t, m) => t + (m.content?.length || 0), 0);

  const obf = isClient ? clientObfuscate : MimoCrypto.obfuscate;
  const sign = isClient
    ? (async (r: string, t: string) => clientSignRequest(r, t))
    : ((r: string, t: string) => MimoCrypto.signRequest(r, t));
  const makeUuid = isClient ? clientMakeUuid : MimoCrypto.makeUuid;
  const randHex = isClient
    ? () => Array.from(crypto.getRandomValues(new Uint8Array(8)), (b) => b.toString(16).padStart(2, "0")).join("")
    : () => crypto.randomBytes(8).toString("hex");
  const randHex16 = isClient
    ? () => Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, "0")).join("")
    : () => crypto.randomBytes(16).toString("hex");

  const payload: ChatPayload = {
    package: obf("info.camposha.mimo"),
    uuid: obf(makeUuid(installedTime, "full_edition")),
    edition: obf("full_edition"),
    subscription: obf("monthly"),
    order_id: "GPA.3312-4567-8901-23456",
    last_purchase_date: "2026-08-01",
    ai_model: obf(model),
    messages: conversationHistory,
    token_usage: 0,
    thread_char_count: characterCount,
    is_premium: true,
    current_language: obf("in"),
    app_version: obf("3"),
    request_date: obf(new Date().toISOString().split("T")[0]),
    request_time: currentTime,
    first_install: installedTime,
    version: obf("android__14__API__34)"),
    session_requests: 1,
    current_session_ads: 0,
    android_id: obf(randHex()),
    hw_fp: obf(randHex16()),
    is_rooted: false,
    is_emulator: false,
    tz: obf("Asia/Jakarta"),
    currency: obf("IDR"),
    country: obf("ID"),
    gpa_id: "GPA.3312-4567-8901-23456",
    extra: "",
  };

  const payloadJsonStr = JSON.stringify(payload);
  const timestampStr = String(currentTime);
  const signature = isClient ? "" : MimoCrypto.signRequest(payloadJsonStr, timestampStr);

  return { payload, jsonStr: payloadJsonStr, timestamp: timestampStr, signature };
}
