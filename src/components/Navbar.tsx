"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { insforge } from "@/lib/insforge";
import AuthModal from "@/components/AuthModal";

const navLinks = [
  { href: "/", label: "Home", icon: "home" },
  { href: "#airport-pricing", label: "Airport Taxi", icon: "flight" },
  { href: "#outstation-pricing", label: "Outstation", icon: "explore" },
  { href: "#local-pricing", label: "Local Cab", icon: "location_city" },
  { href: "#futures", label: "About Us", icon: "info" },
];

function handleHashLink(href: string, close?: () => void) {
  if (href.startsWith("#")) {
    if (href.endsWith("-pricing")) {
      const tab = href.split("-")[0].substring(1);
      window.dispatchEvent(new CustomEvent("switchPricingTab", { detail: tab }));
      const el = document.getElementById("cars");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    close?.();
    return true;
  }
  return false;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    insforge.auth.getCurrentUser().then(({ data }) => {
      if (data?.user) {
        setUser(data.user);
      }
    });
  }, []);

  const handleSignOut = async () => {
    await insforge.auth.signOut();
    setUser(null);
  };

  const handleSignIn = async () => {
    try {
      await insforge.auth.signInWithOAuth({
        provider: 'google',
        redirectTo: `${window.location.origin}/`,
      });
    } catch (err: any) {
      console.error("Auth error:", err.message);
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on outside click
  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("#mobile-menu") && !target.closest("#mobile-toggle")) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [mobileOpen]);

  // Lock body scroll when menu open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "py-3 bg-white/97 backdrop-blur-md shadow-sm border-b border-slate-200"
          : "py-4 bg-transparent"
      }`}
    >
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false);
          router.push("/book");
        }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/logo.png"
            alt="Airlinecabz Logo"
            width={36}
            height={36}
            className="object-contain"
          />
          <span
            className={`text-xl font-black italic tracking-tighter font-headline transition-colors ${
              scrolled ? "text-brandDark" : "text-white"
            }`}
          >
            Airlinecabz
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav
          className={`hidden md:flex items-center rounded-full px-8 py-2.5 border transition-all ${
            scrolled
              ? "bg-slate-100/50 border-slate-200"
              : "bg-white/10 backdrop-blur-md border-white/20"
          }`}
        >
          <ul
            className={`flex gap-8 text-sm font-medium ${
              scrolled ? "text-slate-600" : "text-white/80"
            }`}
          >
            {navLinks.map((link) => (
              <li key={link.label}>
                {link.href.startsWith("#") ? (
                  <a
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleHashLink(link.href);
                    }}
                    className={`transition-colors cursor-pointer ${
                      scrolled ? "hover:text-brandBlue" : "hover:text-white"
                    }`}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    href={link.href}
                    className={`transition-colors ${
                      pathname === link.href && link.href === "/"
                        ? scrolled
                          ? "text-brandDark font-bold"
                          : "text-white font-bold"
                        : scrolled
                        ? "hover:text-brandBlue"
                        : "hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Call button on mobile — visible always */}
          <a
            href="tel:+919880691116"
            className={`md:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-xs transition-all ${
              scrolled
                ? "bg-green-500 text-white"
                : "bg-white/20 backdrop-blur-md text-white border border-white/30"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">call</span>
            <span>Call</span>
          </a>

          {/* User Profile / Sign In */}
          <div className="hidden md:block">
            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-2 focus:outline-none">
                  <Image 
                    src={user.profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                    alt="User Avatar"
                    width={38}
                    height={38}
                    className={`rounded-full border-2 object-cover ${scrolled ? 'border-brandBlue/20' : 'border-white/50'}`}
                  />
                </button>
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0">
                  <div className="p-4 border-b border-slate-50 bg-slate-50/50 rounded-t-2xl">
                    <p className="text-sm font-bold text-slate-800 truncate">{user.profile?.name || 'Customer'}</p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
                  </div>
                  <div className="p-2">
                    <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl font-semibold transition-colors">
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  scrolled ? "bg-slate-100 text-brandDark hover:bg-slate-200" : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-md"
                }`}
              >
                Sign In
              </button>
            )}
          </div>

          {/* Hamburger */}
          <button
            id="mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`md:hidden p-2 rounded-xl transition-all ${
              scrolled
                ? "hover:bg-slate-100 text-brandDark"
                : "hover:bg-white/20 text-white"
            }`}
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined text-[26px] block">
              {mobileOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 top-0 bg-black/40 backdrop-blur-sm z-40 md:hidden" />
      )}

      {/* Mobile Slide-down Menu */}
      <div
        id="mobile-menu"
        className={`absolute top-full left-3 right-3 md:hidden z-50 transition-all duration-300 origin-top ${
          mobileOpen
            ? "opacity-100 scale-y-100 pointer-events-auto"
            : "opacity-0 scale-y-95 pointer-events-none"
        }`}
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden mt-2">
          {/* Quick actions row */}
          <div className="border-b border-slate-100">
            <a
              href="tel:+919880691116"
              className="flex items-center justify-center gap-2 py-4 text-green-600 font-bold text-sm active:bg-green-50 w-full"
              onClick={() => setMobileOpen(false)}
            >
              <span className="material-symbols-outlined text-[20px]">call</span>
              Call Now
            </a>
          </div>

          {/* Mobile Auth Row */}
          <div className="border-b border-slate-100 px-5 py-4 bg-slate-50">
            {user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Image 
                    src={user.profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                    alt="User"
                    width={40}
                    height={40}
                    className="rounded-full border-2 border-white shadow-sm"
                  />
                  <div>
                    <p className="text-sm font-bold text-slate-800">{user.profile?.name || 'Customer'}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </div>
                <button onClick={handleSignOut} className="p-2 text-red-500 hover:bg-red-50 rounded-xl">
                  <span className="material-symbols-outlined">logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileOpen(false);
                  handleSignIn();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-brandDark text-white rounded-xl font-bold text-sm shadow-md"
              >
                Sign In / Register
              </button>
            )}
          </div>

          {/* Nav Links */}
          <ul className="py-2">
            {navLinks.map((link) => (
              <li key={link.label}>
                {link.href.startsWith("#") ? (
                  <a
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      setMobileOpen(false);
                      // Small delay so menu closes smoothly first
                      setTimeout(() => handleHashLink(link.href), 200);
                    }}
                    className="flex items-center gap-3 px-5 py-3.5 text-slate-700 font-medium active:bg-slate-50 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px] text-brandBlue">
                      {link.icon}
                    </span>
                    {link.label}
                    <span className="material-symbols-outlined text-[16px] text-slate-300 ml-auto">
                      chevron_right
                    </span>
                  </a>
                ) : (
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-5 py-3.5 font-medium active:bg-slate-50 ${
                      pathname === link.href && link.href === "/"
                        ? "text-brandDark font-bold"
                        : "text-slate-700"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px] text-brandBlue">
                      {link.icon}
                    </span>
                    {link.label}
                    <span className="material-symbols-outlined text-[16px] text-slate-300 ml-auto">
                      chevron_right
                    </span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
}
