"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";

/* ── How It Works Steps ── */
const steps = [
  { icon: "edit_note", title: "1. Enter Details", desc: "Input your pickup and destination for an instant luxury quote." },
  { icon: "minor_crash", title: "2. Choose Car", desc: "Select from our elite fleet tailored to your travel needs." },
  { icon: "payments", title: "3. Pay Securely", desc: "Multiple payment options with encrypted transaction safety." },
  { icon: "verified_user", title: "4. Enjoy Ride", desc: "Sit back and relax as our professional chauffeurs take the wheel." },
];

/* ── Airport Taxi Prices ── */
const airportPrices = [
  { vehicle: "Hatchback", capacity: "3+1", price: 799, toll: 120, img: "/imgi_4_mini.png" },
  { vehicle: "Swift Dzire", capacity: "4+1", price: 899, toll: 120, img: "/imgi_5_swift.jpg" },
  { vehicle: "Toyota Etios", capacity: "4+1", price: 1049, toll: 120, img: "/imgi_6_etios.png" },
  { vehicle: "Swift Dzire CNG w/ Carrier", capacity: "4+1", price: 1100, toll: 120, img: "/imgi_5_swift.jpg" },
  { vehicle: "New Swift Dzire", capacity: "4+1", price: 1100, toll: 120, img: "/imgi_5_swift.jpg" },
  { vehicle: "Ertiga SUV", capacity: "6+1", price: 1699, toll: 120, img: "/imgi_8_ertiga.jpg" },
  { vehicle: "Toyota Innova", capacity: "7+1", price: 1799, toll: 120, img: "/imgi_9_innova.png" },
  { vehicle: "Toyota Innova Crysta", capacity: "7+1", price: 1999, toll: 120, img: "/imgi_10_crysta.png", highlight: true },
  { vehicle: "Innova Hycross", capacity: "7+1", price: 2499, toll: 120, img: "/imgi_11_hycross.jpg" },
  { vehicle: "Tempo Traveller NON AC", capacity: "12+1", price: 3599, toll: 250, img: "/imgi_12_tt.jpg" },
  { vehicle: "Tempo Traveller AC", capacity: "12+1", price: 3999, toll: 250, img: "/imgi_12_tt.jpg" },
];

/* ── Outstation Prices ── */
const outstationPrices = [
  { vehicle: "Sedan", capacity: "4+1", rate: 12, bata: 350, img: "/imgi_7_Verito.jpg" },
  { vehicle: "New Swift Dzire / Etios", capacity: "4+1", rate: 13, bata: 350, img: "/imgi_5_swift.jpg" },
  { vehicle: "Toyota Innova", capacity: "7+1", rate: 16, bata: 400, img: "/imgi_9_innova.png" },
  { vehicle: "Ertiga SUV", capacity: "6+1", rate: 16, bata: 400, img: "/imgi_8_ertiga.jpg" },
  { vehicle: "Toyota Innova Crysta", capacity: "7+1", rate: 18, bata: 400, img: "/imgi_10_crysta.png", highlight: true },
  { vehicle: "Tempo Traveller", capacity: "12+1", rate: 19, bata: 500, img: "/imgi_12_tt.jpg" },
  { vehicle: "Innova Hycross", capacity: "7+1", rate: 22, bata: 500, img: "/imgi_11_hycross.jpg" },
];

/* ── Local Taxi Prices ── */
const localPrices = [
  { vehicle: "Sedan (4hrs 40km)", capacity: "4+1", price: 1300, hours: 4, km: 40, extraKm: 15, extraHr: 180, img: "/imgi_7_Verito.jpg" },
  { vehicle: "Sedan (8hrs 80km)", capacity: "4+1", price: 2100, hours: 8, km: 80, extraKm: 15, extraHr: 180, img: "/imgi_7_Verito.jpg" },
  { vehicle: "Ertiga SUV", capacity: "6+1", price: 2799, hours: 8, km: 80, extraKm: 20, extraHr: 200, img: "/imgi_8_ertiga.jpg" },
  { vehicle: "Toyota Innova", capacity: "7+1", price: 3200, hours: 8, km: 80, extraKm: 20, extraHr: 200, img: "/imgi_9_innova.png" },
  { vehicle: "Toyota Innova Crysta", capacity: "7+1", price: 3499, hours: 8, km: 80, extraKm: 20, extraHr: 250, img: "/imgi_10_crysta.png", highlight: true },
  { vehicle: "Tempo Traveller", capacity: "12+1", price: 4499, hours: 8, km: 80, extraKm: 25, extraHr: 300, img: "/imgi_12_tt.jpg" },
  { vehicle: "Innova Hycross", capacity: "7+1", price: 4499, hours: 8, km: 80, extraKm: 30, extraHr: 300, img: "/imgi_11_hycross.jpg" },
];

