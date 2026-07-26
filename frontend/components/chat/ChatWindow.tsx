"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Trash2, MessageSquare, Send } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { t, useLocale } from "@/lib/i18n";
import api from "@/lib/api";
import MessageBubble from "./MessageBubble";
import VoiceButton from "./VoiceButton";
import ExportButton from "@/components/shared/ExportButton";

export default function ChatWindow() {
  const { messages, isStreaming, sendMessage, clearHistory } = useChat();
  const { locale } = useLocale();
  const [input, setInput] = useState("");
  const [latestSessionId, setLatestSessionId] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch latest chat session on mount
  useEffect(() => {
    api
      .get<Array<{ id: number }>>("/api/chat/sessions", { params: { limit: 1 } })
      .then((res) => {
        if (res.data.length > 0) setLatestSessionId(res.data[res.data.length - 1].id);
      })
      .catch(() => { /* ignore */ });
  }, []);

  // Auto-scroll when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const resizeTextarea = (el: HTMLTextAreaElement) => {
    el.style.height = "40px";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  const handleSubmit = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    sendMessage(trimmed, locale);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "40px";
    }
  }, [input, isStreaming, sendMessage, locale]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    resizeTextarea(e.target);
  };

  const handleVoiceTranscript = (text: string) => {
    setInput(text);
    // Resize after state settles
    requestAnimationFrame(() => {
      if (textareaRef.current) resizeTextarea(textareaRef.current);
    });
  };

  const langLabel = locale === "kn" ? "KN" : "EN";

  return (
    <div className="flex flex-col h-full rounded-lg border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="text-sm font-medium">AI Chat</span>
        <div className="flex items-center gap-3">
          <span className="text-xs rounded-full px-2 py-0.5 border border-border text-muted-foreground">
            {langLabel}
          </span>
          {latestSessionId != null && (
            <ExportButton
              endpoint={`/api/export/chat/${latestSessionId}`}
              label={t("chat.export", locale)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            />
          )}
          <button
            onClick={clearHistory}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 size={13} />
            Clear
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-muted-foreground">
            <MessageSquare size={32} strokeWidth={1.5} />
            <span className="text-sm">{t("chat.empty", locale)}</span>
          </div>
        ) : (
          messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="px-4 py-3 border-t border-border flex gap-2 items-end">
        <VoiceButton
          onTranscript={handleVoiceTranscript}
          disabled={isStreaming}
        />
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={isStreaming}
          placeholder={t("chat.placeholder", locale)}
          rows={1}
          className="flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring min-h-[40px] max-h-[120px] disabled:opacity-50"
          style={{ height: "40px" }}
        />
        <button
          onClick={handleSubmit}
          disabled={isStreaming || !input.trim()}
          className="rounded-md bg-primary p-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
