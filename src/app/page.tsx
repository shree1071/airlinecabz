import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";

/* ── Stat Data ── */
const stats = [
  { value: "50k+", label: "Bookings" },
  { value: "4.9", label: "Rating", icon: true },
  { value: "15min", label: "Response" },
  { value: "10+", label: "Years Exp." },
];

/* ── How It Works Steps ── */
const steps = [
  { icon: "edit_note", title: "1. Enter Details", desc: "Input your pickup and destination for an instant luxury quote." },
  { icon: "minor_crash", title: "2. Choose Car", desc: "Select from our elite fleet tailored to your travel needs." },
  { icon: "payments", title: "3. Pay Securely", desc: "Multiple payment options with encrypted transaction safety." },
  { icon: "verified_user", title: "4. Enjoy Ride", desc: "Sit back and relax as our professional chauffeurs take the wheel." },
];

/* ── Bento Features ── */
const bentoLarge = [
  {
    icon: "badge",
    title: "Professional Drivers",
    desc: "Vetted, uniformed, and trained in hospitality to ensure your absolute comfort and safety.",
    primary: false,
  },
  {
    icon: "support_agent",
    title: "24/7 Concierge Support",
    desc: "Human assistance available around the clock for bookings, changes, and queries.",
    primary: true,
  },
];

const bentoSmall = [
  { icon: "account_balance_wallet", title: "Transparent Pricing", desc: "No hidden fees. Flat rates for airport transfers and hourly bookings." },
  { icon: "auto_awesome", title: "Luxury Fleet", desc: "The latest models from Mercedes, BMW, and Tesla, meticulously maintained." },
  { icon: "security", title: "Safe & Secure", desc: "Advanced GPS tracking and rigorous safety protocols for every trip." },
];

/* ── Testimonials ── */
const testimonials = [
  {
    text: "AirlinCabz has redefined my business travel. The punctuality and vehicle quality are unmatched in the city. Always my first choice.",
    name: "Marcus Sterling",
    role: "CEO, Fintech Solutions",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuADd9LrXZ79wx_k0PysTrQXCcqNuNaYTKREXgOrB1USlDYOBLcTb5eI_4iwc2crgVhsmrW6YBYhVRyxVEz2TNyU2biIY4BSviguvxK9CT5zqQg2UG_czvPvtjdVZcLiINbjfjboNBPn7G3-oi5UWt4IJ31krSLP18Tp5ILTmpwC1UHS4hEL4KXh6fxn9piQLHMSj5cDoRu2DGTvmFkA9KpBSRLQ8GK3kvRg_KJFvTEhM23Yxv2k4ZYrvvQqzPdrvkU-S4FikIJ89nW7",
  },
  {
    text: "The app is incredibly intuitive. I can book a premium sedan for my airport transfer in under 30 seconds. Reliability at its finest.",
    name: "Elena Rodriguez",
    role: "Global Logistics Manager",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB8G-r7HYFl5H-MX8NYjyks09ga2OPQNz1iK74QKDD8-04NQw9bgsqIathcOcwJM_aKNMUJ7u2ViWQwp8yucNFZzOiZIxkrCd2WhoSRMk3K5hOqxWo8-t8yHjLlJ1hRdtBreewS52by6abwl_5u_k4y_OnokY6YStg_DIqlAUp_P8EzQC8HgQbkMz9ix7IJj_1Bneb1jbWS-Nrgvk_mwhSynys3SOsMx2PYWJo2nXOhMrvoZegllQD--yNkIufQqlmtT-kcShpBd-7f",
  },
  {
    text: "Exceptional service during our corporate event. They managed 15 simultaneous transfers without a single delay. Truly professional.",
    name: "David Chen",
    role: "Director of Operations",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBSHr04g4qNmEDd9m79KderQ9-8COIDyx7wq8iPNdn2Krwv4JsyTLVoF0dAAp0RCzLDO5IvpOdo4mU6Bt7SsMlJTUvtKOJVtF7xXjs8g-uVXm-wFy6IiGZwfl6hGmsH-6trYrmVRE9i4WeNnn7O6HHLBJGF0_-WnKY6XbEKn8x3sQ10AjLv2hEJfsy_qKMHnt_d5jhnDxBaCIF1J9dkZprua08L3s8iv7LvJ_dVURfccGD1qy6ZtE4_r-RqM5VTbFoQBgfc5oYsBai-",
  },
];

