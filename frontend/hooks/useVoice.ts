"use client";

import { useCallback, useRef, useState } from "react";

interface VoiceState {
  isListening: boolean;
  transcript: string;
  error: string | null;
}

// Minimal Web Speech API type declarations (not yet in lib.dom.d.ts universally)
declare global {
  interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
  }
  interface SpeechRecognitionResult {
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
    readonly isFinal: boolean;
  }
  interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
  }
  interface SpeechRecognitionEvent extends Event {
    readonly results: SpeechRecognitionResultList;
    readonly resultIndex: number;
  }
  interface SpeechRecognition extends EventTarget {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: Event) => void) | null;
    start(): void;
    stop(): void;
    abort(): void;
  }
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

export function useVoice(locale?: string) {
  const [state, setState] = useState<VoiceState>({
    isListening: false,
    transcript: "",
    error: null,
  });

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const sttEndpoint = process.env.NEXT_PUBLIC_ZIA_STT_ENDPOINT;

  const setPartial = (partial: Partial<VoiceState>) =>
    setState((prev) => ({ ...prev, ...partial }));

  const sendToZia = useCallback(
    async (blob: Blob): Promise<void> => {
      if (!sttEndpoint) {
        // Fallback: browser Web Speech API
        useBrowserSTT(setPartial, locale);
        return;
      }
      try {
        const form = new FormData();
        form.append("audio", blob, "recording.webm");
        const res = await fetch(sttEndpoint, { method: "POST", body: form });
        if (!res.ok) throw new Error(`Zia STT ${res.status}`);
        const json = (await res.json()) as {
          transcript?: string;
          text?: string;
        };
        setPartial({ transcript: json.transcript ?? json.text ?? "" });
      } catch {
        setPartial({ error: "Speech recognition failed. Please try again." });
      }
    },
    [sttEndpoint, locale],
  );

  const startListening = useCallback(async (): Promise<void> => {
    if (typeof window === "undefined") return;
    setPartial({ isListening: true, error: null, transcript: "" });
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setPartial({ isListening: false });
        await sendToZia(blob);
      };

      recorder.start();
    } catch {
      setPartial({ isListening: false, error: "Microphone access denied." });
    }
  }, [sendToZia]);

  const stopListening = useCallback((): void => {
    recorderRef.current?.stop();
    setPartial({ isListening: false });
  }, []);

  return {
    isListening: state.isListening,
    transcript: state.transcript,
    error: state.error,
    startListening,
    stopListening,
  };
}

// ── Browser STT fallback ─────────────────────────────────────────────────────

// Simple mapping of locales to BCP 47 codes
function useBrowserSTT(set: (p: Partial<VoiceState>) => void, locale?: string): void {
  if (typeof window === "undefined") return;
  const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
  if (!Ctor) {
    set({
      error: "Speech recognition not supported in this browser.",
      isListening: false,
    });
    return;
  }
  const recognition = new Ctor();
  recognition.lang = locale === "kn" ? "kn-IN" : "en-IN";
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.onresult = (e: SpeechRecognitionEvent) => {
    set({ transcript: e.results[0][0].transcript, isListening: false });
  };
  recognition.onerror = () => {
    set({
      error: "Speech recognition failed. Please try again.",
      isListening: false,
    });
  };
  recognition.start();
}