/* ── Airport Service Areas ── */
const airportAreas = [
  "MG Road", "Koramangala", "Bagmane Tech Park", "Banashankari", "Basavanagudi",
  "Silk Board", "Frazer Town", "Indira Nagar", "Infantry Road", "Sanjay Nagar",
  "JP Nagar", "KR Puram", "HAL", "Rajaji Nagar", "Marathahalli",
  "Vijayanagar", "Yeshwanthpur", "Whitefield", "Shanti Nagar", "ITPL",
  "National Games Village", "Kundalahalli", "Richmond Town", "Race Course Road",
  "Hoodi", "Ashok Nagar", "Brookfield",
];

/* ── Outstation Destinations ── */
const outstationDestinations = [
  "Ooty", "Nandi Hills", "Mysore", "BR Hills", "Yercaud",
  "Chikmagalur", "Coorg", "Wayanad", "Sakleshpur", "Dandeli",
  "Bheemeshwari", "Kudremukh", "Hampi", "Gokarna", "Udupi",
  "Kodaikanal", "Goa", "Mangalore", "Dharmasthala", "Tirupati",
  "Puducherry", "Chennai",
];

/* ── Why Us features ── */
const whyUs = [
  { icon: "verified_user", title: "Safe, Secured & Reliable", desc: "We take care of everything, making you comfortable and safe during every journey." },
  { icon: "price_check", title: "Best Price Guaranteed", desc: "We charge fewer fees than our competitors with complete transparency on total cost." },
  { icon: "schedule", title: "In-Time Pick-up", desc: "Verified drivers ensuring quick and comfortable rides with on-time pickups every time." },
  { icon: "support_agent", title: "24×7 Support", desc: "We operate 24 hours a day, 7 days a week, 365 days a year — always here for you." },
];

type Tab = "airport" | "outstation" | "local";

