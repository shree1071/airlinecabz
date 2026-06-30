"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import AuthModal from "@/components/AuthModal";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import { SplitText } from "@/components/animations/SplitText";
import { BlurFade } from "@/components/animations/BlurFade";
import { ScrollProgressTaxi } from "@/components/animations/ScrollProgressTaxi";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

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

/* ── Airport Service Areas (curated popular routes) ── */
const airportAreas = [
  { area: "Koramangala", dist: "~55 km" },
  { area: "Whitefield", dist: "~40 km" },
  { area: "MG Road", dist: "~45 km" },
  { area: "Marathahalli", dist: "~38 km" },
  { area: "Indira Nagar", dist: "~42 km" },
  { area: "JP Nagar", dist: "~60 km" },
  { area: "Banashankari", dist: "~62 km" },
  { area: "Yeshwanthpur", dist: "~35 km" },
  { area: "Silk Board", dist: "~52 km" },
  { area: "ITPL", dist: "~33 km" },
  { area: "Rajaji Nagar", dist: "~40 km" },
  { area: "KR Puram", dist: "~30 km" },
];

/* ── Outstation Destinations (curated top routes) ── */
const outstationDestinations = [
  { dest: "Mysore", dist: "150 km", time: "~3 hrs" },
  { dest: "Coorg", dist: "265 km", time: "~5 hrs" },
  { dest: "Ooty", dist: "280 km", time: "~6 hrs" },
  { dest: "Goa", dist: "560 km", time: "~9 hrs" },
  { dest: "Nandi Hills", dist: "60 km", time: "~1.5 hrs" },
  { dest: "Chikmagalur", dist: "245 km", time: "~5 hrs" },
  { dest: "Hampi", dist: "340 km", time: "~6 hrs" },
  { dest: "Tirupati", dist: "250 km", time: "~5 hrs" },
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
  return `https://wa.me/919880691116?text=${encodeURIComponent(message)}`;
}

/* ── Shared Vehicle Card Image Block ── */
function VehicleImage({ src, alt, highlight }: { src: string; alt: string; highlight?: boolean }) {
  return (
    <div className={`relative w-full h-32 rounded-2xl overflow-hidden mb-4 ${highlight ? "bg-white/20" : "bg-slate-50"}`}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain p-2 drop-shadow-md transition-all duration-700 ease-[cubic-bezier(0.33,1,0.68,1)] group-hover:scale-110 group-hover:translate-x-3"
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
      <button
        onClick={(e) => {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent("triggerBooking", { detail: `/book?vehicle=${encodeURIComponent(vehicle)}` }));
        }}
        className={`w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all ${
          highlight
            ? "bg-white/80 text-brandBlue hover:bg-white"
            : "bg-brandBlue text-white hover:bg-blue-700"
        }`}
      >
        <span className="material-symbols-outlined text-[13px] sm:text-[14px] flex-shrink-0">calendar_month</span>
        <span className="whitespace-nowrap">Book Online</span>
      </button>
    </div>
  );
}

