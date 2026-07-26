"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff } from "lucide-react";
import { useVoice } from "@/hooks/useVoice";
import { cn } from "@/lib/utils";

interface VoiceButtonProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export default function VoiceButton({ onTranscript, disabled }: VoiceButtonProps) {
  const voice = useVoice();
  const onTranscriptRef = useRef(onTranscript);

  // Keep ref current so the effect below doesn't need onTranscript in its dep array
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  });

  useEffect(() => {
    if (voice.transcript) {
      onTranscriptRef.current(voice.transcript);
      voice.stopListening();
    }
    // Only re-run when transcript changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voice.transcript]);

  const handleClick = () => {
    if (disabled) return;
    if (voice.isListening) {
      voice.stopListening();
    } else {
      voice.startListening();
    }
  };

  const ariaLabel = voice.error
    ? voice.error
    : voice.isListening
    ? "Stop listening"
    : "Start voice input";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        "rounded-full p-2 transition-colors",
        voice.isListening
          ? "bg-destructive/20 text-destructive"
          : "text-muted-foreground hover:text-foreground hover:bg-accent",
        disabled && "opacity-50 cursor-not-allowed pointer-events-none"
      )}
    >
      {voice.isListening ? (
        <motion.span
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
          className="flex items-center justify-center"
        >
          <Mic size={18} />
        </motion.span>
      ) : voice.error ? (
        <MicOff size={18} className="text-destructive" />
      ) : (
        <Mic size={18} />
      )}
    </button>
  );
}
