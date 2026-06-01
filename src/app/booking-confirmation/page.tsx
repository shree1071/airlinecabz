"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { insforge } from "@/lib/insforge";
import jsPDF from "jspdf";

type Booking = {
  id: string;
  trip_type: string;
  pickup_time: string;
  vehicle_type: string;
  created_at: string;
  distance_km?: number;
  duration_minutes?: number;
  passengers: Array<{ name: string; email: string; phone: string }> | { name: string; email: string; phone: string };
  financials: Array<{ base_fare: number; total_amount: number }> | { base_fare: number; total_amount: number };
  pickup_address: { text_location: string };
  dropoff_address: { text_location: string };
};

function BookingConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("id");
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) {
      router.push("/");
      return;
    }

    fetchBooking();
  }, [bookingId, router]);

  const fetchBooking = async () => {
    try {
      const { data, error } = await insforge.database
        .from("bookings")
        .select(`
          *,
          pickup_address:pickup_address_id(*),
          dropoff_address:dropoff_address_id(*),
          passengers:booking_passengers(*),
          financials:booking_financials(*)
        `)
        .eq("id", bookingId)
        .single();

      if (error || !data) {
        console.error("Error fetching booking:", error);
        alert("Booking not found");
        router.push("/");
        return;
      }

      setBooking(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      alert("Failed to load booking");
      router.push("/");
    }
  };

  const generatePDF = () => {
    if (!booking) return;

    const passenger = (Array.isArray(booking.passengers) ? booking.passengers[0] : booking.passengers) || { name: 'Guest', email: '' };
    const financial = (Array.isArray(booking.financials) ? booking.financials[0] : booking.financials) || { total_amount: 0 };
    const pickupLoc = booking.pickup_address?.text_location || 'N/A';
    const dropoffLoc = booking.dropoff_address?.text_location || 'N/A';

    const whatsappMessage = `*Airlinecabz Booking Confirmation*%0A%0A` +
      `Booking ID: ${booking.id}%0A` +
      `Customer: ${passenger.name}%0A` +
      `Email: ${passenger.email}%0A` +
      `Trip: ${booking.trip_type === 'to_airport' ? 'To Airport' : 'From Airport'}%0A` +
      `Pickup: ${pickupLoc}%0A` +
      `Dropoff: ${dropoffLoc}%0A` +
      `Date: ${new Date(booking.pickup_time).toLocaleString()}%0A` +
      `Vehicle: ${booking.vehicle_type}%0A` +
      (booking.distance_km ? `Distance: ${booking.distance_km} km${booking.duration_minutes ? ` (~${booking.duration_minutes} min)` : ''}%0A` : '') +
      `Amount: ₹${Number(financial.total_amount)}%0A%0A` +
      `*Additional charges may apply (toll, parking)`;

    // Redirect to WhatsApp
    window.open(`https://wa.me/919880691116?text=${whatsappMessage}`, '_blank');
  };

  const downloadPDF = () => {
    if (!booking) return;

    const passenger = (Array.isArray(booking.passengers) ? booking.passengers[0] : booking.passengers) || { name: 'Guest', email: '', phone: '' };
    const financial = (Array.isArray(booking.financials) ? booking.financials[0] : booking.financials) || { base_fare: 0, total_amount: 0 };
    const pickupLoc  = booking.pickup_address?.text_location  || 'N/A';
    const dropoffLoc = booking.dropoff_address?.text_location || 'N/A';

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth  = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const m = 18;

    // Palette
    const navy      = [15,  23,  42];
    const blue      = [37,  99, 235];
    const lightBlue = [219, 234, 254];
    const slate600  = [71,  85, 105];
    const slate400  = [148, 163, 184];
    const slate100  = [241, 245, 249];
    const wh        = [255, 255, 255];
    const green     = [22,  163,  74];

    // HEADER BAND
    doc.setFillColor(navy[0], navy[1], navy[2]);
    doc.rect(0, 0, pageWidth, 42, 'F');

    // Blue accent diagonal triangle (bottom-left)
    doc.setFillColor(blue[0], blue[1], blue[2]);
    doc.triangle(0, 28, 0, 42, 30, 42, 'F');

    doc.setTextColor(wh[0], wh[1], wh[2]);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('AIRLINECABZ', m, 18);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text('Premium Airport Taxi — Bengaluru', m, 26);

    doc.setTextColor(wh[0], wh[1], wh[2]);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', pageWidth - m, 18, { align: 'right' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text('Booking Confirmation', pageWidth - m, 26, { align: 'right' });

    // META BAR
    doc.setFillColor(lightBlue[0], lightBlue[1], lightBlue[2]);
    doc.rect(0, 42, pageWidth, 14, 'F');
    doc.setTextColor(blue[0], blue[1], blue[2]);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(`BOOKING ID: ${booking.id.toUpperCase()}`, m, 51);
    const dateStr = new Date(booking.pickup_time).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
    doc.text(`PICKUP: ${dateStr}`, pageWidth - m, 51, { align: 'right' });

    // STATUS BADGE
    let yPos = 60;
    doc.setFillColor(green[0], green[1], green[2]);
    doc.roundedRect(pageWidth - m - 30, yPos, 30, 8, 1.5, 1.5, 'F');
    doc.setTextColor(wh[0], wh[1], wh[2]);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('CONFIRMED', pageWidth - m - 15, yPos + 5.5, { align: 'center' });

    // Helpers
    const sectionTitle = (title: string, y: number, x?: number) => {
      const sx = x ?? m;
      doc.setFillColor(blue[0], blue[1], blue[2]);
      doc.rect(sx, y, 3, 6, 'F');
      doc.setTextColor(navy[0], navy[1], navy[2]);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(title, sx + 5, y + 4.5);
    };

    const kv = (label: string, value: string, lx: number, vx: number, y: number, maxW: number) => {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(slate600[0], slate600[1], slate600[2]);
      doc.text(label, lx, y);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(navy[0], navy[1], navy[2]);
      const lines = doc.splitTextToSize(value, maxW);
      doc.text(lines, vx, y);
      return (lines as string[]).length;
    };

    // TWO-COLUMN CARDS
    const cL   = m;
    const cR   = pageWidth / 2 + 4;
    const cW   = pageWidth / 2 - m - 4;
    const cardH = 42;

    doc.setFillColor(slate100[0], slate100[1], slate100[2]);
    doc.roundedRect(cL, yPos, cW, cardH, 2, 2, 'F');
    doc.roundedRect(cR, yPos, cW, cardH, 2, 2, 'F');

    // Left — Customer
    sectionTitle('CUSTOMER', yPos + 4, cL);
    let ry = yPos + 15;
    kv('Name',  passenger.name,                   cL + 5, cL + 22, ry, cW - 24); ry += 8;
    kv('Email', passenger.email,                  cL + 5, cL + 22, ry, cW - 24); ry += 8;
    kv('Phone', (passenger as any).phone || '—',  cL + 5, cL + 22, ry, cW - 24);

    // Right — Booking
    sectionTitle('BOOKING', yPos + 4, cR);
    ry = yPos + 15;
    const vType = booking.vehicle_type.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
    kv('Vehicle',  vType,                                           cR + 5, cR + 22, ry, cW - 24); ry += 8;
    kv('Type', booking.trip_type === 'to_airport' ? 'To Airport' : 'From Airport',
       cR + 5, cR + 22, ry, cW - 24); ry += 8;
    if (booking.distance_km) {
      kv('Distance',
        `${booking.distance_km} km${booking.duration_minutes ? ` (~${booking.duration_minutes} min)` : ''}`,
        cR + 5, cR + 22, ry, cW - 24);
    }

    yPos += cardH + 5;

    // JOURNEY CARD
    const puLines = doc.splitTextToSize(pickupLoc,  pageWidth - m * 2 - 18) as string[];
    const doLines = doc.splitTextToSize(dropoffLoc, pageWidth - m * 2 - 18) as string[];
    const journeyH = 18 + (puLines.length + doLines.length) * 5 + 6;

    doc.setFillColor(slate100[0], slate100[1], slate100[2]);
    doc.roundedRect(m, yPos, pageWidth - m * 2, journeyH, 2, 2, 'F');
    sectionTitle('JOURNEY', yPos + 4);

    const dotX = m + 7;
    const puY  = yPos + 17;
    const doY  = puY + puLines.length * 5 + 7;

    doc.setFillColor(blue[0], blue[1], blue[2]);
    doc.circle(dotX, puY, 1.5, 'F');

    doc.setDrawColor(slate400[0], slate400[1], slate400[2]);
    doc.setLineWidth(0.4);
    doc.setLineDashPattern([1.2, 1.2], 0);
    doc.line(dotX, puY + 2.5, dotX, doY - 2.5);
    doc.setLineDashPattern([], 0);

    doc.setFillColor(green[0], green[1], green[2]);
    doc.circle(dotX, doY, 1.5, 'F');

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(slate400[0], slate400[1], slate400[2]);
    doc.text('FROM', dotX + 4, puY - 2);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(navy[0], navy[1], navy[2]);
    doc.text(puLines, dotX + 4, puY + 1);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(slate400[0], slate400[1], slate400[2]);
    doc.text('TO', dotX + 4, doY - 2);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(navy[0], navy[1], navy[2]);
    doc.text(doLines, dotX + 4, doY + 1);

    yPos += journeyH + 5;

    // FARE BOX
    const fareH = 38;
    doc.setFillColor(blue[0], blue[1], blue[2]);
    doc.roundedRect(m, yPos, pageWidth - m * 2, fareH, 3, 3, 'F');

    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.3);
    doc.line(m + 5, yPos + fareH - 16, pageWidth - m - 5, yPos + fareH - 16);

    doc.setTextColor(lightBlue[0], lightBlue[1], lightBlue[2]);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT SUMMARY', m + 5, yPos + 8);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(wh[0], wh[1], wh[2]);
    doc.text('Base Fare', m + 5, yPos + 17);
    doc.text('Rs ' + Math.round(Number(financial.base_fare)).toLocaleString('en-IN'),
             pageWidth - m - 5, yPos + 17, { align: 'right' });

    doc.setFontSize(8);
    doc.setTextColor(lightBlue[0], lightBlue[1], lightBlue[2]);
    doc.text('Taxes & Fees', m + 5, yPos + 24);
    doc.text('Included', pageWidth - m - 5, yPos + 24, { align: 'right' });

    doc.setTextColor(wh[0], wh[1], wh[2]);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL PAYABLE', m + 5, yPos + 33);
    doc.setFontSize(14);
    doc.text('Rs ' + Math.round(Number(financial.total_amount)).toLocaleString('en-IN'),
             pageWidth - m - 5, yPos + 33, { align: 'right' });

    yPos += fareH + 5;

    // DISCLAIMER
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(220, 38, 38);
    doc.text('* Toll, parking & additional surcharges may apply as applicable.',
             pageWidth / 2, yPos + 3, { align: 'center' });
    yPos += 10;

    // TERMS
    const terms = [
      '• Arrive 5 minutes before your scheduled pickup time.',
      '• Driver details will be shared ~30 minutes before pickup.',
      '• Cancellation charges apply as per cancellation policy.',
      '• For support: +91 98806 91116  |  support@airlinecabz.com',
    ];
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(slate400[0], slate400[1], slate400[2]);
    terms.forEach((t, i) => doc.text(t, m, yPos + i * 5.5));
    yPos += terms.length * 5.5 + 4;

    // FOOTER BAR
    const footerY = pageHeight - 16;
    doc.setFillColor(navy[0], navy[1], navy[2]);
    doc.rect(0, footerY, pageWidth, 16, 'F');
    doc.setFillColor(blue[0], blue[1], blue[2]);
    doc.rect(0, footerY, 3, 16, 'F');

    doc.setTextColor(wh[0], wh[1], wh[2]);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Thank you for choosing Airlinecabz!', m, footerY + 6);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(slate400[0], slate400[1], slate400[2]);
    doc.text(
      `www.airlinecabz.com  |  Generated: ${new Date().toLocaleString('en-IN')}`,
      m, footerY + 12
    );
    doc.text('Page 1 of 1', pageWidth - m, footerY + 9, { align: 'right' });

    // SAVE
    doc.save(`Airlinecabz-Invoice-${booking.id.slice(0, 8).toUpperCase()}.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking) return null;

  const passenger = (Array.isArray(booking.passengers) ? booking.passengers[0] : booking.passengers) || { name: 'Guest', email: '' };
  const financial = (Array.isArray(booking.financials) ? booking.financials[0] : booking.financials) || { base_fare: 0, total_amount: 0 };
  const pickupLoc = booking.pickup_address?.text_location || 'N/A';
  const dropoffLoc = booking.dropoff_address?.text_location || 'N/A';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <span className="material-symbols-outlined text-white text-5xl">check_circle</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Booking Confirmed!</h1>
          <p className="text-slate-600">Your ride has been successfully booked</p>
          
          {/* WhatsApp Notification Info */}
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-center space-x-2">
            <span className="text-green-600">📱</span>
            <p className="text-sm text-green-700">
              WhatsApp confirmation sent to your mobile number
            </p>
          </div>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
          <div className="border-b border-slate-200 pb-6 mb-6">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Booking Details</h2>
            <p className="text-sm text-slate-500">Booking ID: <span className="font-mono font-bold text-blue-600">{booking.id}</span></p>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">Customer</p>
              <p className="text-lg font-bold text-slate-900">{passenger.name}</p>
              <p className="text-sm text-slate-600">{passenger.email}</p>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">Trip Type</p>
              <p className="text-lg font-bold text-slate-900">
                {booking.trip_type === 'to_airport' ? '🛫 Going to Airport' : '🛬 Coming from Airport'}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">Journey</p>
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-green-600 mt-1">location_on</span>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{pickupLoc}</p>
                  <div className="flex items-center gap-2 my-2">
                    <div className="flex-1 border-t-2 border-dashed border-slate-300"></div>
                    <span className="material-symbols-outlined text-slate-400 text-sm">arrow_forward</span>
                    <div className="flex-1 border-t-2 border-dashed border-slate-300"></div>
                  </div>
                  <p className="font-semibold text-slate-900">{dropoffLoc}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Pickup Date & Time</p>
                <p className="text-sm font-semibold text-slate-900">{new Date(booking.pickup_time).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Vehicle</p>
                <p className="text-sm font-semibold text-slate-900">{booking.vehicle_type}</p>
              </div>
            </div>

            {booking.distance_km && (
              <div className="bg-cyan-50 rounded-2xl p-4 border-2 border-cyan-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-cyan-600">route</span>
                    <span className="text-sm font-bold text-slate-700">Distance</span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-cyan-900">{booking.distance_km} km</p>
                    {booking.duration_minutes && (
                      <p className="text-xs text-cyan-700">~{booking.duration_minutes} minutes</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-blue-50 rounded-2xl p-4 border-2 border-blue-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-slate-700">Base Fare</span>
                <span className="text-lg font-bold text-slate-900">₹{Number(financial.base_fare).toFixed(2)}</span>
              </div>
              <div className="border-t border-blue-200 pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-slate-900">Total Amount</span>
                  <span className="text-2xl font-extrabold text-blue-600">₹{Number(financial.total_amount).toFixed(2)}</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 mt-2">*Additional charges may apply (toll, parking)</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={generatePDF}
            className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold text-lg shadow-xl hover:bg-green-700 transition-all flex items-center justify-center gap-3"
          >
            <span className="material-symbols-outlined text-2xl">chat</span>
            Confirm on WhatsApp
          </button>

          <button
            onClick={downloadPDF}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
          >
            <span className="material-symbols-outlined text-2xl">picture_as_pdf</span>
            Download Invoice PDF
          </button>

          <button
            onClick={() => router.push("/")}
            className="w-full py-4 bg-white text-slate-700 border-2 border-slate-200 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
          >
            <span className="material-symbols-outlined text-2xl">home</span>
            Back to Home
          </button>
        </div>

        {/* Contact Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-600 mb-2">Need help? Contact us</p>
          <a href="tel:+919880691116" className="text-blue-600 font-bold text-lg hover:underline">
            +91 98806 91116
          </a>
        </div>
      </div>
    </div>
  );
}

export default function BookingConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    }>
      <BookingConfirmationContent />
    </Suspense>
  );
}

