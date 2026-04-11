import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-50 w-full py-12 border-t border-slate-200/50">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 items-center gap-8">
        {/* Logo & Description */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-900">
              directions_car
            </span>
            <span className="font-headline font-extrabold text-blue-900 text-2xl tracking-tighter">
              AirlinCabz
            </span>
          </div>
          <p className="text-slate-500 font-body text-sm max-w-xs">
            Precision mobility for the modern professional. Seamless, safe, and
            sophisticated travel solutions.
          </p>
          <div className="text-slate-500 font-body text-sm mt-4">
            © {new Date().getFullYear()} AirlinCabz Precision Mobility
          </div>
        </div>

        {/* Links & Social */}
        <div className="flex flex-col md:items-end gap-6">
          <nav className="flex flex-wrap gap-8 justify-start md:justify-end">
            {["Terms", "Privacy", "Safety", "Contact"].map((item) => (
              <Link
                key={item}
                href="#"
                className="text-slate-500 hover:text-blue-700 underline-offset-4 hover:underline text-sm transition-opacity"
              >
                {item}
              </Link>
            ))}
          </nav>
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center hover:bg-primary hover:text-white transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-lg">share</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center hover:bg-primary hover:text-white transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-lg">
                rss_feed
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
