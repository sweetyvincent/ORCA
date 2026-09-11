import { StreamEvent } from "./types";
import { executeClientORCAPipeline } from "./clientEngine";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export async function fetchHealth() {
  try {
    const res = await fetch(`${API_BASE}/api/health`, { signal: AbortSignal.timeout(1000) });
    return await res.json();
  } catch (err) {
    return { status: "online (autonomous client runtime)", service: "ORCA Marine Intelligence" };
  }
}

export async function fetchDataStatus() {
  try {
    const res = await fetch(`${API_BASE}/api/data-status`, { signal: AbortSignal.timeout(1000) });
    return await res.json();
  } catch (err) {
    return {
      sources: [
        { name: "NOAA OISST v2.1", status: "LIVE", provider: "NOAA CoastWatch ERDDAP", operational: true },
        { name: "VIIRS Ocean Colour", status: "LIVE", provider: "Copernicus / NASA VIIRS", operational: true },
        { name: "Coastal Advisories", status: "LIVE", provider: "CDPH / NOAA NCCOS", operational: true },
        { name: "AI Router & LangGraph", status: "READY", provider: "ORCA Core", operational: true }
      ]
    };
  }
}

export async function fetchDataSources() {
  try {
    const res = await fetch(`${API_BASE}/api/sources`, { signal: AbortSignal.timeout(1000) });
    return await res.json();
  } catch (err) {
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
  const isBrowser = typeof window !== "undefined";
  const isHttps = isBrowser && window.location.protocol === "https:";
  const isLocalHost = isBrowser && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  // If running on GitHub Pages (HTTPS domain) and backend is configured as insecure HTTP localhost:
  // Immediately use the client-side marine intelligence engine without waiting for timeout!
  if (isHttps && !isLocalHost && API_BASE.startsWith("http://")) {
    console.log("[ORCA] Hosted on GitHub Pages: using Autonomous Marine Intelligence Client Engine.");
    return executeClientORCAPipeline(question, callbacks);
  }

  const controller = new AbortController();
  let clientFallbackCancel: (() => void) | null = null;
  let hasReceivedData = false;

  // Strict 1.5s timeout for local backend connection before falling back to client runtime
  const timeoutId = setTimeout(() => {
    if (!hasReceivedData) {
      console.warn(`[ORCA] Backend connection timed out. Engaging client-side marine intelligence engine.`);
      try { controller.abort(); } catch (e) {}
      clientFallbackCancel = executeClientORCAPipeline(question, callbacks);
    }
  }, 1500);

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
        throw new Error(`HTTP ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No body stream");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        hasReceivedData = true;
        clearTimeout(timeoutId);

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          if (!part.trim()) continue;
          const lines = part.split("\n");
          let dataStr = "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
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
      clearTimeout(timeoutId);
      if (!hasReceivedData) {
        console.warn(`[ORCA] Remote API error (${err.message}). Running client marine intelligence engine.`);
        clientFallbackCancel = executeClientORCAPipeline(question, callbacks);
      }
    }
  })();

  return () => {
    clearTimeout(timeoutId);
    try { controller.abort(); } catch (e) {}
    if (clientFallbackCancel) {
      clientFallbackCancel();
    }
  };
}
