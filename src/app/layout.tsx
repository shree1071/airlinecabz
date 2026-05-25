import type { Metadata } from "next";
import { Manrope, Inter, Geist } from "next/font/google";
import "./globals.css";
import FloatingContactButtons from "@/components/FloatingContactButtons";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "airlinecabz - Nearest Airport Taxi in Bangalore | Book Cab from ₹799 | 24/7 Service",
  description:
    "Book nearest airport taxi in Bangalore with airlinecabz. Instant cab booking from ₹799. 24/7 service to Kempegowda Airport. Reliable cabs near you in Koramangala, Whitefield, MG Road & all Bangalore areas. Call +91 98806 91116",
  keywords: [
    "nearest airport taxi bangalore",
    "airport cab near me bangalore", 
    "taxi near me bangalore",
    "cab near me bangalore airport",
    "kempegowda airport taxi",
    "bangalore airport cab booking",
    "airport taxi bangalore 24/7",
    "cheap airport taxi bangalore",
    "innova airport taxi bangalore",
    "airport cab koramangala",
    "airport taxi whitefield",
    "airport cab mg road",
    "airport taxi marathahalli",
    "outstation cab bangalore",
    "local taxi bangalore",
    "airlincabz",
    "airlin cabz bangalore"
  ],
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png" },
      { url: "/logo.png", sizes: "32x32", type: "image/png" },
      { url: "/logo.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/logo.png",
    shortcut: "/logo.png",
  },
  openGraph: {
    title: "airlinecabz - Nearest Airport Taxi in Bangalore | Book Cab from ₹799",
    description: "Book nearest airport taxi in Bangalore with airlinecabz. 24/7 service to Kempegowda Airport. Reliable cabs near you in all Bangalore areas.",
    type: "website",
    locale: "en_IN",
    siteName: "Airlinecabz",
    url: "https://www.airlinecabz.com",
    images: [
      {
        url: "https://www.airlinecabz.com/logo.png",
        width: 1200,
        height: 630,
        alt: "airlinecabz - Nearest Airport Taxi in Bangalore",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "airlinecabz - Nearest Airport Taxi in Bangalore",
    description: "Book nearest airport taxi in Bangalore. 24/7 service from ₹799. Reliable cabs near you.",
    images: ["https://www.airlinecabz.com/logo.png"],
  },
  alternates: {
    canonical: "https://www.airlinecabz.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", manrope.variable, inter.variable, "font-sans", geist.variable)}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <meta name="geo.region" content="IN-KA" />
        <meta name="geo.placename" content="Bangalore" />
        <meta name="geo.position" content="12.9716;77.5946" />
        <meta name="ICBM" content="12.9716, 77.5946" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "Airlinecabz",
              "alternateName": "Airlin Cabz",
              "description": "Nearest airport taxi and cab service in Bangalore. 24/7 airport pickup and drop, outstation cabs, and local taxi service.",
              "url": "https://www.airlinecabz.com",
              "telephone": "+919880691116",
              "email": "help@airlincabz.com",
              "priceRange": "₹₹",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Bangalore",
                "addressRegion": "Karnataka",
                "addressCountry": "IN"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": "12.9716",
                "longitude": "77.5946"
              },
              "areaServed": [
                {
                  "@type": "City",
                  "name": "Bangalore"
                },
                {
                  "@type": "City",
                  "name": "Bengaluru"
                }
              ],
              "openingHoursSpecification": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday"
                ],
                "opens": "00:00",
                "closes": "23:59"
              },
              "sameAs": [
                "https://www.airlinecabz.com"
              ],
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "reviewCount": "50000",
                "bestRating": "5",
                "worstRating": "1"
              },
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Taxi Services",
                "itemListElement": [
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Airport Taxi Service",
                      "description": "24/7 airport pickup and drop service to Kempegowda International Airport"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Outstation Cab Service",
                      "description": "Comfortable outstation taxi service from Bangalore to all South India destinations"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Local Taxi Service",
                      "description": "Local cab hire for city travel in Bangalore"
                    }
                  }
                ]
              }
            })
          }}
        />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        {children}
        <FloatingContactButtons />
      </body>

    </html>

);

}
