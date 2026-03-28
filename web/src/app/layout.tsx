import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";

const tanAegean = localFont({
  src: "../../public/fonts/Retro-floral.ttf",
  variable: "--font-display",
  display: "swap",
});

const helvetica = localFont({
  src: "../../public/fonts/Helvetica-Neue-CE-55-Roman.ttf",
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Civic.ai - Infrastructure Audit & Transparency Portal",
  description:
    "Empowering citizens to ensure transparency and accountability in public infrastructure through AI-powered audits and geospatial verification.",
  icons: {
    icon: "/mainlogo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased ${helvetica.variable} ${tanAegean.variable} font-sans`}>
        {children}

      </body>
    </html>
  );
}
