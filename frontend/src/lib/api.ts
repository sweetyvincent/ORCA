import { StreamEvent, ORCAPipelineState } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export async function fetchHealth() {
  try {
    const res = await fetch(`${API_BASE}/api/health`);
    return await res.json();
  } catch (err) {
    console.warn("Health check error:", err);
    return null;
  }
}

export async function fetchDataStatus() {
  try {
    const res = await fetch(`${API_BASE}/api/data-status`);
    return await res.json();
  } catch (err) {
    console.warn("Data status error:", err);
    return null;
  }
}

export async function fetchDataSources() {
  try {
    const res = await fetch(`${API_BASE}/api/sources`);
    return await res.json();
  } catch (err) {
    console.warn("Sources error:", err);
    return null;
  }
}

export function streamORCAQuery(
  question: string,
  callbacks: {
    onEvent: (event: StreamEvent) => void;
    onError: (err: string) => void;
    onComplete: () => void;
  }
): () => void {
  const controller = new AbortController();

  (async () => {
    try {
      const response = await fetch(`${API_BASE}/api/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error("No response body stream received.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          if (!part.trim()) continue;
          const lines = part.split("\n");
          let eventType = "message";
          let dataStr = "";

          for (const line of lines) {
            if (line.startsWith("event: ")) {
              eventType = line.replace("event: ", "").trim();
            } else if (line.startsWith("data: ")) {
              dataStr = line.replace("data: ", "").trim();
            }
          }

          if (dataStr) {
            try {
              const parsed: StreamEvent = JSON.parse(dataStr);
              callbacks.onEvent(parsed);
            } catch (pErr) {
              console.warn("Failed to parse SSE line:", dataStr, pErr);
            }
          }
        }
      }

      callbacks.onComplete();
    } catch (err: any) {
      if (err.name !== "AbortError") {
        callbacks.onError(err.message || "Streaming connection failed.");
      }
    }
  })();

  return () => {
    controller.abort();
  };
}
