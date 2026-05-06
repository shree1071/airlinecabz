"use client";

import { useState } from 'react';

export default function FloatingContactButtons() {
  const [isExpanded, setIsExpanded] = useState(false);

  const phoneNumber = "+919880691116";
  const whatsappNumber = "919880691116";
  const whatsappMessage = "Hello! I want to book a cab with AirlinCabz.";

  return (
    <>
      {/* Desktop Version - Side by side buttons */}
      <div className="hidden md:flex fixed bottom-8 right-8 z-40 gap-3">
        {/* WhatsApp Button */}
        <a
          href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white px-5 py-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
          aria-label="Contact via WhatsApp"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          <span className="font-semibold text-sm">WhatsApp</span>
        </a>

        {/* Call Button */}
        <a
          href={`tel:${phoneNumber}`}
          className="group flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-5 py-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
          aria-label="Call us"
        >
          <span className="material-symbols-outlined text-[24px]">call</span>
          <span className="font-semibold text-sm">Call Now</span>
        </a>
      </div>

      {/* Mobile Version - Expandable FAB */}
      <div className="md:hidden fixed bottom-20 right-4 z-40">
        {/* Expanded Buttons */}
        {isExpanded && (
          <div className="absolute bottom-16 right-0 flex flex-col gap-3 animate-fade-in-up">
            {/* WhatsApp Button */}
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-3 rounded-full shadow-xl transition-all duration-300 active:scale-95 min-w-[140px]"
              onClick={() => setIsExpanded(false)}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              <span className="font-semibold text-sm">WhatsApp</span>
            </a>

            {/* Call Button */}
            <a
              href={`tel:${phoneNumber}`}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-full shadow-xl transition-all duration-300 active:scale-95 min-w-[140px]"
              onClick={() => setIsExpanded(false)}
            >
              <span className="material-symbols-outlined text-[20px]">call</span>
              <span className="font-semibold text-sm">Call Now</span>
            </a>
          </div>
        )}

        {/* Main FAB Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-300 ${
            isExpanded 
              ? 'bg-red-500 hover:bg-red-600 rotate-45' 
              : 'bg-gradient-to-r from-green-500 to-blue-600 hover:scale-110'
          }`}
          aria-label={isExpanded ? "Close contact menu" : "Open contact menu"}
        >
          <span className="material-symbols-outlined text-white text-[28px]">
            {isExpanded ? 'close' : 'call'}
          </span>
        </button>
      </div>
    </>
  );
}
