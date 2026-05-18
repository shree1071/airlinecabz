const fs = require('fs');
let content = fs.readFileSync('src/app/admin/page.tsx', 'utf8');

// 1. States
content = content.replace(
  /const \[confirmFormData[\s\S]*?\}\);/,
  `$&
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedBookingForMap, setSelectedBookingForMap] = useState<Booking | null>(null);`
);

// 2. Map Modal Handler
content = content.replace(
  /const openConfirmModal = \([\s\S]*?setShowConfirmModal\(true\);\s*\};/,
  `$&

  // Handle opening map modal
  const openMapModal = (booking: Booking) => {
    setSelectedBookingForMap(booking);
    setShowMapModal(true);
  };`
);

// 3. Action Buttons (Both Pending and Confirmed)
content = content.replace(
  /<div className="flex gap-2">\s*<a\s*href=\{`tel:\$\{booking\.customer_email\}`\}[\s\S]*?<\/button>\s*<\/div>/g,
  `<div className="flex gap-2 flex-wrap justify-end">
                      <button
                        onClick={() => openWhatsApp(booking)}
                        className="p-2 rounded-xl bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors"
                        title="WhatsApp customer"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                      </button>

                      <button
                        onClick={() => openMapModal(booking)}
                        className="p-2 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
                        title="View Route Map"
                      >
                        <span className="material-symbols-outlined text-xl">map</span>
                      </button>

                      <a
                        href={\`tel:\${booking.customer_phone || ''}\`}
                        className="p-2 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                        title="Call customer"
                      >
                        <span className="material-symbols-outlined text-xl">call</span>
                      </a>
                      
                      <a
                        href={\`mailto:\${booking.customer_email}\`}
                        className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                        title="Email customer"
                      >
                        <span className="material-symbols-outlined text-xl">email</span>
                      </a>
                      
                      <button
                        onClick={() => deleteBooking(booking.id, booking.customer_name)}
                        className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        title="Delete booking"
                      >
                        <span className="material-symbols-outlined text-xl">delete</span>
                      </button>
                    </div>`
);

// 4. Map Modal UI
const mapModalUI = \`
{/* Map Modal */}
{showMapModal && selectedBookingForMap && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full h-[80vh] flex flex-col overflow-hidden">
      {/* Modal Header */}
      <div className="bg-slate-900 p-4 md:p-6 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-xl md:text-2xl">route</span>
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white">Trip Route Map</h2>
              <p className="text-slate-400 text-xs md:text-sm truncate max-w-[200px] md:max-w-md">
                {selectedBookingForMap.pickup_location} → {selectedBookingForMap.dropoff_location}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowMapModal(false)}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-white">close</span>
          </button>
        </div>
      </div>

      {/* Modal Body (Map View) */}
      <div className="flex-1 w-full bg-slate-100 relative">
        <iframe
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: 0 }}
          referrerPolicy="no-referrer-when-downgrade"
          src={\`https://www.google.com/maps/embed/v1/directions?key=\${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&origin=\${encodeURIComponent(selectedBookingForMap.pickup_location)}&destination=\${encodeURIComponent(selectedBookingForMap.dropoff_location)}\`}
          allowFullScreen
        ></iframe>
      </div>
    </div>
  </div>
)}
\`;

content = content.replace(/<\/div>\s*\);\s*\}\s*$/, \`\n\${mapModalUI}\n</div>\n  );\n}\n\`);

fs.writeFileSync('src/app/admin/page.tsx', content);
console.log('Patched successfully');
