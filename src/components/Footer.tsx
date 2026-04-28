import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brandDark text-white w-full pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">

        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

          {/* Brand */}
          <div className="lg:col-span-1 flex flex-col gap-5">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="AirlinCabz Logo"
                width={40}
                height={40}
                className="object-contain"
              />
              <span className="font-headline font-extrabold text-white text-2xl tracking-tighter">
                AirlinCabz
              </span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              India&apos;s most trusted taxi service in Bangalore. Safe, secured &amp; reliable airport, outstation, and local cab services.
            </p>

            {/* Contact */}
            <div className="flex flex-col gap-2 mt-2">
              <a
                href="tel:+919880691116"
                className="inline-flex items-center gap-2 text-brandBlue font-bold hover:text-blue-300 transition-colors text-sm"
              >
                <span className="material-symbols-outlined text-[16px]">call</span>
                +91 99013 66449
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
                { label: "Privacy Policy", href: "#" },
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
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-white/40 text-xs">
            <p>
              Copyright AirlinCabz | All Rights Reserved {currentYear} | Innova Airport Taxi services, Innova Car Rental, Airport Taxi Booking, Outstation Taxi Booking, Local Hire Taxi
            </p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-white transition-colors">About us</Link>
              <Link href="#" className="hover:text-white transition-colors">Blog</Link>
              <Link href="tel:+919880691116" className="hover:text-white transition-colors">Contact us</Link>
              <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms &amp; Conditions</Link>
            </div>
          </div>

          {/* SEO Keywords */}
          <p className="mt-4 text-white/20 text-[10px] leading-relaxed">
            Airport Taxi Bangalore | Cheapest Airport Taxi In Bangalore | Airport Taxi Near Me | Airport Transfer | Bengaluru Airport Taxi | Airport Cabs | SUV Airport Taxi In Bangalore | Innova Airport Taxi In Bangalore | Outstation Cabs | Bangalore Airport Cabs | Taxi In Bangalore Airport | Book Airport Taxi In Bangalore
          </p>
        </div>

      </div>
    </footer>
  );
}



