"use client";

interface MessageBubbleProps {
  role: "user" | "assistant" | "system";
  content: string;
  modelName?: string;
  isStreaming?: boolean;
}

export default function MessageBubble({
  role,
  content,
  modelName = "UNKNOWN",
  isStreaming = false,
}: MessageBubbleProps) {
  const isUser = role === "user";
  const isSystem = role === "system";

  return (
    <div
      className="animate-slide-in"
      style={{
        border: "2px solid var(--border)",
        padding: "14px",
        background: isSystem ? "var(--fg)" : "var(--bg)",
        color: isSystem ? "var(--bg)" : "var(--fg)",
        maxWidth: isSystem ? "100%" : "82%",
        alignSelf: isUser ? "flex-end" : "flex-start",
        boxShadow: isUser
          ? "6px 6px 0 0 var(--border)"
          : isSystem
          ? "none"
          : "-6px 6px 0 0 var(--border)",
        marginLeft: isUser ? "auto" : 0,
        marginRight: isUser ? 0 : "auto",
      }}
    >
      <div
        style={{
          fontSize: "10px",
          fontWeight: 700,
          textTransform: "uppercase",
          marginBottom: "8px",
          borderBottom: `1px solid ${isSystem ? "var(--bg)" : "var(--border)"}`,
          paddingBottom: "4px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>
          {isUser ? "USER" : isSystem ? "SYSTEM" : "AI"} //{" "}
          {isUser ? "YOU" : modelName}
        </span>
        {isStreaming && (
          <span className="animate-blink" style={{ fontSize: "14px", lineHeight: 1 }}>
            █
          </span>
        )}
      </div>
      <div
        style={{
          fontSize: "13px",
          lineHeight: 1.6,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {content}
      </div>
    </div>
  );
}
