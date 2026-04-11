"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", icon: "home", label: "Home" },
  { href: "/book", icon: "route", label: "My Rides" },
  { href: "#", icon: "support_agent", label: "Support" },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 md:hidden bg-white/90 backdrop-blur-2xl rounded-t-3xl shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.label}
            href={tab.href}
            className={`flex flex-col items-center justify-center px-5 py-2 active:scale-90 transition-all duration-150 ${
              isActive
                ? "bg-blue-50 text-blue-900 rounded-2xl"
                : "text-slate-400 hover:text-blue-800"
            }`}
          >
            <span className="material-symbols-outlined">{tab.icon}</span>
            <span className="font-label text-[10px] font-semibold">
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
