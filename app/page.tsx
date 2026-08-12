import ChatInterface from "@/components/ChatInterface";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "24px 16px",
        gap: "24px",
      }}
    >
      {/* MARQUEE HEADER */}
      <div
        style={{
          width: "100%",
          maxWidth: "900px",
          border: "3px solid var(--border)",
          background: "var(--fg)",
          color: "var(--bg)",
          overflow: "hidden",
          whiteSpace: "nowrap",
          padding: "10px 0",
        }}
      >
        <div
          style={{
            display: "inline-block",
            animation: "marquee 20s linear infinite",
            fontSize: "14px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            paddingLeft: "100%",
          }}
        >
          MIMO AI — BRUTALIST INTERFACE — 40+ MODELS — XOR + HMAC-SHA256 — SSE STREAMING — RAW STRUCTURE — NO POLISH —&nbsp;
          MIMO AI — BRUTALIST INTERFACE — 40+ MODELS — XOR + HMAC-SHA256 — SSE STREAMING — RAW STRUCTURE — NO POLISH —&nbsp;
        </div>
      </div>

      {/* MAIN INTERFACE */}
      <div style={{ width: "100%", maxWidth: "900px" }}>
        <ChatInterface />
      </div>

      {/* FOOTER */}
      <footer
        style={{
          width: "100%",
          maxWidth: "900px",
          borderTop: "2px solid var(--border)",
          paddingTop: "16px",
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
          fontSize: "10px",
          fontWeight: 700,
          textTransform: "uppercase",
          color: "var(--muted)",
        }}
      >
        <span>Encryption: XOR + HMAC-SHA256</span>
        <span>Protocol: SSE / Stream</span>
        <span>Region: ID-JKT</span>
        <span>Built with Next.js</span>
      </footer>
    </main>
  );
}
