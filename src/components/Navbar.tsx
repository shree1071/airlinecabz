"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "#cars", label: "Airport Taxi" },
  { href: "#outstation-areas", label: "Outstation" },
  { href: "#airport-areas", label: "Local Cab" },
  { href: "#futures", label: "About Us" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 pt-6 pb-4 bg-transparent">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="material-symbols-outlined text-brandBlue text-2xl">local_taxi</span>
          <span className="text-2xl font-black italic tracking-tighter font-headline text-brandDark">
            AirlinCabz
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center bg-white/40 backdrop-blur-md rounded-full px-8 py-2.5 border border-white/40 shadow-sm">
          <ul className="flex gap-8 text-sm font-medium text-slate-600">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className={`transition-colors ${
                    pathname === link.href && link.href === "/"
                      ? "text-brandDark font-bold"
                      : "hover:text-brandBlue"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/book"
            className="bg-brandBlue text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-brand hover:bg-blue-700 transition-all hidden md:flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">calendar_month</span>
            Book Online
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-full hover:bg-white/50 transition"
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined text-brandDark block">
              {mobileOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="absolute top-24 left-6 right-6 bg-white/90 backdrop-blur-xl border border-white/40 rounded-3xl p-6 shadow-soft md:hidden z-50 animate-fade-in-up">
          <ul className="flex flex-col gap-4 text-sm font-medium text-slate-600">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block py-2 transition-colors ${
                    pathname === link.href && link.href === "/"
                      ? "text-brandDark font-bold"
                      : "hover:text-brandBlue"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/book"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center gap-2 mt-2 bg-brandBlue text-white px-7 py-3 rounded-xl font-semibold text-sm shadow-brand hover:bg-blue-700 transition-all w-full justify-center"
              >
                <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                Book Online
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
