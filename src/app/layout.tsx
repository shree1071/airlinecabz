import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
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
  title: "AirlinCabz | Premium Mobility Solutions",
  description:
    "Experience the pinnacle of urban mobility. From airport transfers to executive travel, AirlinCabz delivers precision, comfort, and reliability in every mile.",
  keywords: ["cab booking", "premium taxi", "airport transfer", "chauffeur service", "luxury rides"],
};

import Script from "next/script";

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
        <ClerkProvider>
          {children}
          <Script src="https://checkout.razorpay.com/v1/checkout.js" />
        </ClerkProvider>
      </body>
    </html>
  );
}
