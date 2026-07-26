"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Alert } from "@/types";
import { useRealtimeContext } from "./RealtimeProvider";

interface Toast extends Alert {
  toastId: string;
}

const SEVERITY_BORDER: Record<Alert["severity"], string> = {
  critical: "border-l-red-500 bg-red-950/40",
  high: "border-l-orange-500 bg-orange-950/40",
  medium: "border-l-amber-500 bg-amber-950/40",
  low: "border-l-green-500 bg-green-950/40",
};

const SEVERITY_BADGE: Record<Alert["severity"], string> = {
  critical: "bg-red-500/20 text-red-400",
  high: "bg-orange-500/20 text-orange-400",
  medium: "bg-amber-500/20 text-amber-400",
  low: "bg-green-500/20 text-green-400",
};

export function AlertToast() {
  const { alerts } = useRealtimeContext();
  const shownIds = useRef<Set<number>>(new Set());
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    alerts.forEach((alert) => {
      if (shownIds.current.has(alert.id)) return;
      shownIds.current.add(alert.id);

      const toastId = `${alert.id}-${Date.now()}`;
      setToasts((prev) => [...prev, { ...alert, toastId }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.toastId !== toastId));
      }, 5000);
    });
  }, [alerts]);

  const dismiss = (toastId: string) =>
    setToasts((prev) => prev.filter((t) => t.toastId !== toastId));

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <motion.div
            key={toast.toastId}
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 80 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
              "w-72 rounded-lg border border-border border-l-4 p-3.5 shadow-lg",
              SEVERITY_BORDER[toast.severity],
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 flex-col gap-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {toast.title}
                </p>
                <span
                  className={cn(
                    "inline-flex w-fit rounded px-1.5 py-0.5 text-xs font-medium capitalize",
                    SEVERITY_BADGE[toast.severity],
                  )}
                >
                  {toast.severity}
                </span>
              </div>
              <button
                onClick={() => dismiss(toast.toastId)}
                aria-label="Dismiss alert"
                className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