/* ── Shared Vehicle Card Image Block ── */
function VehicleImage({ src, alt, highlight }: { src: string; alt: string; highlight?: boolean }) {
  return (
    <div className={`relative w-full h-32 rounded-2xl overflow-hidden mb-4 ${highlight ? "bg-white/20" : "bg-slate-50"}`}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain p-2 drop-shadow-md"
        sizes="(max-width: 640px) 100vw, 300px"
      />
    </div>
  );
}

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<Tab>("airport");
  const [tripType, setTripType] = useState("One Way");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  return (
    <>
      <Navbar />

      {/* ═══ FULL-BLEED HERO ═══ */}
      <section className="relative w-full h-[92vh] min-h-[600px] max-h-[900px] overflow-hidden">
        {/* Airport terminal background */}
        <Image
          src="/airport-terminal-hero.png"
          alt="Bangalore Airport Terminal"
          fill
          className="object-cover object-center scale-105"
          priority
          sizes="100vw"
        />
        {/* Gradient overlays for cinematic effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/20 to-black/70 z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent z-10" />

        {/* Hero content */}
        <div className="relative z-20 h-full flex flex-col justify-between pb-8">
          {/* Top spacer for navbar */}
          <div className="h-24" />

          {/* Main headline */}
          <div className="px-6 sm:px-10 lg:px-20 max-w-5xl">
            <p className="text-white/70 text-sm sm:text-base font-semibold tracking-[0.2em] uppercase mb-3 drop-shadow">
              Bangalore Airport Taxi
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-[1.08] tracking-tight drop-shadow-2xl">
              Hey Buddy!<br />
              <span className="text-amber-300">where are you</span><br />
              Flying to?
            </h1>
            <p className="mt-4 text-white/75 text-sm sm:text-base max-w-md leading-relaxed drop-shadow">
              Premium airport transfers across Bangalore. Safe, professional, and on time — starting at just ₹799.
            </p>
            <a
              href="#booking-panel"
              className="mt-6 inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/30 text-white font-bold text-sm px-6 py-3 rounded-full transition-all duration-300 hover:scale-105"
            >
              <span className="material-symbols-outlined text-[18px]">explore</span>
              Explore Now
            </a>
          </div>

          {/* ── Booking Panel ── */}
          <div id="booking-panel" className="mx-4 sm:mx-6 lg:mx-20 mt-6">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
              {/* Panel tabs */}
              <div className="flex border-b border-slate-100">
                {[
                  { label: "Airport Taxi", icon: "flight" },
                  { label: "Outstation", icon: "map" },
                  { label: "Local Hire", icon: "location_city" },
                ].map((t) => (
                  <button
                    key={t.label}
                    onClick={() => setActiveTab(t.label === "Airport Taxi" ? "airport" : t.label === "Outstation" ? "outstation" : "local")}
                    className={`flex items-center gap-1.5 px-4 sm:px-6 py-3.5 text-xs sm:text-sm font-bold transition-all border-b-2 ${
                      (t.label === "Airport Taxi" && activeTab === "airport") ||
                      (t.label === "Outstation" && activeTab === "outstation") ||
                      (t.label === "Local Hire" && activeTab === "local")
                        ? "border-brandBlue text-brandBlue bg-blue-50/50"
                        : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">{t.icon}</span>
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Search fields */}
              <div className="p-4 sm:p-6">
                {/* Trip type row */}
                <div className="flex gap-3 mb-4">
                  {["One Way", "Round Trip"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setTripType(type)}
                      className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full transition-all ${
                        tripType === type
                          ? "bg-brandDark text-white"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {type === "One Way" ? "arrow_forward" : "repeat"}
                      </span>
                      {type}
                    </button>
                  ))}
                </div>

                {/* Input fields row */}
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr_auto_auto] gap-3 items-center">
                  {/* From */}
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-brandBlue text-[20px]">my_location</span>
                    <input
                      type="text"
                      placeholder="Pickup location"
                      value={from}
                      onChange={(e) => setFrom(e.target.value)}
                      className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-brandDark placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brandBlue/20 focus:border-brandBlue transition-all"
                    />
                  </div>

                  {/* Swap icon */}
                  <button
                    onClick={() => { const tmp = from; setFrom(to); setTo(tmp); }}
                    className="hidden sm:flex w-9 h-9 rounded-full bg-slate-100 hover:bg-brandBlue hover:text-white text-slate-400 items-center justify-center transition-all shrink-0"
                  >
                    <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
                  </button>

                  {/* To */}
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">flight_takeoff</span>
                    <input
                      type="text"
                      placeholder={activeTab === "airport" ? "Kempegowda Intl. Airport" : "Destination"}
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-brandDark placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brandBlue/20 focus:border-brandBlue transition-all"
                    />
                  </div>

                  {/* Date */}
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">calendar_month</span>
                    <input
                      type="date"
                      className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-brandBlue/20 focus:border-brandBlue transition-all"
                    />
                  </div>

                  {/* Search CTA */}
                  <Link
                    href="/book"
                    className="flex items-center justify-center gap-2 bg-brandBlue text-white px-6 py-3.5 rounded-xl font-bold text-sm shadow-brand hover:brightness-110 hover:scale-105 transition-all whitespace-nowrap"
                  >
                    <span className="material-symbols-outlined text-[18px]">search</span>
                    Search Cabs
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div id="about" className="mt-6 sm:mt-10 bg-white/40 backdrop-blur-md rounded-2xl sm:rounded-[32px] border border-white/60 p-6 sm:p-8 py-8 sm:py-10 shadow-soft">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="flex flex-col items-center justify-center border-r border-slate-300">
              <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-headline text-brandDark">50k+</span>
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2 text-center">Happy Rides</span>
            </div>
            <div className="flex flex-col items-center justify-center md:border-r border-slate-300">
              <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-headline text-brandDark">10+</span>
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2 text-center">Years Experience</span>
            </div>
            <div className="flex flex-col items-center justify-center border-r border-slate-300">
              <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-headline text-brandDark">4.9</span>
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2 text-center">Average Rating</span>
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-headline text-brandDark">24/7</span>
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2 text-center">Support</span>
            </div>
          </div>
        </div>
      </div>

      <main className="pb-20">

      {/* ───── Main Content ───── */}
      <div className="bg-white/80 backdrop-blur-sm rounded-t-[3rem] mt-12 pt-20 border-t border-white/90 shadow-[0_-20px_40px_rgba(0,0,0,0.02)]">

        {/* ═══ PRICING SECTION ═══ */}
        <section id="cars" className="py-12 sm:py-20 bg-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="font-headline text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3 sm:mb-4 text-brandDark">
                Transparent Pricing
              </h2>
              <p className="text-slate-500 max-w-2xl mx-auto text-sm sm:text-base px-4">
                Affordable taxi fares in Bangalore with no hidden charges. Toll charges extra as applicable.
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="flex justify-center mb-8 sm:mb-10 px-4">
              <div className="inline-flex bg-slate-100 rounded-xl sm:rounded-2xl p-1 sm:p-1.5 gap-1 w-full max-w-md sm:w-auto overflow-x-auto">
                {(["airport", "outstation", "local"] as Tab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm capitalize transition-all duration-300 whitespace-nowrap flex-1 sm:flex-none ${
                      activeTab === tab ? "bg-brandBlue text-white shadow-brand" : "text-slate-500 hover:text-brandDark"
                    }`}
                  >
                    {tab === "airport" ? "✈ Airport" : tab === "outstation" ? "🗺 Outstation" : "� Local"}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Airport Taxi Tab ── */}
            {activeTab === "airport" && (
              <div>
                <p className="text-center text-slate-500 text-xs sm:text-sm mb-6 sm:mb-8 px-4">Airport Taxi pickup and drop with 24×7 customer support</p>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 px-4 sm:px-0">
                  {airportPrices.map((item) => (
                    <div
                      key={item.vehicle}
                      className={`relative rounded-3xl p-5 border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                        item.highlight
                          ? "bg-brandBlue text-white shadow-brand border-blue-400"
                          : "bg-white shadow-soft border-slate-100 hover:border-brandBlue/30"
                      }`}
                    >
                      {item.highlight && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full">
                          Most Popular
                        </span>
                      )}
                      <VehicleImage src={item.img} alt={item.vehicle} highlight={item.highlight} />
                      <h3 className={`font-bold text-base mb-1 ${item.highlight ? "text-white" : "text-brandDark"}`}>{item.vehicle}</h3>
                      <p className={`text-xs mb-3 flex items-center gap-1 ${item.highlight ? "text-white/70" : "text-slate-400"}`}>
                        <span className="material-symbols-outlined text-[13px]">person</span>
                        {item.capacity} Capacity
                      </p>
                      <div className={`text-3xl font-extrabold font-headline ${item.highlight ? "text-white" : "text-brandDark"}`}>
                        ₹{item.price.toLocaleString()}
                      </div>
                      <p className={`text-xs mt-1 ${item.highlight ? "text-white/70" : "text-slate-400"}`}>
                        + Toll ₹{item.toll} extra
                      </p>
                      <a
                        href="tel:+919999999999"
                        className={`mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          item.highlight
                            ? "bg-white text-brandBlue hover:bg-blue-50"
                            : "bg-brandBlue/10 text-brandBlue hover:bg-brandBlue hover:text-white"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[14px]">call</span>
                        Book Now
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Outstation Tab ── */}
            {activeTab === "outstation" && (
              <div>
                <p className="text-center text-slate-500 text-xs sm:text-sm mb-6 sm:mb-8 px-4">Outstation taxi pickup and drop with 24×7 customer support. Toll and parking charges extra.</p>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 px-4 sm:px-0">
                  {outstationPrices.map((item) => (
                    <div
                      key={item.vehicle}
                      className={`relative rounded-3xl p-5 border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                        item.highlight
                          ? "bg-brandBlue text-white shadow-brand border-blue-400"
                          : "bg-white shadow-soft border-slate-100 hover:border-brandBlue/30"
                      }`}
                    >
                      {item.highlight && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full">
                          Most Popular
                        </span>
                      )}
                      <VehicleImage src={item.img} alt={item.vehicle} highlight={item.highlight} />
                      <h3 className={`font-bold text-base mb-1 ${item.highlight ? "text-white" : "text-brandDark"}`}>{item.vehicle}</h3>
                      <p className={`text-xs mb-3 flex items-center gap-1 ${item.highlight ? "text-white/70" : "text-slate-400"}`}>
                        <span className="material-symbols-outlined text-[13px]">person</span>
                        {item.capacity} Capacity
                      </p>
                      <div className={`text-3xl font-extrabold font-headline ${item.highlight ? "text-white" : "text-brandDark"}`}>
                        ₹{item.rate}/km
                      </div>
                      <p className={`text-xs mt-1 ${item.highlight ? "text-white/70" : "text-slate-400"}`}>
                        Bata ₹{item.bata}/day · Toll &amp; parking extra
                      </p>
                      <a
                        href="tel:+919999999999"
                        className={`mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          item.highlight
                            ? "bg-white text-brandBlue hover:bg-blue-50"
                            : "bg-brandBlue/10 text-brandBlue hover:bg-brandBlue hover:text-white"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[14px]">call</span>
                        Book Now
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Local Hire Tab ── */}
            {activeTab === "local" && (
              <div>
                <p className="text-center text-slate-500 text-xs sm:text-sm mb-6 sm:mb-8 px-4">Local taxi pickup and drop with 24×7 customer support.</p>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 px-4 sm:px-0">
                  {localPrices.map((item) => (
                    <div
                      key={item.vehicle}
                      className={`relative rounded-3xl p-5 border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                        item.highlight
                          ? "bg-brandBlue text-white shadow-brand border-blue-400"
                          : "bg-white shadow-soft border-slate-100 hover:border-brandBlue/30"
                      }`}
                    >
                      {item.highlight && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full">
                          Most Popular
                        </span>
                      )}
                      <VehicleImage src={item.img} alt={item.vehicle} highlight={item.highlight} />
                      <h3 className={`font-bold text-base mb-1 ${item.highlight ? "text-white" : "text-brandDark"}`}>{item.vehicle}</h3>
                      <p className={`text-xs mb-3 flex items-center gap-1 ${item.highlight ? "text-white/70" : "text-slate-400"}`}>
                        <span className="material-symbols-outlined text-[13px]">person</span>
                        {item.capacity} Capacity
                      </p>
                      <div className={`text-3xl font-extrabold font-headline ${item.highlight ? "text-white" : "text-brandDark"}`}>
                        ₹{item.price.toLocaleString()}
                      </div>
                      <p className={`text-xs mt-1 ${item.highlight ? "text-white/70" : "text-slate-400"}`}>
                        {item.hours}hrs / {item.km}kms included
                      </p>
                      <p className={`text-[11px] mt-1 ${item.highlight ? "text-white/60" : "text-slate-400"}`}>
                        Extra: ₹{item.extraKm}/km · ₹{item.extraHr}/hr
                      </p>
                      <a
                        href="tel:+919999999999"
                        className={`mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          item.highlight
                            ? "bg-white text-brandBlue hover:bg-blue-50"
                            : "bg-brandBlue/10 text-brandBlue hover:bg-brandBlue hover:text-white"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[14px]">call</span>
                        Book Now
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA below pricing */}
            <div className="mt-10 sm:mt-12 text-center px-4">
              <p className="text-slate-500 text-xs sm:text-sm mb-3 sm:mb-4">📞 Call us for instant booking &amp; best rates</p>
              <a
                href="tel:+919999999999"
                className="inline-flex items-center gap-2 sm:gap-3 bg-brandDark text-white px-6 sm:px-10 py-4 sm:py-5 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg shadow-2xl hover:scale-105 transition-transform active:scale-95"
              >
                <span className="material-symbols-outlined text-[20px] sm:text-[22px]">call</span>
                +91 99999 99999
              </a>
            </div>
          </div>
        </section>

        {/* ═══ WHY BOOK WITH US ═══ */}
        <section id="futures" className="py-20 bg-slate-50/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-14">
              <h2 className="font-headline text-4xl md:text-5xl font-bold tracking-tight mb-4 text-brandDark">
                Why Book With AirlinCabz?
              </h2>
              <p className="text-slate-500 max-w-2xl mx-auto">
                India&apos;s most trusted taxi service. Safe, secured, and reliable rides across Bangalore.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {whyUs.map((item) => (
                <div
                  key={item.title}
                  className="bg-white p-8 rounded-3xl shadow-soft border border-slate-100 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-brandBlue/10 flex items-center justify-center text-brandBlue mb-6 group-hover:bg-brandBlue group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-3xl">{item.icon}</span>
                  </div>
                  <h3 className="font-headline text-xl font-bold mb-3 text-brandDark">{item.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ HOW IT WORKS ═══ */}
        <section id="help" className="py-20 bg-transparent">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-16">
              <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight mb-4 text-brandDark">
                How It Works
              </h2>
              <p className="text-slate-500 max-w-xl">Four simple steps to your destination with unparalleled comfort.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {steps.map((step) => (
                <div
                  key={step.title}
                  className="p-8 bg-white/50 backdrop-blur-sm rounded-3xl border border-slate-200/50 group hover:bg-brandBlue transition-all duration-500 shadow-sm hover:shadow-brand"
                >
                  <div className="w-12 h-12 rounded-2xl bg-brandBlue/10 flex items-center justify-center text-brandBlue mb-6 group-hover:bg-white group-hover:text-brandBlue transition-colors">
                    <span className="material-symbols-outlined">{step.icon}</span>
                  </div>
                  <h3 className="font-headline text-xl font-bold mb-3 text-brandDark group-hover:text-white transition-colors">{step.title}</h3>
                  <p className="text-sm text-slate-500 group-hover:text-white/80 transition-colors">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ AIRPORT SERVICE AREAS ═══ */}
        <section id="airport-areas" className="py-20 bg-white/60">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="font-headline text-4xl font-bold tracking-tight mb-4 text-brandDark">
                Book Airport Cab in Bangalore
              </h2>
              <p className="text-slate-500 max-w-2xl mx-auto text-sm">
                We provide airport taxi pickup and drop from all major areas in Bangalore to Kempegowda International Airport.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              {airportAreas.map((area) => (
                <a
                  key={area}
                  href="tel:+919999999999"
                  className="group inline-flex items-center gap-2 bg-white border border-slate-200 hover:border-brandBlue hover:bg-brandBlue hover:text-white text-slate-600 text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-all duration-200"
                >
                  <span className="material-symbols-outlined text-[16px] text-brandBlue group-hover:text-white transition-colors">flight_takeoff</span>
                  {area} to Airport
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ OUTSTATION DESTINATIONS ═══ */}
        <section id="outstation-areas" className="py-20 bg-transparent">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="font-headline text-4xl font-bold tracking-tight mb-4 text-brandDark">
                Book Outstation Taxi from Bangalore
              </h2>
              <p className="text-slate-500 max-w-2xl mx-auto text-sm">
                Comfortable and safe outstation cab service from Bangalore to popular destinations across South India.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              {outstationDestinations.map((dest) => (
                <a
                  key={dest}
                  href="tel:+919999999999"
                  className="group inline-flex items-center gap-2 bg-white border border-slate-200 hover:border-brandBlue hover:bg-brandBlue hover:text-white text-slate-600 text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-all duration-200"
                >
                  <span className="material-symbols-outlined text-[16px] text-brandBlue group-hover:text-white transition-colors">map</span>
                  Bangalore to {dest}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ ABOUT ═══ */}
        <section className="py-20 bg-slate-50/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="font-headline text-4xl font-bold tracking-tight mb-6 text-brandDark">
                  India&apos;s Most Trusted Taxi Services
                </h2>
                <p className="text-slate-500 leading-relaxed mb-4">
                  AirlinCabz is a leading cab service provider in Bangalore. Whether you are travelling to the airport late at night or going on a vacation with your family, AirlinCabz will be at your service.
                </p>
                <p className="text-slate-500 leading-relaxed mb-6">
                  We have a wide range of A/C and Non-A/C luxury tourist cabs for personal and corporate use. We provide cabs on rent for travelling in &amp; around Bangalore and Outstation Cabs Service from Bangalore.
                </p>
                <div className="flex flex-col gap-3">
                  {[
                    "Wide range of A/C & Non-A/C luxury cabs",
                    "Innova, Dzire, Etios, Ertiga & more",
                    "Local, Airport & Outstation services",
                    "Corporate & personal travel solutions",
                  ].map((point) => (
                    <div key={point} className="flex items-center gap-3 text-sm text-slate-600">
                      <span className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs shrink-0">✓</span>
                      {point}
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-brandBlue rounded-3xl p-8 text-white">
                  <span className="material-symbols-outlined text-4xl mb-4 block opacity-80">flight</span>
                  <h3 className="font-bold text-xl mb-2">Airport Taxi</h3>
                  <p className="text-white/70 text-sm">24×7 airport pickup &amp; drop across Bangalore</p>
                  <p className="mt-4 font-extrabold text-2xl">₹799+</p>
                </div>
                <div className="bg-white rounded-3xl p-8 shadow-soft border border-slate-100">
                  <span className="material-symbols-outlined text-4xl mb-4 block text-brandBlue">explore</span>
                  <h3 className="font-bold text-xl mb-2 text-brandDark">Outstation</h3>
                  <p className="text-slate-500 text-sm">Comfortable rides across South India</p>
                  <p className="mt-4 font-extrabold text-2xl text-brandDark">₹12/km+</p>
                </div>
                <div className="bg-white rounded-3xl p-8 shadow-soft border border-slate-100">
                  <span className="material-symbols-outlined text-4xl mb-4 block text-brandBlue">location_city</span>
                  <h3 className="font-bold text-xl mb-2 text-brandDark">Local Hire</h3>
                  <p className="text-slate-500 text-sm">4hr &amp; 8hr local packages in Bangalore</p>
                  <p className="mt-4 font-extrabold text-2xl text-brandDark">₹1,300+</p>
                </div>
                <div className="bg-slate-900 rounded-3xl p-8 text-white">
                  <span className="material-symbols-outlined text-4xl mb-4 block opacity-80">support_agent</span>
                  <h3 className="font-bold text-xl mb-2">24×7 Support</h3>
                  <p className="text-white/70 text-sm">Always here whenever you need us</p>
                  <a href="tel:+919999999999" className="mt-4 block font-extrabold text-brandBlue">99999 99999</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ CTA BANNER ═══ */}
        <section className="py-20 bg-transparent">
          <div className="max-w-7xl mx-auto px-6">
            <div className="bg-brandDark rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-brandBlue/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
              <div className="relative z-10">
                <h2 className="font-headline text-4xl md:text-5xl font-extrabold text-white mb-4">
                  Book Airport Taxi Now
                </h2>
                <p className="text-white/60 mb-10 max-w-xl mx-auto">
                  Bangalore&apos;s cheapest airport taxi service. Innova Crysta starting at ₹1,999. Call us anytime!
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <a
                    href="tel:+919999999999"
                    className="bg-brandBlue text-white px-10 py-5 rounded-2xl font-bold text-xl shadow-brand hover:scale-105 transition-transform inline-flex items-center gap-3"
                  >
                    <span className="material-symbols-outlined">call</span>
                    +91 99999 99999
                  </a>
                  <Link
                    href="/book"
                    className="bg-white/10 text-white border border-white/20 px-10 py-5 rounded-2xl font-bold text-xl hover:bg-white/20 transition-all inline-flex items-center gap-3"
                  >
                    <span className="material-symbols-outlined">calendar_month</span>
                    Book Online
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
        <MobileBottomNav />
      </div>
      </main>
    </>
  );
}

