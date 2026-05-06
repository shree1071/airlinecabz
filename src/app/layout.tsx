import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";
import FloatingContactButtons from "@/components/FloatingContactButtons";

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
  title: "AirlinCabz - Premium Airport Taxi Bangalore | Book Now ₹799 | Low Cancellation",
  description:
    "Book premium airport taxi in Bangalore with competitive pricing & low cancellation rate. 24/7 service from ₹799. Kempegowda airport pickup & drop. Toll & parking extra. Call +91 98806 91116",
  keywords: [
    "airport taxi bangalore", 
    "kempegowda airport cab", 
    "premium taxi service bangalore",
    "airport pickup bangalore",
    "airport drop bangalore",
    "cheap airport taxi",
    "reliable cab service",
    "24/7 taxi bangalore",
    "low cancellation taxi",
    "competitive pricing cab",
    "innova crysta airport taxi",
    "tempo traveller airport"
  ],
  openGraph: {
    title: "AirlinCabz | Premium Airport Taxi & Outstation Cabs",
    description: "Book premium airport taxis, outstation cabs, and local rentals in Bangalore. Safe, reliable, and comfortable rides.",
    type: "website",
    locale: "en_IN",
    siteName: "AirlinCabz"
  },
  twitter: {
    card: "summary_large_image",
    title: "AirlinCabz | Premium Airport Taxi",
    description: "Book premium airport taxis, outstation cabs, and local rentals in Bangalore.",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${inter.variable} h-full`}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        {children}
        <FloatingContactButtons />
      </body>
    </html>
  );
}
