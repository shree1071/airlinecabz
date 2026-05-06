"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { MobileTimePicker } from '@mui/x-date-pickers/MobileTimePicker';
import { renderTimeViewClock } from '@mui/x-date-pickers/timeViewRenderers';
import dayjs, { Dayjs } from 'dayjs';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Dynamically import LocationMap to avoid SSR issues
const LocationMap = dynamic(() => import('@/components/LocationMap'), { ssr: false });

// Create a custom theme for MUI components to match your design
const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb', // brandBlue
    },
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#2563eb',
          },
        },
      },
    },
  },
});

type Vehicle = {
  id: string;
  name: string;
  slug: string;
  base_fare: number;
  per_km_rate: number;
  image_url: string;
  is_ev: boolean;
};

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
  
  // Location coordinates
  const [pickupLat, setPickupLat] = useState<number | null>(null);
  const [pickupLng, setPickupLng] = useState<number | null>(null);
  const [showMap, setShowMap] = useState(false);
  
  // Detailed address fields
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [landmark, setLandmark] = useState("");
  const [area, setArea] = useState("");
  const [pincode, setPincode] = useState("");
  
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState<Dayjs | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  
  // Form validation errors
  const [errors, setErrors] = useState<{
    customerName?: string;
    customerEmail?: string;
    pickupLocation?: string;
    dropoffLocation?: string;
    addressLine1?: string;
    pickupDate?: string;
    pickupTime?: string;
    vehicle?: string;
  }>({});

  // Get user's current location
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Fetch address from coordinates
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`)
          .then(res => res.json())
          .then(data => {
            setPickupLat(latitude);
            setPickupLng(longitude);
            setPickupText(data.display_name);
            parseAddressComponents(data);
            setGettingLocation(false);
          })
          .catch(error => {
            console.error('Failed to fetch address:', error);
            setGettingLocation(false);
            alert("Failed to get address from location");
          });
      },
      (error) => {
        console.error('Geolocation error:', error);
        setGettingLocation(false);
        alert("Failed to get your location. Please enable location services.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Get minimum time for today
  const getMinTime = () => {
    if (!pickupDate) return undefined;
    
    const selectedDate = new Date(pickupDate);
    const now = new Date();
    const isToday = selectedDate.getFullYear() === now.getFullYear() &&
      selectedDate.getMonth() === now.getMonth() &&
      selectedDate.getDate() === now.getDate();
    
    if (isToday) {
      // Add 1 hour buffer
      const minTime = new Date(now.getTime() + 60 * 60 * 1000);
      return dayjs().hour(minTime.getHours()).minute(minTime.getMinutes());
    }
    
    return undefined;
  };

  // Validate if selected time is valid
  const isValidTime = (time: Dayjs | null) => {
    if (!pickupDate || !time) return true;
    
    const selectedDate = new Date(pickupDate);
    const now = new Date();
    const isToday = selectedDate.getFullYear() === now.getFullYear() &&
      selectedDate.getMonth() === now.getMonth() &&
      selectedDate.getDate() === now.getDate();
    
    if (!isToday) return true;
    
    const minTime = getMinTime();
    if (!minTime) return true;
    
    return time.isAfter(minTime) || time.isSame(minTime);
  };

  // Set default time when date is selected
  React.useEffect(() => {
    if (pickupDate && !pickupTime) {
      const minTime = getMinTime();
      if (minTime) {
        setPickupTime(minTime);
      } else {
        setPickupTime(dayjs().hour(9).minute(0));
      }
    }
  }, [pickupDate]);

  // Get vehicle from URL parameter
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const vehicleParam = params.get('vehicle');
    
    if (vehicleParam && vehicles.length > 0) {
      // Try to find matching vehicle by name
      const matchingVehicle = vehicles.find(v => 
        v.name.toLowerCase().includes(vehicleParam.toLowerCase()) ||
        vehicleParam.toLowerCase().includes(v.name.toLowerCase())
      );
      
      if (matchingVehicle) {
        setSelectedVehicle(matchingVehicle);
        console.log('Auto-selected vehicle:', matchingVehicle.name);
      }
    }
  }, [vehicles]);

  // Parse address components from geocoded address
  const parseAddressComponents = (addressData: any) => {
    if (!addressData || !addressData.address) return;
    
    const addr = addressData.address;
    
    // Extract building/house number and road
    const building = addr.house_number || addr.building || "";
    const road = addr.road || addr.street || "";
    if (building || road) {
      setAddressLine1(`${building} ${road}`.trim());
    }
    
    // Extract neighborhood/suburb for address line 2
    const neighborhood = addr.neighbourhood || addr.suburb || addr.residential || "";
    if (neighborhood) {
      setAddressLine2(neighborhood);
    }
    
    // Extract landmark (commercial, amenity, or shop)
    const landmarkValue = addr.amenity || addr.shop || addr.commercial || "";
    if (landmarkValue) {
      setLandmark(landmarkValue);
    }
    
    // Extract area/locality
    const areaValue = addr.suburb || addr.city_district || addr.neighbourhood || "";
    if (areaValue) {
      setArea(areaValue);
    }
    
    // Extract pincode
    if (addr.postcode) {
      setPincode(addr.postcode);
    }
  };

  // Handle location selection from map
  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setPickupLat(lat);
    setPickupLng(lng);
    setPickupText(address);
    setShowMap(false); // Close map after selection
    
    // Fetch detailed address components for autofill
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`)
      .then(res => res.json())
      .then(data => {
        console.log('Detailed address data:', data);
        parseAddressComponents(data);
      })
      .catch(error => {
        console.error('Failed to fetch address details:', error);
      });
  };

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

  const baseFare = selectedVehicle?.base_fare || 0;
  const totalAmount = baseFare; // No taxes, just base fare

  // Fetch vehicles from API
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

  // Auto-select vehicle from URL parameter
  React.useEffect(() => {
    if (vehicles.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const vehicleName = params.get('vehicle');
      
      if (vehicleName) {
        // Find matching vehicle by name
        const matchingVehicle = vehicles.find(v => 
          v.name.toLowerCase() === vehicleName.toLowerCase()
        );
        
        if (matchingVehicle) {
          setSelectedVehicle(matchingVehicle);
          console.log('Auto-selected vehicle from URL:', matchingVehicle.name);
        }
      }
    }
  }, [vehicles]); // Run when vehicles are loaded

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    // Prevent double submission
    if (submitting) {
      return;
    }

    // Reset errors
    const newErrors: typeof errors = {};

    // Validate all fields
    if (!customerName.trim()) {
      newErrors.customerName = "Please enter your name";
    }

    if (!customerEmail.trim()) {
      newErrors.customerEmail = "Please enter your email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      newErrors.customerEmail = "Please enter a valid email address";
    }

    if (!pickupDate) {
      newErrors.pickupDate = "Please select a pickup date";
    }

    if (!pickupTime) {
      newErrors.pickupTime = "Please select a pickup time";
    } else if (!isValidTime(pickupTime)) {
      newErrors.pickupTime = "Please select a time at least 1 hour from now";
    }

    // Validate location based on trip type
    if (tripType === "to_airport") {
      if (!pickupText.trim() && !pickupLat) {
        newErrors.pickupLocation = "Please enter or select your pickup location";
      }
      if (!addressLine1.trim()) {
        newErrors.addressLine1 = "Please enter your complete address";
      }
    } else {
      if (!dropoffText.trim()) {
        newErrors.dropoffLocation = "Please enter your dropoff location";
      }
      if (!addressLine1.trim()) {
        newErrors.addressLine1 = "Please enter your complete address";
      }
    }

    if (!selectedVehicle) {
      newErrors.vehicle = "Please select a vehicle";
    }

    // If there are errors, set them and scroll to first error
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      
      // Scroll to first error
      const firstErrorField = Object.keys(newErrors)[0];
      const errorElement = document.querySelector(`[data-field="${firstErrorField}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      return;
    }

    // Clear errors if validation passes
    setErrors({});

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
          pickup_date: `${pickupDate}T${pickupTime!.format('HH:mm')}:00`,
          vehicle_type: selectedVehicle?.slug,
          base_fare: baseFare,
          taxes: 0,
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

      // Redirect to confirmation page with booking ID
      router.push(`/booking-confirmation?id=${booking.id}`);
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  const convertTime12to24 = (time12h: string) => {
    // No longer needed as we're using 24-hour format directly
    return time12h;
  };

  if (loading) return <div className="p-24 text-center">Loading...</div>;

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
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
            <Image
              src="/logo.png"
              alt="AirlinCabz"
              width={24}
              height={24}
              className="object-contain"
            />
          </div>
        </div>
      </header>

      <main className="pt-20 md:pt-24 pb-32 px-4 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-8 space-y-4 md:space-y-8">
            <section className="bg-surface-container-lowest rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-sm border border-outline-variant/10" data-field="customerName">
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
                    className={`input-field ${errors.customerName ? 'border-2 border-red-500 focus:border-red-500' : ''}`}
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      if (errors.customerName) {
                        setErrors(prev => ({ ...prev, customerName: undefined }));
                      }
                    }}
                    required
                  />
                  {errors.customerName && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">error</span>
                      {errors.customerName}
                    </p>
                  )}
                </div>
                <div className="group relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined z-10 text-primary/60 group-focus-within:text-primary">email</span>
                  <input
                    type="email"
                    placeholder="Your Email"
                    className={`input-field ${errors.customerEmail ? 'border-2 border-red-500 focus:border-red-500' : ''}`}
                    value={customerEmail}
                    onChange={(e) => {
                      setCustomerEmail(e.target.value);
                      if (errors.customerEmail) {
                        setErrors(prev => ({ ...prev, customerEmail: undefined }));
                      }
                    }}
                    required
                  />
                  {errors.customerEmail && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">error</span>
                      {errors.customerEmail}
                    </p>
                  )}
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

                <div className="space-y-4">
                  {tripType === "to_airport" ? (
                    <>
                      <div>
                        <label className="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
                          <span>Pickup Location</span>
                          <span className="text-[10px] text-slate-500 font-normal">Click on map or search for precise location</span>
                        </label>
                        
                        {/* Location Action Buttons */}
                        <div className="mb-3 grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={handleUseCurrentLocation}
                            disabled={gettingLocation}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {gettingLocation ? (
                              <>
                                <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                                Getting...
                              </>
                            ) : (
                              <>
                                <span className="material-symbols-outlined text-[18px]">my_location</span>
                                Current Location
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowMap(!showMap)}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all"
                          >
                            <span className="material-symbols-outlined text-[18px]">map</span>
                            {showMap ? 'Hide Map' : 'Select on Map'}
                          </button>
                        </div>

                        {/* Map Component - Only render when shown */}
                        {showMap && (
                          <div className="mb-4">
                            <LocationMap 
                              key="location-map"
                              onLocationSelect={handleLocationSelect}
                              initialLocation={pickupLat && pickupLng ? { lat: pickupLat, lng: pickupLng } : undefined}
                            />
                          </div>
                        )}
                        
                        <div className="group relative" data-field="pickupLocation">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined z-10 text-primary/60 group-focus-within:text-primary">location_on</span>
                          <input
                            type="text"
                            placeholder="Or type your location manually"
                            className={`input-field ${errors.pickupLocation ? 'border-2 border-red-500 focus:border-red-500' : ''}`}
                            value={pickupText}
                            onChange={(e) => {
                              setPickupText(e.target.value);
                              if (errors.pickupLocation) {
                                setErrors(prev => ({ ...prev, pickupLocation: undefined }));
                              }
                            }}
                          />
                          {errors.pickupLocation && (
                            <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">error</span>
                              {errors.pickupLocation}
                            </p>
                          )}
                        </div>
                        
                        {/* Show coordinates if available */}
                        {pickupLat && pickupLng && (
                          <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                            <p className="text-xs text-green-700 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[16px]">check_circle</span>
                              <span className="font-semibold">Location confirmed:</span> {pickupLat.toFixed(6)}, {pickupLng.toFixed(6)}
                            </p>
                            <p className="text-[10px] text-green-600 mt-1">
                              💡 Tip: Click on the map to adjust your exact pickup point
                            </p>
                          </div>
                        )}
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

                      <div data-field="dropoffLocation">
                        <label className="text-xs font-bold text-slate-700 mb-2 block">Dropoff Location</label>
                        <div className="group relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined z-10 text-primary/60 group-focus-within:text-primary">flag</span>
                          <input
                            type="text"
                            placeholder="Enter your destination (e.g., MG Road, Bangalore)"
                            className={`input-field ${errors.dropoffLocation ? 'border-2 border-red-500 focus:border-red-500' : ''}`}
                            value={dropoffText}
                            onChange={(e) => {
                              setDropoffText(e.target.value);
                              if (errors.dropoffLocation) {
                                setErrors(prev => ({ ...prev, dropoffLocation: undefined }));
                              }
                            }}
                          />
                        </div>
                        {errors.dropoffLocation && (
                          <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">error</span>
                            {errors.dropoffLocation}
                          </p>
                        )}
                      </div>

                        {/* Detailed Address Section */}
                        <div className="bg-slate-50 rounded-xl p-4 space-y-3" data-field="addressLine1">
                          <p className="text-xs font-bold text-slate-700 mb-2">Complete Address Details</p>
                          
                          <div className="group relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-sm text-slate-400">home</span>
                            <input
                              type="text"
                              placeholder="House/Flat No., Building Name *"
                              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border focus:outline-none text-sm ${
                                errors.addressLine1 
                                  ? 'border-2 border-red-500 focus:border-red-500' 
                                  : 'border-slate-200 focus:border-primary'
                              }`}
                              value={addressLine1}
                              onChange={(e) => {
                                setAddressLine1(e.target.value);
                                if (errors.addressLine1) {
                                  setErrors(prev => ({ ...prev, addressLine1: undefined }));
                                }
                              }}
                            />
                          </div>
                          {errors.addressLine1 && (
                            <p className="text-xs text-red-600 flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">error</span>
                              {errors.addressLine1}
                            </p>
                          )}

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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div className="space-y-2" data-field="pickupDate">
                    <label className="text-[10px] md:text-xs font-bold font-label text-outline uppercase px-1">Pickup Date</label>
                    <div className="relative">
                      <span className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-sm">calendar_month</span>
                      <input 
                        className={`input-field py-2.5 md:py-3 pl-10 md:pl-11 text-sm ${
                          errors.pickupDate ? 'border-2 border-red-500 focus:border-red-500' : ''
                        }`}
                        type="date"
                        value={pickupDate}
                        onChange={(e) => {
                          setPickupDate(e.target.value);
                          if (errors.pickupDate) {
                            setErrors(prev => ({ ...prev, pickupDate: undefined }));
                          }
                        }}
                      />
                    </div>
                    {errors.pickupDate && (
                      <p className="text-xs text-red-600 flex items-center gap-1 px-1">
                        <span className="material-symbols-outlined text-sm">error</span>
                        {errors.pickupDate}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2" data-field="pickupTime">
                    <label className="text-[10px] md:text-xs font-bold font-label text-outline uppercase px-1">Pickup Time</label>
                    <div className="mui-time-picker-wrapper relative">
                      <MobileTimePicker
                        value={pickupTime}
                        onChange={(newValue) => {
                          setPickupTime(newValue);
                          if (errors.pickupTime) {
                            setErrors(prev => ({ ...prev, pickupTime: undefined }));
                          }
                        }}
                        disabled={!pickupDate}
                        minTime={getMinTime()}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!errors.pickupTime,
                            sx: {
                              '& .MuiOutlinedInput-root': {
                                fontSize: '0.875rem',
                                borderRadius: '12px',
                                '& fieldset': {
                                  borderColor: errors.pickupTime ? 'rgb(239 68 68)' : 'rgb(226 232 240)',
                                  borderWidth: errors.pickupTime ? '2px' : '1px',
                                },
                                '&:hover fieldset': {
                                  borderColor: errors.pickupTime ? 'rgb(239 68 68)' : '#2563eb',
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: errors.pickupTime ? 'rgb(239 68 68)' : '#2563eb',
                                  borderWidth: '2px',
                                },
                              },
                            },
                          },
                        }}
                      />
                    </div>
                    {!pickupDate && !errors.pickupTime && (
                      <p className="text-[10px] text-slate-500 px-1">Please select a pickup date first</p>
                    )}
                    {errors.pickupTime && (
                      <p className="text-xs text-red-600 flex items-center gap-1 px-1">
                        <span className="material-symbols-outlined text-sm">error</span>
                        {errors.pickupTime}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className={`bg-surface-container-lowest rounded-3xl p-6 md:p-8 shadow-sm border ${
              errors.vehicle ? 'border-2 border-red-500' : 'border-outline-variant/10'
            }`} data-field="vehicle">
              <h2 className="font-headline text-xl md:text-2xl font-bold flex items-center gap-3 mb-2">
                <span className="w-1.5 h-6 md:h-8 bg-primary rounded-full"></span>
                Select Fleet Class
              </h2>
              <p className="text-xs md:text-sm text-slate-500 mb-4 md:mb-6 ml-5">Choose your preferred vehicle for the journey</p>
              
              {errors.vehicle && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">error</span>
                    {errors.vehicle}
                  </p>
                </div>
              )}
              
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
                      onClick={() => {
                        setSelectedVehicle(v);
                        if (errors.vehicle) {
                          setErrors(prev => ({ ...prev, vehicle: undefined }));
                        }
                      }}
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
                  <div className="pt-4 md:pt-6 mt-2 border-t border-white/20">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[9px] md:text-[10px] uppercase font-bold tracking-wider opacity-60">Total Amount</p>
                        <p className="text-2xl md:text-3xl font-extrabold tracking-tighter">₹{totalAmount.toFixed(2)}</p>
                      </div>
                    </div>
                    <p className="text-[9px] md:text-[10px] text-white/60 mt-2">*Additional charges may apply (toll, parking)</p>
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
      </LocalizationProvider>
    </ThemeProvider>
  );
}
