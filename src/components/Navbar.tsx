"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${scrolled ? "pt-4 pb-4 bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200" : "pt-6 pb-4 bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="material-symbols-outlined text-brandBlue text-2xl">local_taxi</span>
          <span className={`text-2xl font-black italic tracking-tighter font-headline transition-colors ${scrolled ? "text-brandDark" : "text-white"}`}>
            AirlinCabz
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className={`hidden md:flex items-center rounded-full px-8 py-2.5 border transition-all ${scrolled ? "bg-slate-100/50 border-slate-200" : "bg-white/10 backdrop-blur-md border-white/20"}`}>
          <ul className={`flex gap-8 text-sm font-medium ${scrolled ? "text-slate-600" : "text-white/80"}`}>
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className={`transition-colors ${
                    pathname === link.href && link.href === "/"
                      ? scrolled ? "text-brandDark font-bold" : "text-white font-bold"
                      : scrolled ? "hover:text-brandBlue" : "hover:text-white"
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
            className={`md:hidden p-2 rounded-full transition ${scrolled ? "hover:bg-slate-100 text-brandDark" : "hover:bg-white/20 text-white"}`}
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined block">
              {mobileOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="absolute top-24 left-6 right-6 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-3xl p-6 shadow-soft md:hidden z-50 animate-fade-in-up">
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

