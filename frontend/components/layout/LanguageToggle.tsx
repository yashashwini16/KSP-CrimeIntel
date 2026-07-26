"use client";

import { useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface LanguageToggleProps {
  className?: string;
}

export function LanguageToggle({ className }: LanguageToggleProps) {
  const { locale, setLocale } = useLocale();

  return (
    <button
      onClick={() => setLocale(locale === "en" ? "kn" : "en")}
      aria-label={
        locale === "en" ? "Switch to Kannada" : "ಇಂಗ್ಲಿಷ್‌ಗೆ ಬದಲಾಯಿಸಿ"
      }
      className={cn(
        "rounded-md border border-border px-2.5 py-1 text-sm font-medium",
        "text-muted-foreground hover:text-foreground hover:border-accent",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
        "transition-colors duration-150",
        className,
      )}
    >
      {locale === "en" ? "ಕನ್ನಡ" : "EN"}
    </button>
  );
}
