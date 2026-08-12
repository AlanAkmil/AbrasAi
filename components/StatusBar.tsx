"use client";

interface StatusBarProps {
  status: "online" | "streaming" | "error";
  modelName: string;
  tokenCount: number;
  msgCount: number;
}

export default function StatusBar({ status, modelName, tokenCount, msgCount }: StatusBarProps) {
  const statusColor =
    status === "online"
      ? "#00aa44"
      : status === "streaming"
      ? "#ff8800"
      : "#ff2a2a";

  return (
    <div
      style={{
        borderBottom: "2px solid var(--border)",
        padding: "8px 16px",
        display: "flex",
        gap: "28px",
        fontSize: "11px",
        fontWeight: 700,
        textTransform: "uppercase",
        background: "rgba(17,17,17,0.04)",
        flexWrap: "wrap",
      }}
    >
      <span>
        Status:{" "}
        <span style={{ color: statusColor }}>
          {status === "online" ? "ONLINE" : status === "streaming" ? "STREAMING..." : "ERROR"}
        </span>
      </span>
      <span>
        Model:{" "}
        <span style={{ color: "var(--fg)" }}>{modelName}</span>
      </span>
      <span>
        Tokens:{" "}
        <span style={{ color: "var(--fg)" }}>{tokenCount}</span>
      </span>
      <span>
        Msg:{" "}
        <span style={{ color: "var(--fg)" }}>{msgCount}</span>
      </span>
    </div>
  );
}
