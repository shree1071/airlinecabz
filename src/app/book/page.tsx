"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser, useAuth } from "@clerk/nextjs";
import { LoadScript, Autocomplete } from "@react-google-maps/api";

type Vehicle = {
  id: string;
  name: string;
  slug: string;
  base_fare: number;
  per_km_rate: number;
  image_url: string;
  is_ev: boolean;
};

// Required libraries for Autocomplete
const libraries: ("places")[] = ["places"];

export default function BookingPage() {
  const router = useRouter();
  const { user, isLoaded: userLoaded } = useUser();
  const { getToken } = useAuth();
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [pickupText, setPickupText] = useState("");
  const [dropoffText, setDropoffText] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("09:00 AM");
  
  const pickupRef = useRef<google.maps.places.Autocomplete | null>(null);
  const dropoffRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Prices
  const baseFare = selectedVehicle?.base_fare || 0;
  const taxes = baseFare * 0.12; // 12% tax sim
  const totalAmount = baseFare + taxes;
  const depositAmount = 500; // Fixed deposit

  useEffect(() => {
    fetch("/api/vehicles")
      .then((res) => res.json())
      .then((data) => {
        if (data.vehicles) {
          setVehicles(data.vehicles);
          if (data.vehicles.length > 0) setSelectedVehicle(data.vehicles[1] || data.vehicles[0]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load vehicles", err);
        setLoading(false);
      });
      
    // Load Razorpay Script dynamically
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handlePickupChanged = () => {
    if (pickupRef.current !== null) {
      const place = pickupRef.current.getPlace();
      setPickupText(place.formatted_address || place.name || "");
    }
  };

  const handleDropoffChanged = () => {
    if (dropoffRef.current !== null) {
      const place = dropoffRef.current.getPlace();
      setDropoffText(place.formatted_address || place.name || "");
    }
  };

  const handlePayment = async () => {
    if (!pickupText || !dropoffText || !pickupDate) {
      alert("Please fill in all details (Pickup, Dropoff, Date)");
      return;
    }

    try {
      // 1. Create Booking in DB
      const bookingRes = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: user?.fullName || "Guest",
          customer_email: user?.primaryEmailAddress?.emailAddress || "",
          pickup_location: pickupText,
          dropoff_location: dropoffText,
          pickup_date: `${pickupDate}T${convertTime12to24(pickupTime)}:00`,
          vehicle_type: selectedVehicle?.slug,
          base_fare: baseFare,
          taxes: taxes,
          total_amount: totalAmount,
          deposit_amount: depositAmount,
        }),
      });

      const { booking, error: bErr } = await bookingRes.json();
      if (bErr) throw new Error(bErr);

      // 2. Create Razorpay Order
      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: depositAmount,
          booking_id: booking.id,
        }),
      });

      const order = await orderRes.json();

      // 3. Open Razorpay Checkout Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: order.amount,
        currency: order.currency,
        name: "AirlinCabz",
        description: "Ride Deposit",
        order_id: order.order_id,
        handler: async function (response: any) {
          // 4. Verify Payment
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              booking_id: booking.id,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            
            // 5. Send Confirmation Email
            await fetch("/api/send-confirmation", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                 email: user?.primaryEmailAddress?.emailAddress,
                 customer_name: user?.fullName,
                 booking_id: booking.id,
                 pickup_date: booking.pickup_date,
                 amount: depositAmount
              })
            });

            alert("Payment successful! Booking confirmed.");
            router.push("/");
          } else {
            alert("Payment verification failed.");
          }
        },
        prefill: {
          name: user?.fullName || "",
          email: user?.primaryEmailAddress?.emailAddress || "",
        },
        theme: {
          color: "#00288e",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        alert(response.error.description);
      });
      rzp.open();

    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    }
  };

  const convertTime12to24 = (time12h: string) => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') hours = '00';
    if (modifier === 'PM') hours = String(parseInt(hours, 10) + 12);
    return `${hours}:${minutes}`;
  };

  if (!userLoaded || loading) return <div className="p-24 text-center">Loading...</div>;

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-sm border-b border-outline-variant/10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-primary">arrow_back</span>
            </button>
            <h1 className="font-headline font-bold text-xl tracking-tighter text-primary">Book Your Ride</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-outline">AirlinCabz</span>
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>directions_car</span>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-32 px-4 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Form Canvas */}
          <div className="lg:col-span-8 space-y-8">
            <section className="bg-surface-container-lowest rounded-3xl p-8 shadow-sm border border-outline-variant/10">
              <h2 className="font-headline text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="w-1.5 h-8 bg-primary rounded-full"></span>
                Journey Specifications
              </h2>
              <div className="space-y-6">
                
                <LoadScript 
                  googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""} 
                  libraries={libraries}
                >
                  <div className="grid grid-cols-1 gap-4">
                    <div className="group relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined z-10 text-primary/60 group-focus-within:text-primary">location_on</span>
                      <Autocomplete
                        onLoad={(autocomplete) => pickupRef.current = autocomplete}
                        onPlaceChanged={handlePickupChanged}
                      >
                        <input
                          type="text"
                          placeholder="Enter Pickup Location"
                          className="input-field"
                          value={pickupText}
                          onChange={(e) => setPickupText(e.target.value)}
                        />
                      </Autocomplete>
                    </div>
                    <div className="group relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined z-10 text-primary/60 group-focus-within:text-primary">flag</span>
                      <Autocomplete
                        onLoad={(autocomplete) => dropoffRef.current = autocomplete}
                        onPlaceChanged={handleDropoffChanged}
                      >
                        <input
                          type="text"
                          placeholder="Where to?"
                          className="input-field"
                          value={dropoffText}
                          onChange={(e) => setDropoffText(e.target.value)}
                        />
                      </Autocomplete>
                    </div>
                  </div>
                </LoadScript>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold font-label text-outline uppercase px-1">Pickup Date</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-sm">calendar_month</span>
                      <input 
                        className="input-field py-3 pl-11" 
                        type="date"
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold font-label text-outline uppercase px-1">Pickup Time</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-sm">schedule</span>
                      <select 
                        className="input-field py-3 pl-11 appearance-none"
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                      >
                        <option>09:00 AM</option>
                        <option>11:30 AM</option>
                        <option>02:00 PM</option>
                        <option>05:30 PM</option>
                        <option>08:00 PM</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-surface-container-lowest rounded-3xl p-8 shadow-sm border border-outline-variant/10">
              <h2 className="font-headline text-2xl font-bold flex items-center gap-3 mb-6">
                <span className="w-1.5 h-8 bg-primary rounded-full"></span>
                Select Fleet Class
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {vehicles.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVehicle(v)}
                    className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all group ${
                      selectedVehicle?.id === v.id
                        ? "bg-primary-container/10 border-primary shadow-md"
                        : "bg-surface-container-low border-transparent hover:border-primary/20"
                    }`}
                  >
                    <div className="relative w-full aspect-video rounded-lg bg-white p-2 flex items-center justify-center overflow-hidden">
                      {v.is_ev && <div className="absolute top-1 right-1 bg-green-500 w-2 h-2 rounded-full"></div>}
                      <Image 
                        src={v.image_url} 
                        alt={v.name} 
                        width={200} 
                        height={100}
                        className={`w-full h-full object-contain transition-all ${
                          selectedVehicle?.id === v.id ? "" : "grayscale group-hover:grayscale-0"
                        }`}
                      />
                    </div>
                    <div className="text-center">
                      <span className={`text-xs font-bold block ${selectedVehicle?.id === v.id ? "text-primary" : "text-on-surface"}`}>{v.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Checkout */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-24 space-y-6">
              <div className="bg-primary rounded-3xl p-8 text-white shadow-xl shadow-primary/20 relative overflow-hidden">
                <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                <h3 className="font-headline text-lg font-bold mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>receipt_long</span>
                  Booking Summary
                </h3>
                <div className="space-y-4 relative z-10">
                  <div className="flex justify-between items-center text-sm">
                    <span className="opacity-70 font-label">Customer</span>
                    <span className="font-bold">{user?.fullName || "Guest"}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-t border-white/10 pt-4">
                    <span className="opacity-70 font-label">Vehicle</span>
                    <span className="font-bold">{selectedVehicle?.name || "-"}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-t border-white/10 pt-4">
                    <span className="opacity-70 font-label">Base Fare</span>
                    <span className="font-bold">₹{baseFare.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="opacity-70 font-label">Taxes (12%)</span>
                    <span className="font-bold">₹{taxes.toFixed(2)}</span>
                  </div>
                  <div className="pt-6 mt-2 border-t border-white/20">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] uppercase font-bold tracking-wider opacity-60">Payable Now</p>
                        <p className="text-3xl font-extrabold tracking-tighter">₹{depositAmount.toFixed(2)}</p>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <p className="text-[10px] uppercase font-bold tracking-wider opacity-60">Security Deposit</p>
                        <span className="material-symbols-outlined text-green-400 mt-1">verified_user</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={handlePayment}
                  className="w-full py-5 rounded-2xl bg-gradient-to-r from-primary to-primary-container text-white font-headline font-extrabold text-lg shadow-2xl shadow-primary/30 active:scale-[0.98] transition-transform flex items-center justify-center gap-3"
                >
                  Pay ₹{depositAmount} Deposit
                  <span className="material-symbols-outlined">double_arrow</span>
                </button>
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2 text-outline">
                    <span className="text-[10px] font-bold uppercase tracking-widest">Secured by</span>
                    <div className="flex items-center">
                      <span className="text-xs font-black text-on-surface">RAZOR</span>
                      <span className="text-xs font-black text-primary">PAY</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
