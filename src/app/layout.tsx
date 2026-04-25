import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";

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
  title: "AirlinCabz | Premium Airport Taxi & Outstation Cabs in Bangalore",
  description:
    "Book premium airport taxis, outstation cabs, and local rentals in Bangalore. Experience safe, reliable, and comfortable rides with our fleet of Innova Crysta, TT, and Sedans at competitive prices.",
  keywords: [
    "cab booking bangalore", 
    "airport taxi bangalore", 
    "outstation cabs bangalore", 
    "innova crysta rental", 
    "tempo traveller booking", 
    "force urbania rent bangalore",
    "cheap airport taxi"
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
      </body>
    </html>
  );
}
