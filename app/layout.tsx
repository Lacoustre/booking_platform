import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trayart GH Makeover | Luxury Bridal Makeup",
  description:
    "Luxury bridal and glam makeup in Accra, Ghana. Trayart GH Makeover creates unforgettable beauty experiences.",
  keywords: [
    "Trayart GH",
    "Makeup Artist Ghana",
    "Bridal Makeup Accra",
    "Luxury Makeup Ghana",
    "Wedding Makeup Artist",
  ],
  openGraph: {
    title: "Trayart GH Makeover",
    description: "Luxury bridal makeup and glam artistry in Accra Ghana.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
{/* Glitter background canvas */}
        <canvas className="glitter-canvas"></canvas>

        {children}

      </body>
    </html>
  );
}