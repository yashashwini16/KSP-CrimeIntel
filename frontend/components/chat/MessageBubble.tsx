"use client";

import { motion } from "framer-motion";
import type { ChatMessage } from "@/types";

interface MessageBubbleProps {
  message: ChatMessage;
}

function LoadingDots() {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          className="text-sm leading-none"
        >
          ●
        </motion.span>
      ))}
    </div>
  );
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  const timestamp = new Date(message.timestamp).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
    >
      <div
        className={
          isUser
            ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[72%] text-sm whitespace-pre-wrap"
            : "bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[72%] text-sm whitespace-pre-wrap"
        }
      >
        {message.isLoading ? <LoadingDots /> : message.content}
      </div>
      <span className="text-[10px] text-muted-foreground mt-1">{timestamp}</span>
    </motion.div>
  );
}
