with open('src/app/admin/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

wa_svg = (
    '<svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">\r\n'
    '                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>\r\n'
    '                        </svg>'
)

# ── FIX 1: Pending booking broken action section ──────────────────────────────
# The broken block: the <select> is cut short at }`} then followed by wrong closing tags
old_broken = (
    '                      <select\r\n'
    '                        value={booking.status}\r\n'
    '                        onChange={(e) => updateStatus(booking.id, e.target.value)}\r\n'
    '                        className={`px-3 py-2 rounded-xl text-sm font-semibold border-2 transition-colors min-w-[140px] ${\r\n'
    "                          booking.status === 'pending' ? 'border-orange-300 bg-orange-50 text-orange-700' :\r\n"
    "                          booking.status === 'confirmed' ? 'border-blue-300 bg-blue-50 text-blue-700' :\r\n"
    "                          booking.status === 'completed' ? 'border-green-300 bg-green-50 text-green-700' :\r\n"
    "                          'border-red-300 bg-red-50 text-red-700'\r\n"
    '                        }`}\r\n'
    '            ))}\r\n'
    '          </div>\r\n'
    '        </div>\r\n'
    '      )}'
)

new_fixed = (
    '                      <select\r\n'
    '                        value={booking.status}\r\n'
    '                        onChange={(e) => updateStatus(booking.id, e.target.value)}\r\n'
    '                        className={`px-3 py-2 rounded-xl text-sm font-semibold border-2 transition-colors min-w-[140px] ${\r\n'
    "                          booking.status === 'pending' ? 'border-orange-300 bg-orange-50 text-orange-700' :\r\n"
    "                          booking.status === 'confirmed' ? 'border-blue-300 bg-blue-50 text-blue-700' :\r\n"
    "                          booking.status === 'completed' ? 'border-green-300 bg-green-50 text-green-700' :\r\n"
    "                          'border-red-300 bg-red-50 text-red-700'\r\n"
    '                        }`}\r\n'
    '                      >\r\n'
    '                        <option value="pending">\u23f3 Pending</option>\r\n'
    '                        <option value="confirmed">\u2705 Confirmed</option>\r\n'
    '                        <option value="completed">\U0001f389 Completed</option>\r\n'
    '                        <option value="cancelled">\u274c Cancelled</option>\r\n'
    '                      </select>\r\n'
    '                    )}\r\n'
    '\r\n'
    '                    <div className="flex gap-2">\r\n'
    '                      <button\r\n'
    '                        onClick={() => openWhatsApp(booking)}\r\n'
    '                        className="p-2 rounded-xl bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors"\r\n'
    '                        title="WhatsApp customer"\r\n'
    '                      >\r\n'
    f'                        {wa_svg}\r\n'
    '                      </button>\r\n'
    '                      <a\r\n'
    '                        href={`tel:${booking.customer_phone}`}\r\n'
    '                        className="p-2 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition-colors"\r\n'
    '                        title="Call customer"\r\n'
    '                      >\r\n'
    '                        <span className="material-symbols-outlined text-xl">call</span>\r\n'
    '                      </a>\r\n'
    '                      <a\r\n'
    '                        href={`mailto:${booking.customer_email}`}\r\n'
    '                        className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"\r\n'
    '                        title="Email customer"\r\n'
    '                      >\r\n'
    '                        <span className="material-symbols-outlined text-xl">email</span>\r\n'
    '                      </a>\r\n'
    '                      <button\r\n'
    '                        onClick={() => deleteBooking(booking.id, booking.customer_name)}\r\n'
    '                        className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"\r\n'
    '                        title="Delete booking"\r\n'
    '                      >\r\n'
    '                        <span className="material-symbols-outlined text-xl">delete</span>\r\n'
    '                      </button>\r\n'
    '                    </div>\r\n'
    '                  </div>\r\n'
    '                </div>\r\n'
    '              </div>\r\n'
    '            ))}\r\n'
    '          </div>\r\n'
    '        </div>\r\n'
    '      )}'
)

if old_broken in content:
    content = content.replace(old_broken, new_fixed, 1)
    print("SUCCESS: Fixed pending booking broken block + added WhatsApp button")
else:
    print("ERROR: old_broken not found")
    # try to find partial
    partial = '                        }`}\r\n            ))}\r\n          </div>'
    if partial in content:
        print("  Partial match found at }`} then ))}  </div>")
    else:
        print("  Partial NOT found either")

# ── FIX 2: Confirmed booking - add WhatsApp button ────────────────────────────
old_conf = (
    '                    <div className="flex gap-2">\r\n'
    '                      <a\r\n'
    '                        href={`tel:${booking.customer_email}`}\r\n'
    '                        className="p-2 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition-colors"\r\n'
    '                        title="Call customer"\r\n'
    '                      >\r\n'
    '                        <span className="material-symbols-outlined text-xl">call</span>\r\n'
    '                      </a>\r\n'
    '                      \r\n'
    '                      <a\r\n'
    '                        href={`mailto:${booking.customer_email}`}\r\n'
    '                        className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"\r\n'
    '                        title="Email customer"\r\n'
    '                      >\r\n'
    '                        <span className="material-symbols-outlined text-xl">email</span>\r\n'
    '                      </a>\r\n'
    '                      \r\n'
    '                      <button\r\n'
    '                        onClick={() => deleteBooking(booking.id, booking.customer_name)}\r\n'
    '                        className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"\r\n'
    '                        title="Delete booking"\r\n'
    '                      >\r\n'
    '                        <span className="material-symbols-outlined text-xl">delete</span>\r\n'
    '                      </button>\r\n'
    '                    </div>'
)

new_conf = (
    '                    <div className="flex gap-2">\r\n'
    '                      <button\r\n'
    '                        onClick={() => openWhatsApp(booking)}\r\n'
    '                        className="p-2 rounded-xl bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors"\r\n'
    '                        title="WhatsApp customer"\r\n'
    '                      >\r\n'
    f'                        {wa_svg}\r\n'
    '                      </button>\r\n'
    '                      <a\r\n'
    '                        href={`tel:${booking.customer_phone}`}\r\n'
    '                        className="p-2 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition-colors"\r\n'
    '                        title="Call customer"\r\n'
    '                      >\r\n'
    '                        <span className="material-symbols-outlined text-xl">call</span>\r\n'
    '                      </a>\r\n'
    '                      <a\r\n'
    '                        href={`mailto:${booking.customer_email}`}\r\n'
    '                        className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"\r\n'
    '                        title="Email customer"\r\n'
    '                      >\r\n'
    '                        <span className="material-symbols-outlined text-xl">email</span>\r\n'
    '                      </a>\r\n'
    '                      <button\r\n'
    '                        onClick={() => deleteBooking(booking.id, booking.customer_name)}\r\n'
    '                        className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"\r\n'
    '                        title="Delete booking"\r\n'
    '                      >\r\n'
    '                        <span className="material-symbols-outlined text-xl">delete</span>\r\n'
    '                      </button>\r\n'
    '                    </div>'
)

if old_conf in content:
    content = content.replace(old_conf, new_conf, 1)
    print("SUCCESS: Added WhatsApp button to confirmed booking section")
else:
    print("WARNING: confirmed buttons block not found - checking for tel:customer_email pattern")
    # Check what tel link looks like
    import re
    matches = list(re.finditer(r'href=\{`tel:\$\{booking\.customer', content))
    for m in matches:
        print(f"  Found tel link at pos {m.start()}: {repr(content[m.start():m.start()+60])}")

with open('src/app/admin/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("File saved.")
