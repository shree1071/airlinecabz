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
  { vehicle: "Ertiga SUV", capacity: "6+1", rate: 16, bata: 400, img: "/imgi_8_ertiga.jpg" },
  { vehicle: "Toyota Innova", capacity: "7+1", rate: 17, bata: 400, img: "/imgi_9_innova.png" },
  { vehicle: "Toyota Innova Crysta", capacity: "7+1", rate: 20, bata: 400, img: "/imgi_10_crysta.png", highlight: true },
  { vehicle: "Tempo Traveller NON AC", capacity: "12+1", rate: 20, bata: 500, img: "/imgi_12_tt.jpg" },
  { vehicle: "Tempo Traveller AC", capacity: "12+1", rate: 22, bata: 500, img: "/imgi_12_tt.jpg" },
  { vehicle: "Innova Hycross", capacity: "7+1", rate: 22, bata: 500, img: "/imgi_11_hycross.jpg" },
  { vehicle: "Force Urbania", capacity: "17+1", rate: 42, bata: 600, img: "/force-urbania-v2.png" },
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
  { icon: "star", title: "Premium Cabs", desc: "Experience luxury with our well-maintained premium fleet for your comfort and safety." },
  { icon: "price_check", title: "Competitive Pricing", desc: "We offer the most competitive rates in the market with complete transparency on total cost." },
  { icon: "thumb_up", title: "Low Cancellation Rate", desc: "Count on us for your travel plans. Our ultra-low cancellation rate ensures you're never stranded." },
  { icon: "support_agent", title: "24×7 Support", desc: "We operate 24 hours a day, 7 days a week, 365 days a year — always here for you." },
];

type Tab = "airport" | "outstation" | "local";

function isPremiumCab(vehicle: string) {
  const v = vehicle.toLowerCase();
  return v.includes("crysta") || v.includes("hycross") || v.includes("tempo traveller") || v.includes("urbania");
}

function getWhatsAppLink(vehicle: string, price?: number) {
  const priceText = price ? ` - ₹${price}` : '';
  const message = `Hello! I want to book a cab:\n\nVehicle: ${vehicle}${priceText}\n\nPlease confirm availability and provide booking details.`;
  return `https://wa.me/919901366449?text=${encodeURIComponent(message)}`;
}

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

/* ── Shared Action Buttons ── */
function VehicleActionButtons({ vehicle, price, highlight }: { vehicle: string; price?: number; highlight?: boolean }) {
  return (
    <div className="mt-4 flex flex-col gap-2">
      <a
        href={getWhatsAppLink(vehicle, price)}
        target="_blank"
        rel="noopener noreferrer"
        className={`w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all ${
          highlight
            ? "bg-white text-brandBlue hover:bg-blue-50"
            : "bg-green-600 text-white hover:bg-green-700"
        }`}
      >
        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
        <span className="whitespace-nowrap">WhatsApp</span>
      </a>
      <Link
        href={`/book?vehicle=${encodeURIComponent(vehicle)}`}
        className={`w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all ${
          highlight
            ? "bg-white/80 text-brandBlue hover:bg-white"
            : "bg-brandBlue text-white hover:bg-blue-700"
        }`}
      >
        <span className="material-symbols-outlined text-[13px] sm:text-[14px] flex-shrink-0">calendar_month</span>
        <span className="whitespace-nowrap">Book Online</span>
      </Link>
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
      <section className="relative w-full h-[92vh] min-h-[500px] sm:min-h-[600px] max-h-[900px] overflow-hidden">
        {/* Airport terminal background */}
        <Image
          src="/airport-terminal-hero.png"
          alt="Bangalore Airport Terminal"
          fill
          className="object-cover object-[center_40%] sm:object-center"
          priority
          quality={90}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
        />
        {/* Gradient overlays for cinematic effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/25 to-black/75 z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent z-10" />

        {/* Hero content */}
        <div className="relative z-20 h-full flex flex-col justify-between pb-6 sm:pb-8">
          {/* Top spacer for navbar */}
          <div className="h-16 sm:h-24" />

          {/* Main headline */}
          <div className="px-4 sm:px-10 lg:px-20 max-w-5xl">
            <p className="text-white/70 text-xs sm:text-base font-semibold tracking-[0.15em] sm:tracking-[0.2em] uppercase mb-2 sm:mb-3 drop-shadow">
              Bangalore Airport Taxi
            </p>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-[1.1] sm:leading-[1.08] tracking-tight drop-shadow-2xl">
              Hey Buddy!<br />
              <span className="text-amber-300">where are you</span><br />
              Flying to?
            </h1>
            <p className="mt-3 sm:mt-4 text-white/80 text-xs sm:text-base max-w-md leading-relaxed drop-shadow">
              Premium airport transfers across Bangalore. Safe, professional, and on time — starting at just ₹799.
            </p>
            <a
              href="#booking-panel"
              className="mt-4 sm:mt-6 inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/30 text-white font-bold text-xs sm:text-sm px-5 sm:px-6 py-2.5 sm:py-3 rounded-full transition-all duration-300 hover:scale-105"
            >
              <span className="material-symbols-outlined text-[16px] sm:text-[18px]">explore</span>
              Explore Now
            </a>
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
                      <VehicleActionButtons vehicle={item.vehicle} price={item.price} highlight={item.highlight} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Outstation Tab ── */}
            {activeTab === "outstation" && (
              <div>
                <p className="text-center text-slate-500 text-xs sm:text-sm mb-6 sm:mb-8 px-4">Outstation taxi pickup and drop with 24×7 customer support. Toll and parking as applicable extra.</p>
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
                      <VehicleActionButtons vehicle={item.vehicle} price={item.rate} highlight={item.highlight} />
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
                      <VehicleActionButtons vehicle={item.vehicle} price={item.price} highlight={item.highlight} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA below pricing */}
            <div className="mt-10 sm:mt-12 text-center px-4">
              <p className="text-slate-500 text-xs sm:text-sm mb-3 sm:mb-4">📞 Call us for instant booking &amp; best rates</p>
              <a
                href="tel:+919880691116"
                className="inline-flex items-center gap-2 sm:gap-3 bg-brandDark text-white px-6 sm:px-10 py-4 sm:py-5 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg shadow-2xl hover:scale-105 transition-transform active:scale-95"
              >
                <span className="material-symbols-outlined text-[20px] sm:text-[22px]">call</span>
                +91 99013 66449
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
                <div
                  key={area}
                  className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-600 text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px] text-brandBlue">flight_takeoff</span>
                  {area} to Airport
                </div>
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
                <div
                  key={dest}
                  className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-600 text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm"
                >
                  <span className="material-symbols-oriented text-[16px] text-brandBlue">map</span>
                  Bangalore to {dest}
                </div>
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
                  <a href="tel:+919880691116" className="mt-4 block font-extrabold text-brandBlue">99013 66449</a>
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
                    href="tel:+919880691116"
                    className="bg-brandBlue text-white px-10 py-5 rounded-2xl font-bold text-xl shadow-brand hover:scale-105 transition-transform inline-flex items-center gap-3"
                  >
                    <span className="material-symbols-outlined">call</span>
                    +91 99013 66449
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



