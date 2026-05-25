import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brandDark text-white w-full pt-10 sm:pt-16 pb-28 sm:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Top Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-10 sm:mb-12">

          {/* Brand */}
          <div className="col-span-2 md:col-span-2 lg:col-span-1 flex flex-col gap-4 sm:gap-5">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Airlinecabz Logo"
                width={40}
                height={40}
                className="object-contain"
              />
              <span className="font-headline font-extrabold text-white text-2xl tracking-tighter">
                Airlinecabz
              </span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Nearest airport taxi service in Bangalore. Safe, secured & reliable 24/7 airport, outstation, and local cab services. Book cabs near you instantly.
            </p>

            {/* Contact */}
            <div className="flex flex-col gap-2 mt-2">
              <a
                href="tel:+919880691116"
                className="inline-flex items-center gap-2 text-brandBlue font-bold hover:text-blue-300 transition-colors text-sm"
              >
                <span className="material-symbols-outlined text-[16px]">call</span>
                +91 98806 91116
              </a>
              <a
                href="mailto:help@airlincabz.com"
                className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm"
              >
                <span className="material-symbols-outlined text-[16px]">mail</span>
                help@airlincabz.com
              </a>
            </div>
          </div>

          {/* Airport Taxi Links */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-widest text-white/40 mb-5">Airport Taxi</h3>
            <ul className="flex flex-col gap-2.5 text-sm text-white/70">
              {[
                "MG Road to Airport",
                "Koramangala to Airport",
                "Whitefield to Airport",
                "Marathahalli to Airport",
                "Indira Nagar to Airport",
                "Silk Board to Airport",
                "JP Nagar to Airport",
                "HAL to Airport",
              ].map((item) => (
                <li key={item}>
                  <a href="tel:+919880691116" className="hover:text-white transition-colors hover:underline underline-offset-4">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Outstation Links */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-widest text-white/40 mb-5">Outstation Cabs</h3>
            <ul className="flex flex-col gap-2.5 text-sm text-white/70">
              {[
                "Bangalore to Ooty",
                "Bangalore to Mysore",
                "Bangalore to Coorg",
                "Bangalore to Chikmagalur",
                "Bangalore to Goa",
                "Bangalore to Tirupati",
                "Bangalore to Wayanad",
                "Bangalore to Chennai",
              ].map((item) => (
                <li key={item}>
                  <a href="tel:+919880691116" className="hover:text-white transition-colors hover:underline underline-offset-4">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-widest text-white/40 mb-5">Company</h3>
            <ul className="flex flex-col gap-2.5 text-sm text-white/70">
              {[
                { label: "About Us", href: "#futures" },
                { label: "Blog", href: "#" },
                { label: "Contact Us", href: "tel:+919880691116" },
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms & Conditions", href: "#" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="hover:text-white transition-colors hover:underline underline-offset-4">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Book CTA */}
            <div className="mt-8">
              <a
                href="tel:+919880691116"
                className="inline-flex items-center gap-2 bg-brandBlue text-white px-6 py-3 rounded-xl font-bold text-sm hover:brightness-110 transition-all shadow-brand"
              >
                <span className="material-symbols-outlined text-[16px]">call</span>
                Book Now
              </a>
            </div>
          </div>

        </div>

        {/* Divider */}
        <div className="border-t border-white/10 pt-6 sm:pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 text-white/40 text-[10px] sm:text-xs">
            <p className="text-center md:text-left">
              Copyright airlinecabz | All Rights Reserved {currentYear} | Nearest Airport Taxi Bangalore | Airport Cab Booking | Outstation Taxi Booking
            </p>
            <div className="hidden sm:flex gap-6">
              <Link href="#" className="hover:text-white transition-colors">About us</Link>
              <Link href="#" className="hover:text-white transition-colors">Blog</Link>
              <Link href="tel:+919880691116" className="hover:text-white transition-colors">Contact us</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms &amp; Conditions</Link>
            </div>
          </div>

          {/* SEO Keywords */}
          <p className="mt-4 text-white/20 text-[10px] leading-relaxed">
            Nearest Airport Taxi Bangalore | Airport Cab Near Me | Taxi Near Me Bangalore | Cheapest Airport Taxi In Bangalore | Airport Transfer Bangalore | Bengaluru Airport Taxi | Airport Cabs Near Me | SUV Airport Taxi | Innova Airport Taxi | Outstation Cabs Bangalore | Bangalore Airport Cabs | Taxi In Bangalore Airport | Book Airport Taxi Bangalore | Cab Booking Bangalore | airlinecabz | Airlin Cabz
          </p>
        </div>

      </div>
    </footer>
  );
}



