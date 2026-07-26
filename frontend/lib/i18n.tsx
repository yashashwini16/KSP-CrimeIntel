"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Locale } from "@/types";

// ─── Translation data ────────────────────────────────────────────────────────

export const translations = {
  en: {
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.cases": "Cases",
    "nav.map": "Crime Map",
    "nav.network": "Network",
    "nav.offenders": "Offenders",
    "nav.alerts": "Alerts",
    "nav.chat": "AI Chat",
    "nav.forecast": "Forecast",
    "nav.audit": "Audit Log",
    "nav.import": "Import Data",

    // Auth
    "auth.login": "Sign In",
    "auth.logout": "Sign Out",
    "auth.username": "Username",
    "auth.password": "Password",
    "auth.signin.title": "KSP CrimeIntel",
    "auth.signin.subtitle": "Karnataka State Police Intelligence Platform",
    "auth.invalid": "Invalid credentials. Please try again.",
    "auth.session_expired": "Your session has expired. Please sign in again.",

    // Dashboard
    "dashboard.title": "Dashboard",
    "dashboard.subtitle": "Crime intelligence overview",
    "dashboard.total_firs": "Total FIRs",
    "dashboard.open_cases": "Open Cases",
    "dashboard.high_risk": "High-Risk Offenders",
    "dashboard.active_alerts": "Active Alerts",
    "dashboard.crime_over_time": "Crime Over Time",
    "dashboard.by_type": "By Crime Type",
    "dashboard.by_district": "By District",
    "dashboard.victim_demographics": "Victim Demographics",
    "dashboard.modus_operandi": "Modus Operandi Frequency",

    // Cases / FIR
    "cases.title": "FIR Cases",
    "cases.fir_number": "FIR Number",
    "cases.date": "Date",
    "cases.crime_type": "Crime Type",
    "cases.district": "District",
    "cases.station": "Police Station",
    "cases.status": "Status",
    "cases.accused": "Accused",
    "cases.victims": "Victims",
    "cases.narrative": "Case Narrative",
    "cases.modus_operandi": "Modus Operandi",
    "cases.similar": "Similar Cases",
    "cases.timeline": "Case Timeline",
    "cases.export": "Export PDF",
    "cases.search": "Search cases…",
    "cases.no_results": "No cases match your filters.",

    // Offenders
    "offenders.title": "Offender Profiles",
    "offenders.name": "Name",
    "offenders.age": "Age",
    "offenders.gender": "Gender",
    "offenders.address": "Address",
    "offenders.phone": "Phone",
    "offenders.risk_score": "Risk Score",
    "offenders.fir_count": "FIR Count",
    "offenders.links": "Criminal Links",
    "offenders.fir_history": "FIR History",
    "offenders.export": "Export Profile",
    "offenders.filter.min_risk": "Min Risk",
    "offenders.filter.max_risk": "Max Risk",
    "offenders.no_results": "No offenders match your filters.",

    // Map
    "map.title": "Crime Hotspot Map",
    "map.play": "Play Animation",
    "map.pause": "Pause",
    "map.filter_title": "Filters",
    "map.fir_count": "FIR Count",
    "map.most_common": "Most Common Crime",
    "map.date_range": "Date Range",

    // Alerts
    "alerts.title": "Alerts",
    "alerts.severity": "Severity",
    "alerts.critical": "Critical",
    "alerts.high": "High",
    "alerts.medium": "Medium",
    "alerts.low": "Low",
    "alerts.mark_read": "Mark as read",
    "alerts.realtime": "Live",
    "alerts.connected": "Connected",
    "alerts.disconnected": "Reconnecting…",
    "alerts.empty": "No alerts at this time.",

    // Chat
    "chat.title": "AI Investigation Chat",
    "chat.placeholder": "Ask about crime patterns, suspects, districts…",
    "chat.send": "Send",
    "chat.mic": "Voice input",
    "chat.listening": "Listening…",
    "chat.thinking": "Analysing…",
    "chat.export": "Export Transcript",
    "chat.clear": "Clear history",
    "chat.language_toggle": "Kannada",
    "chat.empty": "Ask anything about the crime data.",
    "chat.ai_error": "AI service temporarily unavailable. Please try again.",

    // Forecast
    "forecast.title": "Crime Forecast",
    "forecast.subtitle": "30-day predictive model",
    "forecast.historical": "Historical",
    "forecast.predicted": "Predicted",
    "forecast.summary": "AI Forecast Summary",
    "forecast.district": "District",
    "forecast.crime_type": "Crime Type",
    "forecast.months_ahead": "Months ahead",

    // Network
    "network.title": "Criminal Network",
    "network.search": "Search offender…",
    "network.community": "Community",
    "network.degree": "Connections",
    "network.link_type": "Link Type",

    // Audit
    "audit.title": "Audit Log",
    "audit.user": "User",
    "audit.action": "Action",
    "audit.resource": "Resource",
    "audit.timestamp": "Timestamp",
    "audit.ip": "IP Address",

    // Common
    "common.search": "Search",
    "common.filter": "Filter",
    "common.export": "Export",
    "common.loading": "Loading…",
    "common.error": "Something went wrong",
    "common.retry": "Try again",
    "common.page": "Page",
    "common.of": "of",
    "common.next": "Next",
    "common.prev": "Previous",
    "common.all": "All",
    "common.open": "Open",
    "common.closed": "Closed",
    "common.pending": "Pending",
    "common.chargesheeted": "Chargesheeted",
    "common.date_from": "From",
    "common.date_to": "To",
    "common.apply": "Apply filters",
    "common.reset": "Reset",
    "common.male": "Male",
    "common.female": "Female",
    "common.view_detail": "View Details",
    "common.back": "Back",
    "common.language": "Language",
    "common.close": "Close",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.confirm": "Confirm",
    "common.unknown": "Unknown",
    "common.n_a": "N/A",
  },

  kn: {
    // Navigation
    "nav.dashboard": "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    "nav.cases": "ಪ್ರಕರಣಗಳು",
    "nav.map": "ಅಪರಾಧ ನಕ್ಷೆ",
    "nav.network": "ಅಪರಾಧಿ ಜಾಲ",
    "nav.offenders": "ಅಪರಾಧಿಗಳು",
    "nav.alerts": "ಎಚ್ಚರಿಕೆಗಳು",
    "nav.chat": "AI ಚಾಟ್",
    "nav.forecast": "ಮುನ್ಸೂಚನೆ",
    "nav.audit": "ಲೆಕ್ಕಪರಿಶೋಧನೆ",
    "nav.import": "ಡೇಟಾ ಆಮದು",

    // Auth
    "auth.login": "ಲಾಗಿನ್",
    "auth.logout": "ಲಾಗ್ ಔಟ್",
    "auth.username": "ಬಳಕೆದಾರ ಹೆಸರು",
    "auth.password": "ಪಾಸ್‌ವರ್ಡ್",
    "auth.signin.title": "KSP ಕ್ರೈಮ್‌ಇಂಟೆಲ್",
    "auth.signin.subtitle": "ಕರ್ನಾಟಕ ರಾಜ್ಯ ಪೊಲೀಸ್ ಗುಪ್ತಚರ ವ್ಯವಸ್ಥೆ",
    "auth.invalid": "ತಪ್ಪಾದ ರುಜುವಾತುಗಳು. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
    "auth.session_expired": "ನಿಮ್ಮ ಸೆಷನ್ ಅವಧಿ ಮುಗಿದಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಲಾಗಿನ್ ಮಾಡಿ.",

    // Dashboard
    "dashboard.title": "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    "dashboard.subtitle": "ಅಪರಾಧ ಗುಪ್ತಚರ ಅವಲೋಕನ",
    "dashboard.total_firs": "ಒಟ್ಟು ಎಫ್.ಐ.ಆರ್.",
    "dashboard.open_cases": "ತೆರೆದ ಪ್ರಕರಣಗಳು",
    "dashboard.high_risk": "ಹೆಚ್ಚು ಅಪಾಯದ ಅಪರಾಧಿಗಳು",
    "dashboard.active_alerts": "ಸಕ್ರಿಯ ಎಚ್ಚರಿಕೆಗಳು",
    "dashboard.crime_over_time": "ಕಾಲಾನಂತರದ ಅಪರಾಧ",
    "dashboard.by_type": "ಅಪರಾಧ ವರ್ಗದ ಪ್ರಕಾರ",
    "dashboard.by_district": "ಜಿಲ್ಲೆಯ ಪ್ರಕಾರ",
    "dashboard.victim_demographics": "ಬಲಿಪಶು ಜನಸಂಖ್ಯಾಶಾಸ್ತ್ರ",
    "dashboard.modus_operandi": "ಮೋಡಸ್ ಆಪರೆಂಡಿ ಆವರ್ತನ",

    // Cases / FIR
    "cases.title": "ಎಫ್.ಐ.ಆರ್. ಪ್ರಕರಣಗಳು",
    "cases.fir_number": "ಎಫ್.ಐ.ಆರ್. ಸಂಖ್ಯೆ",
    "cases.date": "ದಿನಾಂಕ",
    "cases.crime_type": "ಅಪರಾಧ ವರ್ಗ",
    "cases.district": "ಜಿಲ್ಲೆ",
    "cases.station": "ಪೊಲೀಸ್ ಠಾಣೆ",
    "cases.status": "ಸ್ಥಿತಿ",
    "cases.accused": "ಆರೋಪಿ",
    "cases.victims": "ಬಲಿಪಶುಗಳು",
    "cases.narrative": "ಪ್ರಕರಣ ವಿವರ",
    "cases.modus_operandi": "ಅಪರಾಧದ ವಿಧಾನ",
    "cases.similar": "ಇದೇ ರೀತಿಯ ಪ್ರಕರಣಗಳು",
    "cases.timeline": "ಪ್ರಕರಣ ಕಾಲಮಾಲಿಕೆ",
    "cases.export": "PDF ರಫ್ತು",
    "cases.search": "ಪ್ರಕರಣಗಳನ್ನು ಹುಡುಕಿ…",
    "cases.no_results": "ಯಾವುದೇ ಪ್ರಕರಣಗಳು ನಿಮ್ಮ ಫಿಲ್ಟರ್‌ಗಳಿಗೆ ಹೊಂದಿಕೆಯಾಗುವುದಿಲ್ಲ.",

    // Offenders
    "offenders.title": "ಅಪರಾಧಿ ಪ್ರೊಫೈಲ್‌ಗಳು",
    "offenders.name": "ಹೆಸರು",
    "offenders.age": "ವಯಸ್ಸು",
    "offenders.gender": "ಲಿಂಗ",
    "offenders.address": "ವಿಳಾಸ",
    "offenders.phone": "ದೂರವಾಣಿ",
    "offenders.risk_score": "ಅಪಾಯ ಸ್ಕೋರ್",
    "offenders.fir_count": "ಎಫ್.ಐ.ಆರ್. ಸಂಖ್ಯೆ",
    "offenders.links": "ಅಪರಾಧ ಸಂಪರ್ಕಗಳು",
    "offenders.fir_history": "ಎಫ್.ಐ.ಆರ್. ಇತಿಹಾಸ",
    "offenders.export": "ಪ್ರೊಫೈಲ್ ರಫ್ತು",
    "offenders.filter.min_risk": "ಕನಿಷ್ಠ ಅಪಾಯ",
    "offenders.filter.max_risk": "ಗರಿಷ್ಠ ಅಪಾಯ",
    "offenders.no_results": "ಯಾವುದೇ ಅಪರಾಧಿಗಳು ಹೊಂದಿಕೆಯಾಗುವುದಿಲ್ಲ.",

    // Map
    "map.title": "ಅಪರಾಧ ಹಾಟ್‌ಸ್ಪಾಟ್ ನಕ್ಷೆ",
    "map.play": "ಅನಿಮೇಷನ್ ಪ್ಲೇ",
    "map.pause": "ವಿರಾಮ",
    "map.filter_title": "ಫಿಲ್ಟರ್‌ಗಳು",
    "map.fir_count": "ಎಫ್.ಐ.ಆರ್. ಎಣಿಕೆ",
    "map.most_common": "ಅತಿ ಸಾಮಾನ್ಯ ಅಪರಾಧ",
    "map.date_range": "ದಿನಾಂಕ ಶ್ರೇಣಿ",

    // Alerts
    "alerts.title": "ಎಚ್ಚರಿಕೆಗಳು",
    "alerts.severity": "ತೀವ್ರತೆ",
    "alerts.critical": "ನಿರ್ಣಾಯಕ",
    "alerts.high": "ಹೆಚ್ಚಿನ",
    "alerts.medium": "ಮಧ್ಯಮ",
    "alerts.low": "ಕಡಿಮೆ",
    "alerts.mark_read": "ಓದಿದ ಎಂದು ಗುರುತಿಸಿ",
    "alerts.realtime": "ನೈಜ-ಸಮಯ",
    "alerts.connected": "ಸಂಪರ್ಕಿತ",
    "alerts.disconnected": "ಮರು-ಸಂಪರ್ಕಿಸುತ್ತಿದ್ದೇನೆ…",
    "alerts.empty": "ಈ ಸಮಯದಲ್ಲಿ ಯಾವುದೇ ಎಚ್ಚರಿಕೆಗಳಿಲ್ಲ.",

    // Chat
    "chat.title": "AI ತನಿಖಾ ಚಾಟ್",
    "chat.placeholder": "ಅಪರಾಧ ಮಾದರಿಗಳು, ಆರೋಪಿಗಳು, ಜಿಲ್ಲೆಗಳ ಬಗ್ಗೆ ಕೇಳಿ…",
    "chat.send": "ಕಳುಹಿಸಿ",
    "chat.mic": "ಧ್ವನಿ ನಮೂದು",
    "chat.listening": "ಆಲಿಸುತ್ತಿದ್ದೇನೆ…",
    "chat.thinking": "ವಿಶ್ಲೇಷಿಸುತ್ತಿದ್ದೇನೆ…",
    "chat.export": "ಚಾಟ್ ರಫ್ತು",
    "chat.clear": "ಇತಿಹಾಸ ಅಳಿಸಿ",
    "chat.language_toggle": "ಕನ್ನಡ",
    "chat.empty": "ಅಪರಾಧ ದತ್ತಾಂಶದ ಬಗ್ಗೆ ಏನು ಬೇಕಾದರೂ ಕೇಳಿ.",
    "chat.ai_error": "AI ಸೇವೆ ತಾತ್ಕಾಲಿಕವಾಗಿ ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",

    // Forecast
    "forecast.title": "ಅಪರಾಧ ಮುನ್ಸೂಚನೆ",
    "forecast.subtitle": "೩೦-ದಿನದ ಭವಿಷ್ಯ ಮಾದರಿ",
    "forecast.historical": "ಐತಿಹಾಸಿಕ",
    "forecast.predicted": "ಊಹಿಸಲಾಗಿದೆ",
    "forecast.summary": "AI ಮುನ್ಸೂಚನೆ ಸಾರಾಂಶ",
    "forecast.district": "ಜಿಲ್ಲೆ",
    "forecast.crime_type": "ಅಪರಾಧ ವರ್ಗ",
    "forecast.months_ahead": "ಮುಂದಿನ ತಿಂಗಳುಗಳು",

    // Network
    "network.title": "ಅಪರಾಧಿ ಜಾಲ",
    "network.search": "ಅಪರಾಧಿಯನ್ನು ಹುಡುಕಿ…",
    "network.community": "ಸಮುದಾಯ",
    "network.degree": "ಸಂಪರ್ಕಗಳು",
    "network.link_type": "ಲಿಂಕ್ ಪ್ರಕಾರ",

    // Audit
    "audit.title": "ಲೆಕ್ಕಪರಿಶೋಧನಾ ದಾಖಲೆ",
    "audit.user": "ಬಳಕೆದಾರ",
    "audit.action": "ಕ್ರಿಯೆ",
    "audit.resource": "ಸಂಪನ್ಮೂಲ",
    "audit.timestamp": "ಸಮಯ ಮುದ್ರೆ",
    "audit.ip": "IP ವಿಳಾಸ",

    // Common
    "common.search": "ಹುಡುಕು",
    "common.filter": "ಫಿಲ್ಟರ್",
    "common.export": "ರಫ್ತು",
    "common.loading": "ಲೋಡ್ ಆಗುತ್ತಿದೆ…",
    "common.error": "ಏನೋ ತಪ್ಪಾಯಿತು",
    "common.retry": "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ",
    "common.page": "ಪುಟ",
    "common.of": "ದಲ್ಲಿ",
    "common.next": "ಮುಂದೆ",
    "common.prev": "ಹಿಂದೆ",
    "common.all": "ಎಲ್ಲಾ",
    "common.open": "ತೆರೆದ",
    "common.closed": "ಮುಚ್ಚಿದ",
    "common.pending": "ಬಾಕಿ",
    "common.chargesheeted": "ಚಾರ್ಜ್‌ಶೀಟ್ ಸಲ್ಲಿಸಲಾಗಿದೆ",
    "common.date_from": "ಇಂದ",
    "common.date_to": "ವರೆಗೆ",
    "common.apply": "ಫಿಲ್ಟರ್ ಅನ್ವಯಿಸಿ",
    "common.reset": "ಮರುಹೊಂದಿಸಿ",
    "common.male": "ಪುರುಷ",
    "common.female": "ಮಹಿಳೆ",
    "common.view_detail": "ವಿವರ ವೀಕ್ಷಿಸಿ",
    "common.back": "ಹಿಂತಿರುಗಿ",
    "common.language": "ಭಾಷೆ",
    "common.close": "ಮುಚ್ಚಿ",
    "common.save": "ಉಳಿಸಿ",
    "common.cancel": "ರದ್ದು",
    "common.confirm": "ದೃಢಪಡಿಸಿ",
    "common.unknown": "ಅಜ್ಞಾತ",
    "common.n_a": "ಅನ್ವ.",
  },
} satisfies Record<Locale, Record<string, string>>;

export type TranslationKey = keyof typeof translations.en;

// ─── Pure lookup ─────────────────────────────────────────────────────────────

/**
 * Translate a key into the requested locale.
 * Falls back to English if the key is missing in the requested locale,
 * then falls back to the raw key so nothing silently renders blank.
 */
export function t(key: TranslationKey, locale: Locale): string {
  return (
    (translations[locale] as Record<string, string>)[key] ??
    translations.en[key] ??
    key
  );
}

// ─── Locale context ───────────────────────────────────────────────────────────

const LOCALE_STORAGE_KEY = "ksp_locale";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: "en",
  setLocale: () => undefined,
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, _set] = useState<Locale>("en");

  // Rehydrate from localStorage on mount (client-only)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (stored === "en" || stored === "kn") _set(stored);
    } catch {
      // localStorage unavailable (SSR, private browsing)
    }
  }, []);

  const setLocale = useCallback((next: Locale) => {
    _set(next);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch { /* ignore */ }
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext);
}
