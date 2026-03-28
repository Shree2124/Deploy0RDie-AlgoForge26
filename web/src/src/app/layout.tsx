import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { AuthProvider } from "@/contexts/AuthContext";

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
        <AuthProvider>
          {children}
        </AuthProvider>

        {/* --- GOOGLE TRANSLATE WIDGET (HIDDEN) --- */}
        <div id="google_translate_element" style={{ display: 'none' }}></div>
        <Script id="google-translate-config" strategy="afterInteractive">
          {`
            function googleTranslateElementInit() {
              new window.google.translate.TranslateElement({
                pageLanguage: 'en',
                autoDisplay: false
              }, 'google_translate_element');
            }
          `}
        </Script>
        <Script src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" strategy="afterInteractive" />
      </body>
    </html>
  );
}