export default function LandingPage() {
  return (
    <>
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Hero Text & Form */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            <div data-purpose="hero-headlines">
              <h1 className="text-5xl lg:text-6xl font-extrabold font-headline leading-[1.1] text-brandDark">
                Rent A Car,<br/>
                Drive With Ease!
              </h1>
              <p className="mt-6 text-slate-500 max-w-md leading-relaxed text-sm">
                Affordable, Reliable, And Hassle-Free Car Rentals For Every Journey. Book Your Ride Now!
              </p>
            </div>
            
            {/* Features Widget */}
            <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-soft border border-white/80 max-w-md relative" data-purpose="hero-features">
              <ul className="space-y-1 mb-6">
                <li className="flex items-start gap-4 p-3 rounded-2xl hover:bg-white/50 transition duration-300">
                  <div className="w-10 h-10 rounded-full bg-brandBlue/10 flex items-center justify-center text-brandBlue shrink-0">
                    <span className="material-symbols-outlined text-[20px]">verified_user</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-brandDark">Professional Drivers</h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">Vetted, uniformed, and trained for absolute comfort.</p>
                  </div>
                </li>
                
                <li className="flex items-start gap-4 p-3 rounded-2xl hover:bg-white/50 transition duration-300">
                  <div className="w-10 h-10 rounded-full bg-brandBlue/10 flex items-center justify-center text-brandBlue shrink-0">
                    <span className="material-symbols-outlined text-[20px]">support_agent</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-brandDark">24/7 Concierge</h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">Human assistance around the clock for any queries.</p>
                  </div>
                </li>
                
                <li className="flex items-start gap-4 p-3 rounded-2xl hover:bg-white/50 transition duration-300">
                  <div className="w-10 h-10 rounded-full bg-brandBlue/10 flex items-center justify-center text-brandBlue shrink-0">
                    <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-brandDark">Transparent Pricing</h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">No hidden fees. Flat rates for all city transfers.</p>
                  </div>
                </li>
              </ul>
              
              <div className="flex gap-3">
                <Link href="/book" className="flex-1 bg-brandBlue text-white py-3.5 rounded-xl font-bold text-sm shadow-brand hover:brightness-110 transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                  Book Ride
                </Link>
                <Link href="#cars" className="flex-1 bg-white text-brandDark border border-slate-200 py-3.5 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center">
                  View Fleet
                </Link>
              </div>
            </div>
          </div>
          
          {/* Visual Section */}
          <div className="lg:col-span-7 relative flex justify-center lg:justify-end mt-12 lg:mt-0" data-purpose="hero-visual">
            <div className="relative glass-card rounded-[40px] w-full max-w-[580px] h-[300px] sm:h-[400px] flex items-center justify-center overflow-visible mt-10 lg:mt-0">
              
              {/* Floating Badge 1 */}
              <div className="absolute -top-6 sm:-top-12 left-4 sm:left-1/4 bg-white/90 backdrop-blur px-6 py-4 rounded-2xl shadow-soft border border-white/50 z-20 text-center w-36 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <p className="text-[11px] font-bold text-slate-800 leading-tight">Wide Range Of<br/>Vehicles</p>
              </div>
              
              {/* Floating Badge 2 */}
              <div className="absolute top-16 sm:top-10 -left-4 sm:-left-6 bg-white/90 backdrop-blur px-6 py-4 rounded-2xl shadow-soft border border-white/50 z-20 text-center w-36 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <p className="text-[11px] font-bold text-slate-800 leading-tight">Affordable<br/>Pricing</p>
              </div>
              
              <div className="relative z-10 w-full h-full flex items-center justify-center p-4">
                <Image 
                  alt="White luxury car" 
                  className="w-[130%] max-w-none h-auto object-contain scale-110 lg:scale-[1.35] -translate-x-4 lg:-translate-x-12 translate-y-6 lg:translate-y-10 drop-shadow-[0_30px_40px_rgba(0,0,0,0.25)] relative z-30" 
                  src="/Segment-2.webp" 
                  width={1000}
                  height={600}
                  priority
                />
              </div>
            </div>
          </div>

        </div>

        {/* Stats Bar */}
        <div id="about" className="mt-20 lg:mt-32 bg-white/40 backdrop-blur-md rounded-[32px] border border-white/60 p-8 py-10 shadow-soft" data-purpose="statistics-bar">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center justify-center border-r border-slate-300 last:border-0 md:last:border-0">
              <span className="text-3xl lg:text-4xl font-extrabold font-headline text-brandDark">126k+</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Total User</span>
            </div>
            <div className="flex flex-col items-center justify-center border-r-0 md:border-r border-slate-300 last:border-0">
              <span className="text-3xl lg:text-4xl font-extrabold font-headline text-brandDark">5+</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Years Experience</span>
            </div>
            <div className="flex flex-col items-center justify-center border-r border-slate-300 last:border-0">
              <span className="text-3xl lg:text-4xl font-extrabold font-headline text-brandDark">4.8</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Averages Review</span>
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className="text-3xl lg:text-4xl font-extrabold font-headline text-brandDark">24/7</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Services</span>
            </div>
          </div>
        </div>

      </main>

      {/* Extra Page Content (Adapted to new scheme) */}
      <div className="bg-white/80 backdrop-blur-sm rounded-t-[3rem] mt-12 pt-20 border-t border-white/90 shadow-[0_-20px_40px_rgba(0,0,0,0.02)]">
        
        {/* ═══════════ How It Works ═══════════ */}
        <section id="help" className="py-12 bg-transparent">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-16">
              <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight mb-4 text-brandDark">
                How It Works
              </h2>
              <p className="text-slate-500 max-w-xl">
                Four simple steps to your destination with unparalleled comfort.
              </p>
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
                  <h3 className="font-headline text-xl font-bold mb-3 text-brandDark group-hover:text-white transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-500 group-hover:text-white/80 transition-colors">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════ Precision Excellence (Bento Grid) ═══════════ */}
        <section id="futures" className="py-24 bg-transparent">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="font-headline text-4xl md:text-5xl font-bold tracking-tight mb-4 text-brandDark">
                Precision Excellence
              </h2>
              <p className="text-slate-500 max-w-2xl mx-auto">
                Why discerning travelers choose AirlinCabz for their journeys.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
              {/* Large Cards */}
              {bentoLarge.map((b) => (
                <div
                  key={b.title}
                  className={`md:col-span-3 p-10 rounded-[2rem] flex flex-col justify-between ${
                    b.primary
                      ? "bg-brandBlue text-white shadow-brand border border-white/20"
                      : "bg-white shadow-soft border border-slate-100"
                  }`}
                >
                  <div>
                    <span
                      className={`material-symbols-outlined text-4xl mb-6 ${
                        b.primary ? "" : "text-brandBlue"
                      }`}
                    >
                      {b.icon}
                    </span>
                    <h3 className="font-headline text-2xl font-bold mb-3">
                      {b.title}
                    </h3>
                    <p className={b.primary ? "text-white/80" : "text-slate-500"}>
                      {b.desc}
                    </p>
                  </div>
                </div>
              ))}

              {/* Small Cards */}
              {bentoSmall.map((b) => (
                <div
                  key={b.title}
                  className="md:col-span-2 bg-white p-8 rounded-[2rem] shadow-soft border border-slate-100"
                >
                  <span className="material-symbols-outlined text-brandBlue text-3xl mb-4">
                    {b.icon}
                  </span>
                  <h3 className="font-headline text-xl font-bold mb-2 text-brandDark">
                    {b.title}
                  </h3>
                  <p className="text-sm text-slate-500">{b.desc}</p>
                </div>
              ))}

            </div>
          </div>
        </section>

        {/* ═══════════ CTA Banner ═══════════ */}
        <section id="cars" className="py-20 bg-transparent">
          <div className="max-w-7xl mx-auto px-6">
            <div className="bg-brandDark rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-brandBlue/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
              <div className="relative z-10">
                <h2 className="font-headline text-4xl md:text-5xl font-extrabold text-white mb-8">
                  Ready to ride? <br />
                  Book your AirlinCabz today.
                </h2>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link
                    href="/book"
                    className="bg-brandBlue text-white px-10 py-5 rounded-2xl font-bold text-xl shadow-brand hover:scale-105 transition-transform"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
        <MobileBottomNav />
      </div>
    </>
  );
}
