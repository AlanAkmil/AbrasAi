"use client";

import { useEffect, useState } from "react";

interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  premium: boolean;
}

interface ModelSelectorProps {
  selected: string;
  onChange: (id: string) => void;
}

export default function ModelSelector({ selected, onChange }: ModelSelectorProps) {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/models")
      .then((r) => r.json())
      .then((data) => {
        setModels(data.models || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const grouped = models.reduce<Record<string, ModelInfo[]>>((acc, m) => {
    if (!acc[m.provider]) acc[m.provider] = [];
    acc[m.provider].push(m);
    return acc;
  }, {});

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
      <label
        style={{
          fontSize: "11px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        Model:
      </label>
      <select
        className="brutal-select"
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
        style={{ minWidth: "260px" }}
      >
        {loading ? (
          <option>LOADING...</option>
        ) : (
          Object.entries(grouped).map(([provider, list]) => (
            <optgroup key={provider} label={provider.toUpperCase()}>
              {list.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} {m.premium ? "[PREM]" : "[FREE]"}
                </option>
              ))}
            </optgroup>
          )))
        }
      </select>
    </div>
  );
}
