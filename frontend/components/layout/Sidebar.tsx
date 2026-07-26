"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Bell,
  ClipboardList,
  FolderOpen,
  LayoutDashboard,
  MapPin,
  MessageSquare,
  Network,
  TrendingUp,
  Upload,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { t, useLocale } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { getRole } from "@/lib/auth";
import { useRealtimeContext } from "./RealtimeProvider";

interface NavItem {
  key: TranslationKey;
  href: string;
  icon: LucideIcon;
}

const NAV: NavItem[] = [
  { key: "nav.dashboard", href: "/dashboard", icon: LayoutDashboard },
  { key: "nav.cases",     href: "/cases",     icon: FolderOpen },
  { key: "nav.map",       href: "/map",        icon: MapPin },
  { key: "nav.network",   href: "/network",    icon: Network },
  { key: "nav.offenders", href: "/offenders",  icon: Users },
  { key: "nav.alerts",    href: "/alerts",     icon: Bell },
  { key: "nav.chat",      href: "/chat",       icon: MessageSquare },
  { key: "nav.forecast",  href: "/forecast",   icon: TrendingUp },
  { key: "nav.audit",     href: "/audit",      icon: ClipboardList },
  { key: "nav.import",    href: "/import",     icon: Upload },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { locale } = useLocale();
  const { isConnected } = useRealtimeContext();
  
  const role = getRole();
  const filteredNav = NAV.filter((item) => {
    if (role === "investigator") return ["nav.chat", "nav.cases", "nav.network", "nav.offenders"].includes(item.key);
    if (role === "supervisor") return ["nav.dashboard", "nav.cases", "nav.audit", "nav.import", "nav.alerts"].includes(item.key);
    if (role === "policymaker") return ["nav.dashboard", "nav.map", "nav.forecast"].includes(item.key);
    // analyst sees everything mapped in their requirements + a few useful ones
    return ["nav.dashboard", "nav.map", "nav.forecast", "nav.network", "nav.cases"].includes(item.key);
  });

  const content = (
    <div className="flex h-full w-64 flex-col border-r border-border bg-card">
      {/* KSP Header with logo */}
      <div className="flex shrink-0 flex-col items-center gap-1 border-b border-border bg-ksp-navy px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 shrink-0">
            <Image
              src="/ksp-logo.png"
              alt="Karnataka State Police Emblem"
              fill
              className="object-contain drop-shadow-lg"
              priority
            />
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-widest text-ksp-saffron/80">
              ಕರ್ನಾಟಕ ರಾಜ್ಯ ಪೊಲೀಸ್
            </p>
            <p className="text-sm font-bold leading-tight text-white">
              CrimeIntel
            </p>
            <p className="text-[10px] text-white/60">Intelligence Platform</p>
          </div>
        </div>
      </div>

      {/* Close button for mobile */}
      <button
        onClick={onClose}
        aria-label="Close sidebar"
        className="absolute right-3 top-3 rounded-md p-1 text-white/60 transition-colors hover:text-white lg:hidden"
      >
        <X size={18} />
      </button>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Navigation
        </p>
        <ul className="flex flex-col gap-0.5">
          {filteredNav.map(({ key, href, icon: Icon }) => {
            const active =
              pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={key}>
                <Link
                  href={href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all duration-150",
                    active
                      ? "bg-ksp-navy/80 font-medium text-ksp-saffron shadow-sm"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                  )}
                >
                  <Icon
                    size={17}
                    className={cn("shrink-0", active ? "text-ksp-saffron" : "")}
                  />
                  {t(key, locale)}
                  {active && (
                    <motion.div
                      layoutId="active-nav"
                      className="absolute right-0 h-6 w-0.5 rounded-l-full bg-ksp-saffron"
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer: Connection status + KSP tagline */}
      <div className="shrink-0 border-t border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "h-2 w-2 shrink-0 rounded-full",
              isConnected ? "animate-pulse bg-green-500" : "bg-zinc-500",
            )}
          />
          <span className="text-xs text-muted-foreground">
            {isConnected
              ? t("alerts.connected", locale)
              : t("alerts.disconnected", locale)}
          </span>
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground/50 italic">
          "Safer Karnataka through Data"
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: static sidebar */}
      <aside className="relative hidden h-full lg:flex">{content}</aside>

      {/* Mobile: animated overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            />
            <motion.aside
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed left-0 top-0 z-50 h-full lg:hidden"
            >
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
