"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, UserButton } from "@clerk/nextjs";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "#about", label: "About Us" },
  { href: "#cars", label: "Cars" },
  { href: "#futures", label: "Futures" },
  { href: "#help", label: "Help" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { userId } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 pt-6 pb-4 bg-transparent">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1">
          <span className="text-2xl font-black italic tracking-tighter font-headline text-brandDark">
            AirlinCabz
          </span>
        </Link>

      {/* Desktop Nav */}
      <nav className="hidden md:flex items-center bg-white/40 backdrop-blur-md rounded-full px-8 py-2.5 border border-white/40 shadow-sm">
        <ul className="flex gap-8 text-sm font-medium text-slate-600">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`transition-colors ${
                  pathname === link.href || link.label === "Home" && pathname === "/"
                    ? "text-brandDark"
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
      <div className="flex items-center gap-4">
        {userId ? (
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-9 h-9",
              },
            }}
          />
        ) : (
          <Link
            href="/sign-in"
            className="text-sm font-semibold text-brandDark hover:text-brandBlue transition-colors hidden md:block"
          >
            Sign In
          </Link>
        )}
        <a 
          href="mailto:support@airlincabz.com" 
          className="bg-brandBlue text-white px-7 py-2.5 rounded-xl font-semibold text-sm shadow-brand hover:bg-blue-700 transition-all hidden md:block"
        >
          Contact Us
        </a>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-full hover:bg-white/50 transition"
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
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block py-2 transition-colors ${
                    pathname === link.href || link.label === "Home" && pathname === "/"
                      ? "text-brandDark font-bold"
                      : "hover:text-brandBlue"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {!userId && (
              <li>
                <Link
                  href="/sign-in"
                  onClick={() => setMobileOpen(false)}
                  className="block py-2 text-brandDark font-semibold hover:text-brandBlue transition-colors"
                >
                  Sign In
                </Link>
              </li>
            )}
            <li>
              <a 
                href="mailto:support@airlincabz.com" 
                onClick={() => setMobileOpen(false)}
                className="inline-block mt-2 bg-brandBlue text-white px-7 py-2.5 rounded-xl font-semibold text-sm shadow-brand hover:bg-blue-700 transition-all"
              >
                Contact Us
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
