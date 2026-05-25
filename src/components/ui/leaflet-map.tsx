"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default Leaflet markers in Next.js/Webpack
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function LeafletMap({ pickup, dropoff }: { pickup: string, dropoff: string }) {
  const [position, setPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    // Attempt to geocode the pickup location using Nominatim (OpenStreetMap)
    const geocode = async () => {
      try {
        // We use a simplified query by taking just the first part of the address to improve hit rate
        const shortQuery = encodeURIComponent(pickup.split(",")[0]);
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${shortQuery}&limit=1`);
        const data = await res.json();
        
        if (data && data.length > 0) {
          setPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        } else {
          // Fallback to Bangalore if address not found
          setPosition([13.1989, 77.7068]); // Kempegowda Airport Area
        }
      } catch {
        setPosition([13.1989, 77.7068]);
      }
    };
    
    // Slight delay to avoid rapid requests if navigating fast
    const timer = setTimeout(geocode, 500);
    return () => clearTimeout(timer);
  }, [pickup]);

  if (!position) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-widest animate-pulse">
        Loading Map...
      </div>
    );
  }

  return (
    <MapContainer 
      center={position} 
      zoom={13} 
      scrollWheelZoom={false} 
      style={{ height: "100%", width: "100%", zIndex: 10 }} // z-index lower than dialog header
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" // Cleaner, more professional map tile look
      />
      <Marker position={position} icon={customIcon}>
        <Popup>
          <div className="text-xs font-semibold">{pickup}</div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
