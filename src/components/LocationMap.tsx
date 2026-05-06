"use client";

import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix marker icon issue - only run on client side
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

interface LocationMapProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  initialLocation?: { lat: number; lng: number };
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (map && center) {
      try {
        // Use flyTo for smoother transition without triggering zoom errors
        map.flyTo(center, 15, {
          duration: 0.5,
          animate: true
        });
      } catch (error) {
        // Fallback to setView if flyTo fails
        try {
          map.setView(center, 15, { animate: false });
        } catch (e) {
          console.error('Map update error:', e);
        }
      }
    }
  }, [center, map]);
  return null;
}

function LocationMarker({ 
  onLocationSelect, 
  onDistanceCalculate 
}: { 
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  onDistanceCalculate: (distance: number) => void;
}) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const AIRPORT_LAT = 13.1986;
  const AIRPORT_LNG = 77.7066;

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return Math.round(distance * 10) / 10;
  };

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      
      // Calculate distance to airport
      const distance = calculateDistance(lat, lng, AIRPORT_LAT, AIRPORT_LNG);
      onDistanceCalculate(distance);
      
      // Reverse geocode to get address with detailed components
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`)
        .then(res => res.json())
        .then(data => {
          const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          onLocationSelect(lat, lng, address);
        })
        .catch(() => {
          onLocationSelect(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        });
    },
  });

  return position === null ? null : (
    <Marker position={position}>
      <Popup>📍 Selected location</Popup>
    </Marker>
  );
}

export default function LocationMap({ onLocationSelect, initialLocation }: LocationMapProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [distanceToAirport, setDistanceToAirport] = useState<number | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Kempegowda International Airport coordinates
  const AIRPORT_LAT = 13.1986;
  const AIRPORT_LNG = 77.7066;

  const center: [number, number] = currentLocation || (initialLocation 
    ? [initialLocation.lat, initialLocation.lng] 
    : [12.9716, 77.5946]);

  // Manual get current location function with high accuracy
  const getCurrentLocation = () => {
    setIsGettingLocation(true);

    if (!navigator.geolocation) {
      setIsGettingLocation(false);
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = position.coords.accuracy;
        
        console.log('Location obtained:', { lat, lng, accuracy });
        
        const newLocation: [number, number] = [lat, lng];
        
        setCurrentLocation(newLocation);
        setIsGettingLocation(false);

        // Calculate distance to airport
        const distance = calculateDistance(lat, lng, AIRPORT_LAT, AIRPORT_LNG);
        setDistanceToAirport(distance);

        // Reverse geocode to get address with detailed components
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`)
          .then(res => res.json())
          .then(data => {
            console.log('Reverse geocode result:', data);
            const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            onLocationSelect(lat, lng, address);
          })
          .catch((error) => {
            console.error('Reverse geocode error:', error);
            onLocationSelect(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
          });
      },
      (error) => {
        console.error('Geolocation error:', error);
        setIsGettingLocation(false);
        
        let errorMessage = "Unable to get your location. ";
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += "Please enable location access in your browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage += "Location request timed out. Please try again.";
            break;
          default:
            errorMessage += "An unknown error occurred.";
        }
        alert(errorMessage);
      },
      {
        enableHighAccuracy: true, // Request high accuracy GPS
        timeout: 10000, // 10 second timeout
        maximumAge: 0 // Don't use cached position
      }
    );
  };

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}, Bangalore&limit=5`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchResultClick = (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const newLocation: [number, number] = [lat, lng];
    
    // Calculate distance to airport
    const distance = calculateDistance(lat, lng, AIRPORT_LAT, AIRPORT_LNG);
    setDistanceToAirport(distance);
    
    onLocationSelect(lat, lng, result.display_name);
    setSearchResults([]);
    setSearchQuery('');
    setCurrentLocation(newLocation);
  };

  return (
    <div className="space-y-4">
      {/* Instructions */}
      {showInstructions && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 relative">
          <button
            onClick={() => setShowInstructions(false)}
            className="absolute top-2 right-2 text-blue-600 hover:text-blue-800"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-blue-600 text-2xl">info</span>
            <div>
              <p className="font-bold text-blue-900 text-sm mb-1">📍 Select Your Location:</p>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• <strong>Current Location:</strong> Click the blue button on the map</li>
                <li>• <strong>Search:</strong> Type your building/landmark name below</li>
                <li>• <strong>Or Click:</strong> Click directly on your location on the map</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Distance to Airport Display */}
      {distanceToAirport !== null && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white rounded-full p-2">
                <span className="material-symbols-outlined text-[24px]">flight_takeoff</span>
              </div>
              <div>
                <p className="text-xs text-slate-600 font-medium">Distance to Airport</p>
                <p className="text-2xl font-bold text-blue-900">{distanceToAirport} km</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-600">Estimated Time</p>
              <p className="text-lg font-bold text-blue-900">
                ~{Math.ceil(distanceToAirport / 40 * 60)} min
              </p>
              <p className="text-[10px] text-slate-500">at 40 km/h avg</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-blue-200">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">📍 Your Location → ✈️ Kempegowda Airport</span>
              <span className="text-blue-700 font-semibold">One Way</span>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search for a place in Bangalore..."
              className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-slate-200 rounded-xl shadow-xl z-10 max-h-60 overflow-y-auto">
            {searchResults.map((result, index) => (
              <button
                key={index}
                onClick={() => handleSearchResultClick(result)}
                className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-slate-100 last:border-b-0"
              >
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-blue-600 text-[20px] mt-0.5">location_on</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">{result.display_name.split(',')[0]}</p>
                    <p className="text-xs text-slate-500 line-clamp-1">{result.display_name}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map Container with Current Location Button */}
      <div ref={mapContainerRef} className="w-full h-[400px] rounded-2xl overflow-hidden border-2 border-slate-200 shadow-lg relative">
        {/* Current Location Button - Positioned like Google Maps */}
        <button
          onClick={getCurrentLocation}
          disabled={isGettingLocation}
          className="absolute top-4 right-4 z-[1000] bg-white hover:bg-gray-50 disabled:bg-gray-100 rounded-full p-3 shadow-lg border border-gray-200 transition-all"
          title="Use my current location"
        >
          {isGettingLocation ? (
            <span className="material-symbols-outlined text-blue-600 text-[24px] animate-spin">progress_activity</span>
          ) : (
            <span className="material-symbols-outlined text-blue-600 text-[24px]">my_location</span>
          )}
        </button>

        <MapContainer 
          center={center} 
          zoom={15} 
          scrollWheelZoom={true}
          zoomControl={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker 
            onLocationSelect={onLocationSelect} 
            onDistanceCalculate={setDistanceToAirport}
          />
          {currentLocation && <MapUpdater center={currentLocation} />}
        </MapContainer>
      </div>

      {/* Map Controls Info */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">zoom_in</span>
            Scroll to zoom
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">pan_tool</span>
            Drag to move
          </span>
        </div>
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">touch_app</span>
          Click to select
        </span>
      </div>
    </div>
  );
}
