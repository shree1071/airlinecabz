"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type TabId = "home" | "airport" | "outstation" | "local" | "call";

const tabs: Array<{
  id: TabId;
  icon: string;
  label: string;
  href?: string;
  sectionId?: string;
  isCall?: boolean;
  tabId?: string;
}> = [
  { id: "home", icon: "home", label: "Home", href: "/" },
  { id: "airport", icon: "flight_takeoff", label: "Airport", tabId: "airport" },
  { id: "outstation", icon: "explore", label: "Outstation", tabId: "outstation" },
  { id: "local", icon: "location_city", label: "Local", tabId: "local" },
  { id: "call", icon: "call", label: "Call Us", isCall: true },
];

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState<string>("");
  const [activePricingTab, setActivePricingTab] = useState<string>("airport");

  // Track which section is in view
  useEffect(() => {
    const sectionIds = ["cars", "outstation-areas", "airport-areas", "futures"];
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { threshold: 0.3, rootMargin: "-80px 0px 0px 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((obs) => obs.disconnect());
  }, []);

  // Listen to pricing tab changes
  useEffect(() => {
    const handleTabChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setActivePricingTab(customEvent.detail);
      }
    };
    window.addEventListener("pricingTabChanged", handleTabChange);
    return () => window.removeEventListener("pricingTabChanged", handleTabChange);
  }, []);

  if (pathname !== "/") return null; // Only show on home page

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full z-50 md:hidden safe-bottom">
      {/* Frosted glass bar */}
      <div className="bg-white/95 backdrop-blur-2xl border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-stretch">
          {tabs.map((tab) => {
            const isHome = tab.href === "/" && pathname === "/" && !activeSection;
            const isPricingTabActive = activeSection === "cars" && activePricingTab === tab.tabId;
            const isActive = isHome || isPricingTabActive;

            if (tab.isCall) {
              return (
                <a
                  key={tab.id}
                  href="tel:+919880691116"
                  className="flex-1 flex flex-col items-center justify-center gap-0.5 py-3 relative active:scale-90 transition-transform duration-150"
                >
                  <span className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center mb-0.5 shadow-lg shadow-green-500/40">
                    <span className="material-symbols-outlined text-white text-[20px]">call</span>
                  </span>
                  <span className="text-[10px] font-bold text-green-600 leading-none">Call Us</span>
                </a>
              );
            }

            if (tab.href) {
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className="flex-1 flex flex-col items-center justify-center gap-0.5 py-3 relative active:scale-90 transition-transform duration-150"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-0.5 transition-all ${isActive ? "bg-brandBlue shadow-brand" : "bg-transparent"}`}>
                    <span className={`material-symbols-outlined text-[22px] transition-colors ${isActive ? "text-white" : "text-slate-400"}`}>
                      {tab.icon}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold leading-none transition-colors ${isActive ? "text-brandBlue" : "text-slate-400"}`}>
                    {tab.label}
                  </span>
                </Link>
              );
            }

            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.tabId) {
                    window.dispatchEvent(new CustomEvent("switchPricingTab", { detail: tab.tabId }));
                    scrollToSection("cars");
                  } else if (tab.sectionId) {
                    scrollToSection(tab.sectionId);
                  }
                }}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 py-3 relative active:scale-90 transition-transform duration-150"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-0.5 transition-all ${isActive ? "bg-brandBlue shadow-brand" : "bg-transparent"}`}>
                  <span className={`material-symbols-outlined text-[22px] transition-colors ${isActive ? "text-white" : "text-slate-400"}`}>
                    {tab.icon}
                  </span>
                </div>
                <span className={`text-[10px] font-bold leading-none transition-colors ${isActive ? "text-brandBlue" : "text-slate-400"}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
        {/* iPhone home indicator safe area */}
        <div className="h-safe-area-inset-bottom" style={{ height: "env(safe-area-inset-bottom, 0px)" }} />
      </div>
    </nav>
  );
}
