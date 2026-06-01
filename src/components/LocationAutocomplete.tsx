"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";

// Dummy exports so book/page.tsx imports don't break
export const libraries: "places"[] = ["places"];
export function useLoadScript(_opts: unknown) {
  return { isLoaded: true, loadError: null };
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address: {
    road?: string;
    suburb?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}

interface LocationAutocompleteProps {
  onSelect: (lat: number, lng: number, address: string) => void;
  placeholder?: string;
  className?: string;
  defaultValue?: string;
  error?: boolean;
  /** Ignored — kept for API compatibility with Google Places version */
  isLoaded?: boolean;
}

export default function LocationAutocomplete({
  onSelect,
  placeholder = "Enter location...",
  className = "",
  defaultValue = "",
  error = false,
}: LocationAutocompleteProps) {
  const [value, setValue] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync defaultValue changes (e.g. when parent resets the field)
  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setLoading(true);
    try {
      // Bangalore bounding box: SW(12.7342, 77.3791) → NE(13.1736, 77.8284)
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
          new URLSearchParams({
            q: `${query}, Bangalore`,
            format: "json",
            addressdetails: "1",
            limit: "8",
            countrycodes: "in",
            viewbox: "77.3791,12.7342,77.8284,13.1736", // lon_min,lat_min,lon_max,lat_max
            bounded: "1", // Only return results inside the viewbox
            "accept-language": "en",
          }),
        {
          headers: {
            "User-Agent": "airlinecabz-booking/1.0 (help@airlincabz.com)",
          },
        }
      );
      const raw: NominatimResult[] = await res.json();
      // Extra safety filter: only show results that mention Bangalore/Bengaluru
      const data = raw.filter((r) =>
        /bangalore|bengaluru/i.test(r.display_name)
      );
      setSuggestions(data);
      setShowSuggestions(data.length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 350);
  };

  const handleSelect = (result: NominatimResult) => {
    setValue(result.display_name);
    setSuggestions([]);
    setShowSuggestions(false);
    onSelect(parseFloat(result.lat), parseFloat(result.lon), result.display_name);
  };

  const handleClear = () => {
    setValue("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Format suggestion label — show short name + secondary info
  const formatMain = (r: NominatimResult) => {
    const parts = r.display_name.split(",");
    return parts[0].trim();
  };
  const formatSecondary = (r: NominatimResult) => {
    const parts = r.display_name.split(",");
    return parts.slice(1, 4).join(",").trim();
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative flex items-center">
        <span className="absolute left-4 material-symbols-outlined z-10 text-slate-400">
          {loading ? "hourglass_top" : "search"}
        </span>
        <input
          value={value}
          onChange={handleChange}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder={placeholder}
          autoComplete="off"
          className={`input-field pl-12 pr-10 w-full ${
            error ? "border-2 border-red-500 focus:border-red-500" : ""
          } ${className}`}
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-4 material-symbols-outlined text-slate-600 hover:text-slate-800"
          >
            close
          </button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto divide-y divide-slate-100">
          {suggestions.map((result) => (
            <li
              key={result.place_id}
              onClick={() => handleSelect(result)}
              className="px-4 py-3 cursor-pointer hover:bg-slate-50 flex items-start gap-3 transition-colors"
            >
              <span className="material-symbols-outlined text-slate-400 mt-0.5 shrink-0">
                location_on
              </span>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-slate-900 truncate">
                  {formatMain(result)}
                </span>
                <span className="text-xs text-slate-500 truncate">
                  {formatSecondary(result)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
