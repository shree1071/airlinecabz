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
  const [isVisible, setIsVisible] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [navHidden, setNavHidden] = useState(false);

  // Slide-in on mount with delay for premium feel
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 600);
    return () => clearTimeout(timer);
  }, []);

  // Hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastScrollY && currentY > 200) {
        setNavHidden(true);
      } else {
        setNavHidden(false);
      }
      setLastScrollY(currentY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

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
    <nav
      className={`fixed bottom-0 left-0 right-0 w-full z-50 md:hidden safe-bottom transition-all duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] ${
        isVisible
          ? navHidden
            ? "translate-y-full opacity-0"
            : "translate-y-0 opacity-100"
          : "translate-y-full opacity-0"
      }`}
    >
      {/* Pill-shaped floating bar with extra margin from edges */}
      <div className="mx-3 mb-2">
        <div className="bg-white/95 backdrop-blur-2xl rounded-2xl border border-slate-200/60 shadow-[0_-2px_24px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.06)]">
          <div className="flex items-stretch px-1">
            {tabs.map((tab) => {
              const isHome = tab.href === "/" && pathname === "/" && !activeSection;
              const isPricingTabActive = activeSection === "cars" && activePricingTab === tab.tabId;
              const isActive = isHome || isPricingTabActive;

              if (tab.isCall) {
                return (
                  <a
                    key={tab.id}
                    href="tel:+919880691116"
                    className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 relative active:scale-90 transition-all duration-200"
                  >
                    <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-md shadow-green-500/30 transition-transform hover:scale-105">
                      <span className="material-symbols-outlined text-white text-[20px]">call</span>
                    </span>
                    <span className="text-[10px] font-bold text-green-600 leading-none mt-0.5">Call Us</span>
                  </a>
                );
              }

              if (tab.href) {
                return (
                  <Link
                    key={tab.id}
                    href={tab.href}
                    className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 relative active:scale-90 transition-all duration-200"
                  >
                    {/* Active indicator dot */}
                    {isActive && (
                      <span className="absolute top-1.5 w-1 h-1 rounded-full bg-brandBlue animate-pulse" />
                    )}
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 ${isActive ? "bg-gradient-to-br from-brandBlue to-blue-600 shadow-md shadow-brandBlue/30 scale-105" : "bg-transparent hover:bg-slate-100"}`}>
                      <span className={`material-symbols-outlined text-[22px] transition-colors duration-300 ${isActive ? "text-white" : "text-slate-400"}`}>
                        {tab.icon}
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold leading-none mt-0.5 transition-colors duration-300 ${isActive ? "text-brandBlue" : "text-slate-400"}`}>
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
                  className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 relative active:scale-90 transition-all duration-200"
                >
                  {/* Active indicator dot */}
                  {isActive && (
                    <span className="absolute top-1.5 w-1 h-1 rounded-full bg-brandBlue animate-pulse" />
                  )}
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 ${isActive ? "bg-gradient-to-br from-brandBlue to-blue-600 shadow-md shadow-brandBlue/30 scale-105" : "bg-transparent hover:bg-slate-100"}`}>
                    <span className={`material-symbols-outlined text-[22px] transition-colors duration-300 ${isActive ? "text-white" : "text-slate-400"}`}>
                      {tab.icon}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold leading-none mt-0.5 transition-colors duration-300 ${isActive ? "text-brandBlue" : "text-slate-400"}`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
          {/* iPhone home indicator safe area */}
          <div className="h-safe-area-inset-bottom" style={{ height: "env(safe-area-inset-bottom, 0px)" }} />
        </div>
      </div>
    </nav>
  );
}
