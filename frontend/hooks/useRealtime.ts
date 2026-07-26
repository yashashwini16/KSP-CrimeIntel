"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Alert } from "@/types";

export const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 5_000;

// ── Testable reconnect controller ────────────────────────────────────────────

export interface ReconnectController {
  readonly count: number;
  canRetry(): boolean;
  increment(): void;
  reset(): void;
}

export function createReconnectController(
  maxRetries: number = MAX_RETRIES,
): ReconnectController {
  let _count = 0;
  return {
    get count() { return _count; },
    canRetry() { return _count < maxRetries; },
    increment() { if (_count < maxRetries) _count++; },
    reset() { _count = 0; },
  };
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useRealtime() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const esRef = useRef<EventSource | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ctrlRef = useRef(createReconnectController());

  const connect = useCallback(() => {
    const endpoint = process.env.NEXT_PUBLIC_SIGNALS_ENDPOINT;
    if (!endpoint || typeof window === "undefined") return;
    if (!ctrlRef.current.canRetry() && ctrlRef.current.count > 0) return;

    const es = new EventSource(endpoint, { withCredentials: true });
    esRef.current = es;

    es.onopen = () => {
      ctrlRef.current.reset();
      setIsConnected(true);
      setRetryCount(0);
    };

    es.onmessage = (event: MessageEvent) => {
      try {
        const alert = JSON.parse(event.data as string) as Alert;
        setAlerts((prev) => [alert, ...prev]);
      } catch { /* malformed frame — skip */ }
    };

    es.onerror = () => {
      es.close();
      setIsConnected(false);
      if (ctrlRef.current.canRetry()) {
        ctrlRef.current.increment();
        setRetryCount(ctrlRef.current.count);
        timerRef.current = setTimeout(connect, RETRY_DELAY_MS);
      }
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      esRef.current?.close();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [connect]);

  return { alerts, isConnected, retryCount };
}
