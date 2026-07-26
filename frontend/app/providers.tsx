"use client";

/**
 * Client-side provider tree.
 * Wrap everything that needs React context here so that layout.tsx
 * (a Server Component) stays clean.
 */

import { LocaleProvider } from "@/lib/i18n";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <LocaleProvider>{children}</LocaleProvider>;
}
