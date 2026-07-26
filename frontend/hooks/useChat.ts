"use client";

import { useCallback, useRef, useState } from "react";
import type { ChatMessage, Locale } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ── Pure helper — exported for property testing ────────────────────────────

export function sortMessagesByTimestamp(messages: ChatMessage[]): ChatMessage[] {
  return [...messages].sort(
    (a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  const sendMessage = useCallback(
    async (query: string, locale: Locale = "en"): Promise<void> => {
      if (!query.trim() || isStreaming) return;

      const now = new Date().toISOString();
      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content: query,
        locale,
        timestamp: now,
      };
      const assistantId = `a-${Date.now() + 1}`;
      const assistantMsg: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        locale,
        timestamp: new Date(Date.now() + 1).toISOString(),
        isLoading: true,
      };

      setMessages((prev) => sortMessagesByTimestamp([...prev, userMsg, assistantMsg]));
      setIsStreaming(true);

      try {
        const res = await api.post("/api/chat", {
          messages: [{ role: "user", content: query }],
        });
        const reply = res.data?.reply || res.data?.content || "No response.";
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: reply, isLoading: false }
              : m,
          ),
        );
      } catch (err) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: "An error occurred. Please try again.",
                  isLoading: false,
                }
              : m,
          ),
        );
      } finally {
        setIsStreaming(false);
      }
    },
    [isStreaming, messages],
  );

  const clearHistory = useCallback((): void => {
    esRef.current?.close();
    setMessages([]);
    setIsStreaming(false);
  }, []);

  return { messages, isStreaming, sendMessage, clearHistory };
}
