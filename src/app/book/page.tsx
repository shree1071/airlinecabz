"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
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

const libraries: ("places")[] = ["places"];

export default function BookingPage() {
  const router = useRouter();
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [tripType, setTripType] = useState<"to_airport" | "from_airport">("to_airport");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [pickupText, setPickupText] = useState("");
  const [dropoffText, setDropoffText] = useState("Kempegowda International Airport, Bangalore");
  
  // Detailed address fields
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [landmark, setLandmark] = useState("");
  const [area, setArea] = useState("");
  const [pincode, setPincode] = useState("");
  
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("09:00 AM");
  const [submitting, setSubmitting] = useState(false);

  // Update airport location when trip type changes
  React.useEffect(() => {
    if (tripType === "to_airport") {
      setDropoffText("Kempegowda International Airport, Bangalore");
      setPickupText("");
    } else {
      setPickupText("Kempegowda International Airport, Bangalore");
      setDropoffText("");
    }
    // Clear detailed address when switching
    setAddressLine1("");
    setAddressLine2("");
    setLandmark("");
    setArea("");
    setPincode("");
  }, [tripType]);
  
  const pickupRef = useRef<google.maps.places.Autocomplete | null>(null);
  const dropoffRef = useRef<google.maps.places.Autocomplete | null>(null);

  const baseFare = selectedVehicle?.base_fare || 0;
  const taxes = baseFare * 0.12;
  const totalAmount = baseFare + taxes;

  React.useEffect(() => {
    console.log("Fetching vehicles from /api/vehicles");
    fetch("/api/vehicles")
      .then((res) => {
        console.log("Response status:", res.status);
        return res.json();
      })
      .then((data) => {
        console.log("Vehicles data:", data);
        if (data.vehicles) {
          setVehicles(data.vehicles);
          console.log("Set vehicles:", data.vehicles.length);
        } else {
          console.error("No vehicles in response:", data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load vehicles", err);
        setLoading(false);
      });
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    // Prevent double submission
    if (submitting) {
      return;
    }

    if (!customerName || !customerEmail || !pickupDate) {
      alert("Please fill in all required fields");
      return;
    }

    if (!selectedVehicle) {
      alert("Please select a vehicle");
      return;
    }

    // Build complete address
    const detailedAddress = [
      addressLine1,
      addressLine2,
      landmark && `Landmark: ${landmark}`,
      area,
      pincode && `PIN: ${pincode}`
    ].filter(Boolean).join(", ");

    const finalPickupLocation = tripType === "to_airport" 
      ? (detailedAddress || pickupText)
      : "Kempegowda International Airport, Bangalore";
    
    const finalDropoffLocation = tripType === "from_airport"
      ? (detailedAddress || dropoffText)
      : "Kempegowda International Airport, Bangalore";

    if (!finalPickupLocation || !finalDropoffLocation) {
      alert("Please provide complete address details");
      return;
    }

    setSubmitting(true);

    try {
      const bookingRes = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: customerName,
          customer_email: customerEmail,
          trip_type: tripType,
          pickup_location: finalPickupLocation,
          dropoff_location: finalDropoffLocation,
          address_line1: addressLine1,
          address_line2: addressLine2,
          landmark: landmark,
          area: area,
          pincode: pincode,
          pickup_date: `${pickupDate}T${convertTime12to24(pickupTime)}:00`,
          vehicle_type: selectedVehicle?.slug,
          base_fare: baseFare,
          taxes: taxes,
          total_amount: totalAmount,
          status: "pending",
        }),
      });

      const { booking, error } = await bookingRes.json();
      
      if (error) {
        alert("Booking failed: " + error);
        setSubmitting(false);
        return;
      }

      alert(`Booking submitted successfully! Booking ID: ${booking.id}\n\nWe will contact you shortly to confirm your ride.`);
      router.push("/");
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  const convertTime12to24 = (time12h: string) => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') hours = '00';
    if (modifier === 'PM') hours = String(parseInt(hours, 10) + 12);
    return `${hours}:${minutes}`;
  };

  if (loading) return <div className="p-24 text-center">Loading...</div>;

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-sm border-b border-outline-variant/10">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <button onClick={() => router.back()} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-primary text-xl md:text-2xl">arrow_back</span>
            </button>
            <h1 className="font-headline font-bold text-base md:text-xl tracking-tighter text-primary">Book Your Ride</h1>
          </div>
          <div className="flex items-center gap-1 md:gap-2">
            <span className="text-[9px] md:text-xs font-semibold uppercase tracking-widest text-outline">AirlinCabz</span>
            <span className="material-symbols-outlined text-primary text-lg md:text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>directions_car</span>
          </div>
        </div>
      </header>

      <main className="pt-20 md:pt-24 pb-32 px-4 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-8 space-y-4 md:space-y-8">
            <section className="bg-surface-container-lowest rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-sm border border-outline-variant/10">
              <h2 className="font-headline text-xl md:text-2xl font-bold mb-4 md:mb-6 flex items-center gap-3">
                <span className="w-1.5 h-6 md:h-8 bg-primary rounded-full"></span>
                Your Details
              </h2>
              <div className="space-y-3 md:space-y-4">
                <div className="group relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined z-10 text-primary/60 group-focus-within:text-primary">person</span>
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="input-field"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                </div>
                <div className="group relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined z-10 text-primary/60 group-focus-within:text-primary">email</span>
                  <input
                    type="email"
                    placeholder="Your Email"
                    className="input-field"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
            </section>

            <section className="bg-surface-container-lowest rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-sm border border-outline-variant/10">
              <h2 className="font-headline text-xl md:text-2xl font-bold mb-4 md:mb-6 flex items-center gap-3">
                <span className="w-1.5 h-6 md:h-8 bg-primary rounded-full"></span>
                Journey Specifications
              </h2>
              <div className="space-y-4 md:space-y-6">
                
                {/* Trip Type Selector */}
                <div className="space-y-3">
                  <label className="text-xs md:text-sm font-bold font-label text-outline uppercase px-1">Trip Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setTripType("to_airport")}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        tripType === "to_airport"
                          ? "bg-primary-container/10 border-primary shadow-md"
                          : "bg-surface-container-low border-outline-variant/20 hover:border-primary/30"
                      }`}
                    >
                      <span className="material-symbols-outlined text-2xl text-primary">flight_takeoff</span>
                      <span className={`text-xs md:text-sm font-bold ${tripType === "to_airport" ? "text-primary" : "text-on-surface"}`}>
                        Going to Airport
                      </span>
                      <span className="text-[10px] text-slate-500">Home → Airport</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTripType("from_airport")}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        tripType === "from_airport"
                          ? "bg-primary-container/10 border-primary shadow-md"
                          : "bg-surface-container-low border-outline-variant/20 hover:border-primary/30"
                      }`}
                    >
                      <span className="material-symbols-outlined text-2xl text-primary">flight_land</span>
                      <span className={`text-xs md:text-sm font-bold ${tripType === "from_airport" ? "text-primary" : "text-on-surface"}`}>
                        Coming from Airport
                      </span>
                      <span className="text-[10px] text-slate-500">Airport → Home</span>
                    </button>
                  </div>
                </div>

                <LoadScript 
                  googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""} 
                  libraries={libraries}
                >
                  <div className="space-y-4">
                    {tripType === "to_airport" ? (
                      <>
                        <div>
                          <label className="text-xs font-bold text-slate-700 mb-2 block">Pickup Location</label>
                          <div className="group relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined z-10 text-primary/60 group-focus-within:text-primary">location_on</span>
                            <Autocomplete
                              onLoad={(autocomplete) => pickupRef.current = autocomplete}
                              onPlaceChanged={handlePickupChanged}
                            >
                              <input
                                type="text"
                                placeholder="Search your location"
                                className="input-field"
                                value={pickupText}
                                onChange={(e) => setPickupText(e.target.value)}
                              />
                            </Autocomplete>
                          </div>
                        </div>

                        {/* Detailed Address Section */}
                        <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                          <p className="text-xs font-bold text-slate-700 mb-2">Complete Address Details</p>
                          
                          <div className="group relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-sm text-slate-400">home</span>
                            <input
                              type="text"
                              placeholder="House/Flat No., Building Name"
                              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary focus:outline-none text-sm"
                              value={addressLine1}
                              onChange={(e) => setAddressLine1(e.target.value)}
                            />
                          </div>

                          <div className="group relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-sm text-slate-400">signpost</span>
                            <input
                              type="text"
                              placeholder="Street Name, Area"
                              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary focus:outline-none text-sm"
                              value={addressLine2}
                              onChange={(e) => setAddressLine2(e.target.value)}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="group relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-sm text-slate-400">location_city</span>
                              <input
                                type="text"
                                placeholder="Landmark"
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary focus:outline-none text-sm"
                                value={landmark}
                                onChange={(e) => setLandmark(e.target.value)}
                              />
                            </div>
                            <div className="group relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-sm text-slate-400">map</span>
                              <input
                                type="text"
                                placeholder="Area/Locality"
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary focus:outline-none text-sm"
                                value={area}
                                onChange={(e) => setArea(e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="group relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-sm text-slate-400">pin_drop</span>
                            <input
                              type="text"
                              placeholder="Pincode"
                              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary focus:outline-none text-sm"
                              value={pincode}
                              onChange={(e) => setPincode(e.target.value)}
                              maxLength={6}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 mb-2 block">Dropoff Location</label>
                          <div className="group relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined z-10 text-primary/60">flag</span>
                            <input
                              type="text"
                              value="Kempegowda International Airport, Bangalore"
                              className="input-field bg-slate-50 cursor-not-allowed"
                              readOnly
                              disabled
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="text-xs font-bold text-slate-700 mb-2 block">Pickup Location</label>
                          <div className="group relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined z-10 text-primary/60">location_on</span>
                            <input
                              type="text"
                              value="Kempegowda International Airport, Bangalore"
                              className="input-field bg-slate-50 cursor-not-allowed"
                              readOnly
                              disabled
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 mb-2 block">Dropoff Location</label>
                          <div className="group relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined z-10 text-primary/60 group-focus-within:text-primary">flag</span>
                            <Autocomplete
                              onLoad={(autocomplete) => dropoffRef.current = autocomplete}
                              onPlaceChanged={handleDropoffChanged}
                            >
                              <input
                                type="text"
                                placeholder="Search your destination"
                                className="input-field"
                                value={dropoffText}
                                onChange={(e) => setDropoffText(e.target.value)}
                              />
                            </Autocomplete>
                          </div>
                        </div>

                        {/* Detailed Address Section */}
                        <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                          <p className="text-xs font-bold text-slate-700 mb-2">Complete Address Details</p>
                          
                          <div className="group relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-sm text-slate-400">home</span>
                            <input
                              type="text"
                              placeholder="House/Flat No., Building Name"
                              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary focus:outline-none text-sm"
                              value={addressLine1}
                              onChange={(e) => setAddressLine1(e.target.value)}
                            />
                          </div>

                          <div className="group relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-sm text-slate-400">signpost</span>
                            <input
                              type="text"
                              placeholder="Street Name, Area"
                              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary focus:outline-none text-sm"
                              value={addressLine2}
                              onChange={(e) => setAddressLine2(e.target.value)}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="group relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-sm text-slate-400">location_city</span>
                              <input
                                type="text"
                                placeholder="Landmark"
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary focus:outline-none text-sm"
                                value={landmark}
                                onChange={(e) => setLandmark(e.target.value)}
                              />
                            </div>
                            <div className="group relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-sm text-slate-400">map</span>
                              <input
                                type="text"
                                placeholder="Area/Locality"
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary focus:outline-none text-sm"
                                value={area}
                                onChange={(e) => setArea(e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="group relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-sm text-slate-400">pin_drop</span>
                            <input
                              type="text"
                              placeholder="Pincode"
                              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary focus:outline-none text-sm"
                              value={pincode}
                              onChange={(e) => setPincode(e.target.value)}
                              maxLength={6}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </LoadScript>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] md:text-xs font-bold font-label text-outline uppercase px-1">Pickup Date</label>
                    <div className="relative">
                      <span className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-sm">calendar_month</span>
                      <input 
                        className="input-field py-2.5 md:py-3 pl-10 md:pl-11 text-sm" 
                        type="date"
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] md:text-xs font-bold font-label text-outline uppercase px-1">Pickup Time</label>
                    <div className="relative">
                      <span className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-sm">schedule</span>
                      <select 
                        className="input-field py-2.5 md:py-3 pl-10 md:pl-11 appearance-none text-sm"
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

            <section className="bg-surface-container-lowest rounded-3xl p-6 md:p-8 shadow-sm border border-outline-variant/10">
              <h2 className="font-headline text-xl md:text-2xl font-bold flex items-center gap-3 mb-2">
                <span className="w-1.5 h-6 md:h-8 bg-primary rounded-full"></span>
                Select Fleet Class
              </h2>
              <p className="text-xs md:text-sm text-slate-500 mb-4 md:mb-6 ml-5">Choose your preferred vehicle for the journey</p>
              
              {vehicles.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <p>No vehicles available at the moment.</p>
                  <p className="text-sm mt-2">Please contact us directly to book.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
                  {vehicles.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVehicle(v)}
                      className={`flex flex-col items-center gap-2 md:gap-3 p-3 md:p-4 rounded-xl md:rounded-2xl border-2 transition-all group ${
                        selectedVehicle?.id === v.id
                          ? "bg-primary-container/10 border-primary shadow-md"
                          : "bg-surface-container-low border-transparent hover:border-primary/20"
                      }`}
                    >
                      <div className="relative w-full aspect-video rounded-lg bg-white p-1 md:p-2 flex items-center justify-center overflow-hidden">
                        {v.is_ev && <div className="absolute top-1 right-1 bg-green-500 w-1.5 h-1.5 md:w-2 md:h-2 rounded-full"></div>}
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
                      <div className="text-center w-full">
                        <span className={`text-[10px] md:text-xs font-bold block truncate ${selectedVehicle?.id === v.id ? "text-primary" : "text-on-surface"}`}>
                          {v.name}
                        </span>
                        <span className={`text-[9px] md:text-[10px] block mt-0.5 ${selectedVehicle?.id === v.id ? "text-primary/70" : "text-slate-500"}`}>
                          ₹{v.base_fare}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="lg:col-span-4 space-y-4 md:space-y-6">
            <div className="lg:sticky lg:top-24 space-y-4 md:space-y-6">
              <div className="bg-primary rounded-2xl md:rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-primary/20 relative overflow-hidden">
                <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                <h3 className="font-headline text-base md:text-lg font-bold mb-4 md:mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg md:text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>receipt_long</span>
                  Booking Summary
                </h3>
                <div className="space-y-3 md:space-y-4 relative z-10">
                  <div className="flex justify-between items-center text-xs md:text-sm">
                    <span className="opacity-70 font-label">Customer</span>
                    <span className="font-bold truncate ml-2">{customerName || "Guest"}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs md:text-sm border-t border-white/10 pt-3 md:pt-4">
                    <span className="opacity-70 font-label">Trip Type</span>
                    <span className="font-bold truncate ml-2">
                      {tripType === "to_airport" ? "🛫 To Airport" : "🛬 From Airport"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs md:text-sm">
                    <span className="opacity-70 font-label">Vehicle</span>
                    <span className="font-bold truncate ml-2">{selectedVehicle?.name || "Not selected"}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs md:text-sm border-t border-white/10 pt-3 md:pt-4">
                    <span className="opacity-70 font-label">Base Fare</span>
                    <span className="font-bold">₹{baseFare.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs md:text-sm">
                    <span className="opacity-70 font-label">Taxes (12%)</span>
                    <span className="font-bold">₹{taxes.toFixed(2)}</span>
                  </div>
                  <div className="pt-4 md:pt-6 mt-2 border-t border-white/20">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[9px] md:text-[10px] uppercase font-bold tracking-wider opacity-60">Total Amount</p>
                        <p className="text-2xl md:text-3xl font-extrabold tracking-tighter">₹{totalAmount.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 md:space-y-4">
                <button 
                  onClick={handleSubmit}
                  disabled={submitting}
                  type="button"
                  className="w-full py-4 md:py-5 rounded-xl md:rounded-2xl bg-gradient-to-r from-primary to-primary-container text-white font-headline font-extrabold text-base md:text-lg shadow-2xl shadow-primary/30 active:scale-[0.98] transition-transform flex items-center justify-center gap-2 md:gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                >
                  {submitting ? (
                    <>
                      <span className="animate-spin material-symbols-outlined text-lg md:text-xl">progress_activity</span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Booking Request
                      <span className="material-symbols-outlined text-lg md:text-xl">double_arrow</span>
                    </>
                  )}
                </button>
                <p className="text-[10px] md:text-xs text-center text-slate-500">
                  We will contact you to confirm your booking and payment details
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
