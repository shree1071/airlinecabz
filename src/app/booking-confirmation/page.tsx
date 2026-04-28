"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { insforge } from "@/lib/insforge";
import jsPDF from "jspdf";

type Booking = {
  id: string;
  customer_name: string;
  customer_email: string;
  trip_type: string;
  pickup_location: string;
  dropoff_location: string;
  pickup_date: string;
  vehicle_type: string;
  base_fare: number;
  total_amount: number;
  created_at: string;
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
        .select("*")
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

    const whatsappMessage = `*AirlinCabz Booking Confirmation*%0A%0A` +
      `Booking ID: ${booking.id}%0A` +
      `Customer: ${booking.customer_name}%0A` +
      `Email: ${booking.customer_email}%0A` +
      `Trip: ${booking.trip_type === 'to_airport' ? 'To Airport' : 'From Airport'}%0A` +
      `Pickup: ${booking.pickup_location}%0A` +
      `Dropoff: ${booking.dropoff_location}%0A` +
      `Date: ${new Date(booking.pickup_date).toLocaleString()}%0A` +
      `Vehicle: ${booking.vehicle_type}%0A` +
      `Amount: ₹${booking.total_amount}%0A%0A` +
      `*Additional charges may apply (toll, parking)`;

    // Redirect to WhatsApp
    window.open(`https://wa.me/919901366449?text=${whatsappMessage}`, '_blank');
  };

  const downloadPDF = () => {
    if (!booking) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    
    // Colors
    const primaryBlue = [37, 99, 235];
    const darkGray = [51, 65, 85];
    const lightGray = [148, 163, 184];
    const bgGray = [248, 250, 252];
    
    // Header Background
    doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.rect(0, 0, pageWidth, 50, 'F');
    
    // Company Name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    doc.text('AIRLINCABZ', pageWidth / 2, 22, { align: 'center' });
    
    // Tagline
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Premium Airport Taxi Service', pageWidth / 2, 32, { align: 'center' });
    
    // Contact Info
    doc.setFontSize(9);
    doc.text('+91 99013 66449  |  support@airlincabz.com', pageWidth / 2, 42, { align: 'center' });
    
    // Document Title
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('BOOKING CONFIRMATION', pageWidth / 2, 65, { align: 'center' });
    
    // Booking ID Box
    doc.setFillColor(219, 234, 254);
    doc.roundedRect(margin, 75, pageWidth - (margin * 2), 12, 2, 2, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.text(`Booking ID: ${booking.id}`, pageWidth / 2, 83, { align: 'center' });
    
    let yPos = 95;
    
    // Customer Details Section
    doc.setFillColor(bgGray[0], bgGray[1], bgGray[2]);
    doc.roundedRect(margin, yPos, pageWidth - (margin * 2), 28, 2, 2, 'F');
    
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('CUSTOMER DETAILS', margin + 5, yPos + 8);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Name:', margin + 5, yPos + 16);
    doc.setFont('helvetica', 'bold');
    doc.text(booking.customer_name, margin + 30, yPos + 16);
    
    doc.setFont('helvetica', 'normal');
    doc.text('Email:', margin + 5, yPos + 23);
    doc.setFont('helvetica', 'bold');
    doc.text(booking.customer_email, margin + 30, yPos + 23);
    
    yPos += 35;
    
    // Trip Details Section
    doc.setFillColor(bgGray[0], bgGray[1], bgGray[2]);
    const tripSectionHeight = 45;
    doc.roundedRect(margin, yPos, pageWidth - (margin * 2), tripSectionHeight, 2, 2, 'F');
    
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('TRIP DETAILS', margin + 5, yPos + 8);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Trip Type:', margin + 5, yPos + 16);
    doc.setFont('helvetica', 'bold');
    doc.text(booking.trip_type === 'to_airport' ? 'To Airport' : 'From Airport', margin + 35, yPos + 16);
    
    doc.setFont('helvetica', 'normal');
    doc.text('Pickup:', margin + 5, yPos + 23);
    doc.setFont('helvetica', 'normal');
    const pickupLines = doc.splitTextToSize(booking.pickup_location, pageWidth - margin * 2 - 40);
    doc.text(pickupLines, margin + 35, yPos + 23);
    
    const pickupLinesCount = pickupLines.length;
    const dropoffYPos = yPos + 23 + (pickupLinesCount * 5);
    
    doc.setFont('helvetica', 'normal');
    doc.text('Dropoff:', margin + 5, dropoffYPos);
    const dropoffLines = doc.splitTextToSize(booking.dropoff_location, pageWidth - margin * 2 - 40);
    doc.text(dropoffLines, margin + 35, dropoffYPos);
    
    yPos += tripSectionHeight + 7;
    
    // Booking Details Section
    doc.setFillColor(bgGray[0], bgGray[1], bgGray[2]);
    doc.roundedRect(margin, yPos, pageWidth - (margin * 2), 28, 2, 2, 'F');
    
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('BOOKING DETAILS', margin + 5, yPos + 8);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Date & Time:', margin + 5, yPos + 16);
    doc.setFont('helvetica', 'bold');
    const dateStr = new Date(booking.pickup_date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    doc.text(dateStr, margin + 35, yPos + 16);
    
    doc.setFont('helvetica', 'normal');
    doc.text('Vehicle:', margin + 5, yPos + 23);
    doc.setFont('helvetica', 'bold');
    doc.text(booking.vehicle_type.toUpperCase(), margin + 35, yPos + 23);
    
    yPos += 35;
    
    // Payment Summary Section
    doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.roundedRect(margin, yPos, pageWidth - (margin * 2), 35, 2, 2, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT SUMMARY', margin + 5, yPos + 10);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Base Fare:', margin + 5, yPos + 19);
    doc.setFont('helvetica', 'bold');
    doc.text('Rs ' + Math.round(booking.base_fare).toString(), pageWidth - margin - 5, yPos + 19, { align: 'right' });
    
    // Divider line
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.3);
    doc.line(margin + 5, yPos + 22, pageWidth - margin - 5, yPos + 22);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL AMOUNT:', margin + 5, yPos + 30);
    doc.setFontSize(14);
    doc.text('Rs ' + Math.round(booking.total_amount).toString(), pageWidth - margin - 5, yPos + 30, { align: 'right' });
    
    yPos += 42;
    
    // Important Note
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(220, 38, 38);
    doc.text('* Additional charges may apply (toll, parking as applicable)', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 10;
    
    // Terms & Conditions
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const terms = [
      '• Please arrive 5 minutes before scheduled pickup time',
      '• Cancellation charges may apply as per policy',
      '• Driver details will be shared 30 minutes before pickup',
      '• For any queries, contact us at +91 99013 66449'
    ];
    
    terms.forEach((term, index) => {
      doc.text(term, margin, yPos + (index * 5));
    });
    
    yPos += 25; // Add spacing after terms
    
    // Separator line
    doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.setLineWidth(0.3);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    
    yPos += 8; // Space after line
    
    // Footer text
    doc.setFontSize(8);
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.text('Thank you for choosing AirlinCabz!', pageWidth / 2, yPos, { align: 'center' });
    doc.setFontSize(7);
    doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, pageWidth / 2, yPos + 4, { align: 'center' });
    doc.text('www.airlincabz.com', pageWidth / 2, yPos + 8, { align: 'center' });
    
    // Save the PDF
    doc.save(`AirlinCabz-Booking-${booking.id.slice(0, 8)}.pdf`);
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
              <p className="text-lg font-bold text-slate-900">{booking.customer_name}</p>
              <p className="text-sm text-slate-600">{booking.customer_email}</p>
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
                  <p className="font-semibold text-slate-900">{booking.pickup_location}</p>
                  <div className="flex items-center gap-2 my-2">
                    <div className="flex-1 border-t-2 border-dashed border-slate-300"></div>
                    <span className="material-symbols-outlined text-slate-400 text-sm">arrow_forward</span>
                    <div className="flex-1 border-t-2 border-dashed border-slate-300"></div>
                  </div>
                  <p className="font-semibold text-slate-900">{booking.dropoff_location}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Pickup Date & Time</p>
                <p className="text-sm font-semibold text-slate-900">{new Date(booking.pickup_date).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Vehicle</p>
                <p className="text-sm font-semibold text-slate-900">{booking.vehicle_type}</p>
              </div>
            </div>

            <div className="bg-blue-50 rounded-2xl p-4 border-2 border-blue-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-slate-700">Base Fare</span>
                <span className="text-lg font-bold text-slate-900">₹{booking.base_fare.toFixed(2)}</span>
              </div>
              <div className="border-t border-blue-200 pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-slate-900">Total Amount</span>
                  <span className="text-2xl font-extrabold text-blue-600">₹{booking.total_amount.toFixed(2)}</span>
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
          <a href="tel:+919901366449" className="text-blue-600 font-bold text-lg hover:underline">
            +91 99013 66449
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
