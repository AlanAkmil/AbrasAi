import { NextRequest } from "next/server";
import { buildPayload, Message } from "@/lib/mimo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isHtml(text: string): boolean {
  return text.trimStart().startsWith("<") && text.includes("</html>");
}

export async function POST(req: NextRequest) {
  const { prompt, messages, model } = await req.json();

  if (!prompt) {
    return new Response(JSON.stringify({ error: "Prompt required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { jsonStr, timestamp, signature } = buildPayload(
    model || "xiaomi/mimo-v2.5-pro",
    (messages as Message[]) || [],
    prompt
  );

  let upstream: Response;
  try {
    upstream = await fetch("https://aiv1.clemy.top/chat-completion-stream", {
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
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "Network failure — API unreachable" }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!upstream.ok) {
    const errText = await upstream.text().catch(() => "Upstream error");
    if (isHtml(errText)) {
      return new Response(
        JSON.stringify({
          error:
            "Cloudflare blocked this request. The API server rejected the Vercel datacenter IP. Try switching to DIRECT MODE in the UI.",
          detail: "CLOUDFLARE_BLOCKED",
        }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }
    return new Response(
      JSON.stringify({ error: errText.slice(0, 500) }),
      { status: upstream.status, headers: { "Content-Type": "application/json" } }
    );
  }

  const encoder = new TextEncoder();
  const reader = upstream.body?.getReader();

  const stream = new ReadableStream({
    async start(controller) {
      if (!reader) { controller.close(); return; }
      try {
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += new TextDecoder().decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith("data: ")) {
              const dataStr = trimmed.substring(6).trim();
              if (dataStr === "[DONE]") {
                controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                continue;
              }
              try {
                const parsed = JSON.parse(dataStr);
                const chunk = parsed.choices?.[0]?.delta?.content;
                if (chunk) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`));
                }
              } catch {}
            }
          }
        }
        controller.close();
      } catch (e) {
        controller.error(e);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
