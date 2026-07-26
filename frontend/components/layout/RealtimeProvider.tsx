"use client";

import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { useRealtime } from "@/hooks/useRealtime";
import type { Alert } from "@/types";

interface RealtimeContextValue {
  alerts: Alert[];
  isConnected: boolean;
  retryCount: number;
}

const RealtimeContext = createContext<RealtimeContextValue>({
  alerts: [],
  isConnected: false,
  retryCount: 0,
});

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const value = useRealtime();
  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtimeContext(): RealtimeContextValue {
  return useContext(RealtimeContext);
}