const testimonials = [
  { name: "Rajesh Kumar", rating: 5, text: "Excellent service! The Innova Crysta was very clean and the driver arrived 15 minutes before the scheduled time for my early morning flight.", role: "Frequent Traveler" },
  { name: "Priya Sharma", rating: 5, text: "Very professional and safe. As a solo female traveler taking a late-night cab from the airport, I felt completely secure. Highly recommended.", role: "Business Analyst" },
  { name: "Amit Patel", rating: 5, text: "Booked an outstation trip to Coorg. The pricing was completely transparent with no hidden charges, and the driver knew all the good restaurants on the way.", role: "Family Vacation" },
  { name: "Sneha Reddy", rating: 5, text: "The booking process is so seamless! Got instant confirmation and the WhatsApp updates are very helpful. Will definitely use Airlinecabz again.", role: "Tech Lead" },
  { name: "Karthik Iyer", rating: 5, text: "Best airport taxi service in Bangalore. I used to rely on ride-hailing apps but their cancellations were a nightmare. Airlinecabz is 100% reliable.", role: "Marketing Director" },
];

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<Tab>("airport");
  const [tripType, setTripType] = useState("One Way");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingUrl, setPendingUrl] = useState("/book");
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    import("@/lib/insforge").then(({ insforge }) => {
      insforge.auth.getCurrentUser().then(({ data }) => {
        if (data?.user) setUser(data.user);
      });
    });
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const url = (e as CustomEvent).detail || "/book";
      if (!user) {
        setPendingUrl(url);
        setShowAuthModal(true);
      } else {
        router.push(url);
      }
    };
    window.addEventListener("triggerBooking", handler);
    return () => window.removeEventListener("triggerBooking", handler);
  }, [user, router]);

  // Handle hash on load and listen for tab switch events
  useEffect(() => {
    // Check initial hash
    const hash = window.location.hash;
    if (hash === "#outstation-pricing") setActiveTab("outstation");
    else if (hash === "#local-pricing") setActiveTab("local");
    else if (hash === "#airport-pricing") setActiveTab("airport");

    // Listen for custom event to switch tabs from other components
    const handleSwitchTab = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setActiveTab(customEvent.detail as Tab);
      }
    };
    window.addEventListener("switchPricingTab", handleSwitchTab);
    return () => window.removeEventListener("switchPricingTab", handleSwitchTab);
  }, []);

  // Sync tab changes to URL and notify other components
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("pricingTabChanged", { detail: activeTab }));
    // Optionally update hash without scrolling
    if (window.history.replaceState) {
      window.history.replaceState(null, "", `#${activeTab}-pricing`);
    }
  }, [activeTab]);

  return (
    <>
      <ScrollProgressTaxi />
      <Navbar />
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false);
          router.push(pendingUrl);
        }}
      />

      {/* ═══ FULL-BLEED HERO ═══ */}
      <section className="relative w-full min-h-[88svh] sm:min-h-[600px] sm:h-[100svh] sm:max-h-[900px] overflow-hidden">
        <Image
          src="/airport-terminal-hero.webp"
          alt="Bangalore Airport Terminal"
          fill
          className="object-cover object-[center_40%] sm:object-center"
          priority
          quality={90}
          sizes="(max-width: 768px) 100vw, 100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/25 to-black/80 z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent z-10" />

        {/* Hero content — vertically centered on mobile, bottom-aligned on desktop */}
        <div className="relative z-20 h-full flex flex-col justify-center sm:justify-end sm:pb-20 pt-20 sm:pt-0">
          <div className="px-5 sm:px-10 lg:px-20 max-w-5xl">
            <p className="text-white/60 text-[11px] sm:text-sm font-semibold tracking-[0.15em] uppercase mb-2 sm:mb-3 drop-shadow">
              airlinecabz — Nearest Airport Taxi
            </p>
            <h1 className="text-[2.6rem] sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-[1.08] tracking-tight drop-shadow-2xl mb-2">
              <SplitText text="Nearest Cab" delay={0.04} />
              <br />
              <span className="text-amber-300">
                <SplitText text="Near You" delay={0.04} />
              </span>
              <br />
              <span className="text-2xl sm:text-5xl lg:text-6xl text-white/90">
                <SplitText text="24/7 Airport Taxi" delay={0.04} />
              </span>
            </h1>
            <p className="mt-3 sm:mt-4 text-white/75 text-sm sm:text-base max-w-md leading-relaxed drop-shadow">
              Book nearest airport taxi in Bangalore — safe, on time.
              <span className="font-bold text-amber-300"> Starting at ₹799.</span>
            </p>
            <div className="mt-5 sm:mt-6 flex flex-row items-center gap-3 flex-wrap">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  window.dispatchEvent(new CustomEvent("triggerBooking", { detail: "/book" }));
                }}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-brandBlue to-blue-600 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-sm px-6 py-3.5 rounded-2xl transition-all shadow-lg shadow-brandBlue/40 active:scale-95 animate-pulse-slow"
              >
                <span className="material-symbols-outlined text-[18px]">directions_car</span>
                Book Online
              </button>
              <a
                href="tel:+919880691116"
                className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold text-sm px-5 py-3.5 rounded-2xl transition-all shadow-lg shadow-green-500/40 active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">call</span>
                Call Now
              </a>
              <a
                href="#cars"
                onClick={(e) => { e.preventDefault(); document.getElementById('cars')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/30 text-white font-bold text-sm px-5 py-3.5 rounded-2xl transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">explore</span>
                View Prices
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar — inline on mobile, floating card on sm+ */}
      <div className="bg-white sm:bg-transparent sm:max-w-5xl sm:mx-auto sm:px-6 sm:relative sm:z-30 sm:-mt-14 sm:mb-14">
        <div id="about" className="bg-white rounded-none sm:rounded-3xl px-5 py-4 sm:p-8 border-b border-slate-100 sm:border sm:border-slate-100/60 sm:shadow-[0_16px_48px_-12px_rgba(0,0,0,0.12)]">
          <div className="grid grid-cols-4 gap-1 sm:gap-6 relative">
            {[
              { value: "50k+", label: "Happy Rides" },
              { value: "10+", label: "Yrs Exp." },
              { value: "4.9★", label: "Rating" },
              { value: "24/7", label: "Support" },
            ].map((stat, i) => (
              <div key={stat.label} className="flex flex-col items-center justify-center relative py-1">
                <span className="text-[1.1rem] sm:text-3xl lg:text-4xl font-extrabold font-headline text-brandDark tracking-tight">{stat.value}</span>
                <span className="text-[8px] sm:text-xs font-bold text-slate-400 uppercase tracking-[0.1em] text-center mt-0.5">{stat.label}</span>
                {i < 3 && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-6 sm:h-12 bg-slate-200 sm:bg-gradient-to-b sm:from-transparent sm:via-slate-200 sm:to-transparent" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="pb-20 md:pb-0">

      {/* ───── Main Content ───── */}
      <div className="bg-slate-50/50 sm:rounded-t-[4rem] sm:border-t sm:border-white">

        {/* ═══ PRICING SECTION ═══ */}
        <section id="cars" className="py-12 sm:py-20 bg-transparent">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 w-full">
            <div className="text-center mb-6 sm:mb-10">
              <span className="inline-block text-brandBlue bg-brandBlue/5 text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-3">Our Fleet</span>
              <h2 className="font-headline text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-2 sm:mb-3 text-brandDark">
                Transparent Pricing
              </h2>
              <p className="text-slate-500 max-w-lg mx-auto text-sm">
                No hidden charges. Toll extra as applicable.
              </p>
            </div>

            {/* Shadcn Tabs Component */}
            <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as Tab)} className="w-full flex-col">
              <div className="flex justify-center mb-8 sm:mb-12">
                <TabsList className="bg-slate-100 rounded-2xl p-1.5 w-full max-w-md h-auto flex">
                  <TabsTrigger value="airport" className="rounded-xl font-bold text-sm py-3 sm:py-3.5 flex-1 data-[active]:bg-white data-[active]:text-brandDark data-[active]:shadow-md">
                    ✈️ Airport
                  </TabsTrigger>
                  <TabsTrigger value="outstation" className="rounded-xl font-bold text-sm py-3 sm:py-3.5 flex-1 data-[active]:bg-white data-[active]:text-brandDark data-[active]:shadow-md">
                    🗺️ Outstation
                  </TabsTrigger>
                  <TabsTrigger value="local" className="rounded-xl font-bold text-sm py-3 sm:py-3.5 flex-1 data-[active]:bg-white data-[active]:text-brandDark data-[active]:shadow-md">
                    🚕 Local
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* ── Airport Taxi Tab ── */}
              <TabsContent value="airport" className="mt-0 outline-none animate-fade-in-up">
                <p className="text-center text-slate-500 text-xs sm:text-sm mb-5 sm:mb-8">Airport Taxi pickup and drop with 24×7 customer support</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {airportPrices.map((item) => (
                    <div
                      key={item.vehicle}
                      className={`group relative rounded-3xl p-5 border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl backdrop-blur-xl ${
                        item.highlight
                          ? "bg-brandBlue/90 text-white shadow-[0_0_40px_rgba(37,75,255,0.4)] border-white/20"
                          : "bg-white/80 shadow-lg border-white/50 hover:border-brandBlue/50"
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
              </TabsContent>

              {/* ── Outstation Tab ── */}
              <TabsContent value="outstation" className="mt-0 outline-none animate-fade-in-up">
                <p className="text-center text-slate-500 text-xs sm:text-sm mb-5 sm:mb-8">Outstation taxi pickup and drop with 24×7 customer support. Toll and parking as applicable extra.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {outstationPrices.map((item) => (
                    <div
                      key={item.vehicle}
                      className={`group relative rounded-3xl p-5 border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl backdrop-blur-xl ${
                        item.highlight
                          ? "bg-brandBlue/90 text-white shadow-[0_0_40px_rgba(37,75,255,0.4)] border-white/20"
                          : "bg-white/80 shadow-lg border-white/50 hover:border-brandBlue/50"
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
              </TabsContent>

              {/* ── Local Hire Tab ── */}
              <TabsContent value="local" className="mt-0 outline-none animate-fade-in-up">
                <p className="text-center text-slate-500 text-xs sm:text-sm mb-5 sm:mb-8">Local taxi pickup and drop with 24×7 customer support.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {localPrices.map((item) => (
                    <div
                      key={item.vehicle}
                      className={`group relative rounded-3xl p-5 border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl backdrop-blur-xl ${
                        item.highlight
                          ? "bg-brandBlue/90 text-white shadow-[0_0_40px_rgba(37,75,255,0.4)] border-white/20"
                          : "bg-white/80 shadow-lg border-white/50 hover:border-brandBlue/50"
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
              </TabsContent>
            </Tabs>

            {/* CTA below pricing */}
            <div className="mt-8 sm:mt-12 text-center">
              <p className="text-slate-400 text-xs sm:text-sm mb-3">📞 Call for instant booking & best rates</p>
              <a
                href="tel:+919880691116"
                className="inline-flex items-center gap-2 bg-brandDark text-white px-8 py-4 rounded-2xl font-bold text-base shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-[20px]">call</span>
                +91 98806 91116
              </a>
            </div>
          </div>
        </section>

        {/* ═══ TESTIMONIALS (NEW) ═══ */}
        <section className="py-16 sm:py-24 bg-slate-50/50 overflow-hidden">
          <div className="max-w-[1400px] mx-auto">
            <div className="text-center mb-12 sm:mb-16 px-4">
              <span className="inline-block text-brandBlue bg-brandBlue/5 border border-brandBlue/10 text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">Wall of Love</span>
              <h2 className="font-headline text-3xl sm:text-5xl font-extrabold tracking-tight mb-3 text-brandDark">
                Loved by Travelers
              </h2>
              <p className="text-slate-500 max-w-lg mx-auto text-sm sm:text-base">
                Don't just take our word for it. See what our customers say about our reliable 5-star service.
              </p>
            </div>
            
            <div 
              className="relative flex flex-col gap-6 sm:gap-8 py-4"
              style={{
                maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
                WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)'
              }}
            >
              {/* Row 1 */}
              <div className="flex shrink-0 animate-marquee hover:[animation-play-state:paused] gap-6 sm:gap-8 px-4 w-max">
                {[...testimonials, ...testimonials].map((t, idx) => (
                  <div 
                    key={`row1-${idx}`} 
                    className="relative w-[320px] sm:w-[420px] bg-white border border-slate-100 rounded-[2rem] p-7 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(37,75,255,0.08)] transition-all duration-300 shrink-0 cursor-default group overflow-hidden"
                  >
                    <div className="absolute -top-6 -right-2 text-slate-50 opacity-50 font-serif text-[140px] leading-none select-none group-hover:text-brandBlue/5 transition-colors duration-500">
                      "
                    </div>
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex items-center gap-1 mb-5">
                        {[...Array(t.rating)].map((_, i) => (
                          <span key={i} className="material-symbols-outlined text-amber-400 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        ))}
                      </div>
                      <p className="text-slate-700 text-[15px] sm:text-base leading-relaxed mb-8 font-medium">
                        "{t.text}"
                      </p>
                      <div className="flex items-center gap-4 mt-auto">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brandBlue to-blue-400 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-brandBlue/20">
                          {t.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-brandDark text-[15px] tracking-tight">{t.name}</p>
                          <p className="text-[13px] text-slate-500 font-medium">{t.role}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Row 2 (Reverse) */}
              <div className="flex shrink-0 animate-marquee-reverse hover:[animation-play-state:paused] gap-6 sm:gap-8 px-4 w-max">
                {[...testimonials, ...testimonials].reverse().map((t, idx) => (
                  <div 
                    key={`row2-${idx}`} 
                    className="relative w-[320px] sm:w-[420px] bg-white border border-slate-100 rounded-[2rem] p-7 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(37,75,255,0.08)] transition-all duration-300 shrink-0 cursor-default group overflow-hidden"
                  >
                    <div className="absolute -top-6 -right-2 text-slate-50 opacity-50 font-serif text-[140px] leading-none select-none group-hover:text-emerald-500/5 transition-colors duration-500">
                      "
                    </div>
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex items-center gap-1 mb-5">
                        {[...Array(t.rating)].map((_, i) => (
                          <span key={i} className="material-symbols-outlined text-amber-400 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        ))}
                      </div>
                      <p className="text-slate-700 text-[15px] sm:text-base leading-relaxed mb-8 font-medium">
                        "{t.text}"
                      </p>
                      <div className="flex items-center gap-4 mt-auto">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-400 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-emerald-500/20">
                          {t.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-brandDark text-[15px] tracking-tight">{t.name}</p>
                          <p className="text-[13px] text-slate-500 font-medium">{t.role}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ WHY BOOK WITH US ═══ */}
        <section id="futures" className="py-14 sm:py-20 bg-slate-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10 sm:mb-14">
              <span className="inline-block text-brandBlue bg-brandBlue/5 text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-3">The Advantage</span>
              <h2 className="font-headline text-2xl sm:text-4xl font-bold tracking-tight mb-2 text-brandDark">
                Why Choose Us?
              </h2>
              <p className="text-slate-500 max-w-lg mx-auto text-sm">
                Premium, secure, and reliable rides across Bangalore.
              </p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {whyUs.map((item, idx) => (
                <BlurFade key={item.title} delay={0.1 * idx} inView>
                  <div
                    className="bg-white/80 backdrop-blur-md rounded-2xl p-5 sm:p-6 text-center border border-white/40 shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all duration-300 group hover:-translate-y-0.5"
                  >
                    <div className="w-12 h-12 mx-auto bg-brandBlue/5 group-hover:bg-brandBlue/10 text-brandBlue rounded-xl flex items-center justify-center mb-4 transition-colors">
                      <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
                    </div>
                    <h3 className="font-bold text-sm sm:text-base mb-1.5 text-slate-800">{item.title}</h3>
                    <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </BlurFade>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ HOW IT WORKS ═══ */}
        <section id="help" className="py-14 sm:py-20 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10 sm:mb-14">
              <span className="inline-block text-brandBlue bg-brandBlue/5 text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-3">Simple Booking</span>
              <h2 className="font-headline text-2xl sm:text-4xl font-bold tracking-tight mb-2 text-brandDark">
                How It Works
              </h2>
              <p className="text-slate-400 max-w-md mx-auto text-sm">Four steps to your destination.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative">
              {/* Connector Line for Desktop */}
              <div className="hidden md:block absolute top-8 left-[14%] right-[14%] h-[2px] bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
              {steps.map((step, idx) => (
                <BlurFade key={step.title} delay={0.1 * idx} inView>
                  <div className="relative text-center group">
                    <div className="w-16 h-16 mx-auto bg-white border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.06)] rounded-2xl flex items-center justify-center mb-4 relative z-10 group-hover:scale-105 transition-transform duration-300">
                      <span className="material-symbols-outlined text-[24px] text-brandBlue">{step.icon}</span>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-brandDark text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm">
                        {idx + 1}
                      </div>
                    </div>
                    <h3 className="font-bold text-sm sm:text-base mb-1 text-slate-800">{step.title}</h3>
                    <p className="text-slate-400 text-xs sm:text-sm">{step.desc}</p>
                  </div>
                </BlurFade>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ POPULAR AIRPORT ROUTES ═══ */}
        <section id="airport-areas" className="py-12 sm:py-20 bg-white/60">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-12">
              <span className="inline-block text-brandBlue bg-brandBlue/5 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">Popular Routes</span>
              <h2 className="font-headline text-2xl sm:text-4xl font-bold tracking-tight mb-3 sm:mb-4 text-brandDark">
                Airport Cab from Bangalore
              </h2>
              <p className="text-slate-500 max-w-xl mx-auto text-sm">
                Pickup & drop from all major areas to Kempegowda International Airport.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {airportAreas.map((item) => (
                <a
                  key={item.area}
                  href="tel:+919880691116"
                  className="group flex items-center gap-3 bg-white border border-slate-100 rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-lg hover:border-brandBlue/30 hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-xl bg-brandBlue/5 flex items-center justify-center shrink-0 group-hover:bg-brandBlue/10 transition-colors">
                    <span className="material-symbols-outlined text-[18px] text-brandBlue">flight_takeoff</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{item.area}</p>
                    <p className="text-[11px] text-slate-400">{item.dist} to Airport</p>
                  </div>
                </a>
              ))}
            </div>
            <div className="text-center mt-8">
              <a href="tel:+919880691116" className="inline-flex items-center gap-2 text-sm font-semibold text-brandBlue hover:underline">
                <span className="material-symbols-outlined text-[16px]">add_circle</span>
                All Bangalore areas covered — Call to book
              </a>
            </div>
          </div>
        </section>

        {/* ═══ POPULAR OUTSTATION ROUTES ═══ */}
        <section id="outstation-areas" className="py-12 sm:py-20 bg-slate-50/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-12">
              <span className="inline-block text-emerald-600 bg-emerald-50 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">Top Destinations</span>
              <h2 className="font-headline text-2xl sm:text-4xl font-bold tracking-tight mb-3 sm:mb-4 text-brandDark">
                Outstation Taxi from Bangalore
              </h2>
              <p className="text-slate-500 max-w-xl mx-auto text-sm">
                Comfortable cab service to the most popular destinations across South India.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {outstationDestinations.map((item) => (
                <a
                  key={item.dest}
                  href="tel:+919880691116"
                  className="group relative bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-lg hover:border-emerald-200 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
                      <span className="material-symbols-outlined text-[18px] text-emerald-600">map</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{item.dest}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{item.dist} · {item.time}</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-xs font-bold text-brandDark">From ₹12/km</span>
                    <span className="text-[11px] text-brandBlue font-semibold group-hover:translate-x-0.5 transition-transform">Book →</span>
                  </div>
                </a>
              ))}
            </div>
            <div className="text-center mt-8">
              <a href="tel:+919880691116" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:underline">
                <span className="material-symbols-outlined text-[16px]">add_circle</span>
                More destinations available — Call to book
              </a>
            </div>
          </div>
        </section>

        {/* ═══ ABOUT ═══ */}
        <section className="py-12 sm:py-20 bg-slate-50/50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-14 items-start">
              <div>
                <span className="inline-block text-brandBlue bg-brandBlue/5 text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">About Us</span>
                <h2 className="font-headline text-2xl sm:text-3xl font-bold tracking-tight mb-4 text-brandDark">
                  Nearest Airport Taxi in Bangalore
                </h2>
                <p className="text-slate-500 leading-relaxed mb-4 text-sm">
                  Airlinecabz is the most trusted cab service provider in Bangalore. Whether you need an airport taxi late at night or a cab for a family vacation, we are always near you with 24/7 service.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    "A/C & Non-A/C luxury cabs",
                    "Innova, Dzire, Etios & more",
                    "Airport & Outstation service",
                    "Corporate travel solutions",
                  ].map((point) => (
                    <div key={point} className="flex items-center gap-2.5 text-sm text-slate-600">
                      <span className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-[11px] shrink-0">✓</span>
                      {point}
                    </div>
                  ))}
                </div>
              </div>
              {/* Service summary cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-brandBlue rounded-2xl p-5 text-white">
                  <span className="material-symbols-outlined text-2xl mb-2 block opacity-80">flight</span>
                  <h3 className="font-bold text-sm mb-1">Airport Taxi</h3>
                  <p className="text-white/60 text-xs">24×7 pickup & drop</p>
                  <p className="mt-2 font-extrabold text-lg">₹799+</p>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                  <span className="material-symbols-outlined text-2xl mb-2 block text-brandBlue">explore</span>
                  <h3 className="font-bold text-sm mb-1 text-brandDark">Outstation</h3>
                  <p className="text-slate-400 text-xs">South India trips</p>
                  <p className="mt-2 font-extrabold text-lg text-brandDark">₹12/km</p>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                  <span className="material-symbols-outlined text-2xl mb-2 block text-brandBlue">location_city</span>
                  <h3 className="font-bold text-sm mb-1 text-brandDark">Local Hire</h3>
                  <p className="text-slate-400 text-xs">4hr & 8hr packages</p>
                  <p className="mt-2 font-extrabold text-lg text-brandDark">₹1,300+</p>
                </div>
                <div className="bg-slate-900 rounded-2xl p-5 text-white">
                  <span className="material-symbols-outlined text-2xl mb-2 block opacity-80">support_agent</span>
                  <h3 className="font-bold text-sm mb-1">24×7 Support</h3>
                  <p className="text-white/60 text-xs">Always available</p>
                  <a href="tel:+919880691116" className="mt-2 block font-extrabold text-brandBlue text-sm">98806 91116</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ CTA BANNER ═══ */}
        <section className="py-10 sm:py-16 bg-transparent">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="bg-brandDark rounded-3xl p-8 sm:p-14 text-center relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brandBlue/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
              <div className="relative z-10">
                <h2 className="font-headline text-2xl sm:text-4xl font-bold text-white mb-3">
                  Book Nearest Airport Taxi
                </h2>
                <p className="text-white/50 mb-6 sm:mb-8 max-w-md mx-auto text-sm">
                  Innova Crysta from ₹1,999. Available 24/7 near you.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-3">
                  <a
                    href="tel:+919880691116"
                    className="bg-brandBlue text-white px-8 py-4 rounded-2xl font-bold text-base shadow-brand hover:scale-[1.02] transition-all inline-flex items-center justify-center gap-2 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[20px]">call</span>
                    +91 98806 91116
                  </a>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      window.dispatchEvent(new CustomEvent("triggerBooking", { detail: "/book" }));
                    }}
                    className="bg-white/10 text-white border border-white/20 px-8 py-4 rounded-2xl font-bold text-base hover:bg-white/15 transition-all inline-flex items-center justify-center gap-2 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                    Book Online
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ FAQ SECTION FOR SEO ═══ */}
        <section className="py-12 sm:py-20 bg-white/60">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="font-headline text-2xl sm:text-4xl font-bold tracking-tight mb-3 sm:mb-4 text-brandDark">
                Frequently Asked Questions
              </h2>
              <p className="text-slate-500 text-sm sm:text-base">
                Everything you need to know about Airlinecabz airport taxi service
              </p>
            </div>
            <Accordion className="space-y-3">
              {[
                {
                  q: "How can I book the nearest airport taxi in Bangalore?",
                  a: "You can book the nearest airport taxi by calling +91 98806 91116 or booking online through our website. Airlinecabz provides 24/7 airport taxi service across all Bangalore areas including Koramangala, Whitefield, MG Road, Marathahalli, and more."
                },
                {
                  q: "What is the fare for airport taxi from Bangalore?",
                  a: "Airport taxi fares start from ₹799 for hatchback, ₹899 for Swift Dzire, ₹1,799 for Innova, and ₹1,999 for Innova Crysta. Toll charges (₹120-250) are extra. We offer transparent pricing with no hidden charges."
                },
                {
                  q: "Is Airlinecabz available 24/7 for airport pickup?",
                  a: "Yes, Airlinecabz provides 24/7 airport taxi service in Bangalore. Whether you need an early morning pickup or late night airport drop, we are always available near you."
                },
                {
                  q: "Which areas in Bangalore do you serve for airport taxi?",
                  a: "We serve all major areas in Bangalore including MG Road, Koramangala, Whitefield, Marathahalli, Indira Nagar, Silk Board, JP Nagar, HAL, Yeshwanthpur, Banashankari, and many more. We are the nearest cab service provider across Bangalore."
                },
                {
                  q: "Do you provide outstation cab service from Bangalore?",
                  a: "Yes, Airlinecabz provides outstation cab service from Bangalore to popular destinations like Ooty, Mysore, Coorg, Chikmagalur, Goa, Tirupati, Wayanad, and Chennai. Rates start from ₹12/km."
                },
                {
                  q: "What types of vehicles are available for airport taxi?",
                  a: "We have a wide range of vehicles including Hatchback, Swift Dzire, Toyota Etios, Ertiga SUV, Toyota Innova, Innova Crysta, Innova Hycross, Tempo Traveller, and Force Urbania for group travel."
                },
                {
                  q: "How do I find the nearest cab near me in Bangalore?",
                  a: "Simply call +91 98806 91116 or book online at Airlinecabz.com. We have cabs available near you across all Bangalore locations with quick response time."
                },
                {
                  q: "Is Airlinecabz reliable for airport transfers?",
                  a: "Yes, Airlinecabz has served 50,000+ happy customers with a 4.9 rating and ultra-low cancellation rate. We are known for being on time, safe, and reliable for all airport transfers."
                }
              ].map((faq, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`} className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 px-4 sm:px-6">
                  <AccordionTrigger className="hover:no-underline font-bold text-brandDark text-sm sm:text-base text-left">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600 text-xs sm:text-sm leading-relaxed pb-4">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Extra bottom padding for mobile bottom nav */}
        <div className="h-20 md:h-0" />

        <Footer />
        <MobileBottomNav />
      </div>
      </main>
    </>
  );
}



