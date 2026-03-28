"use client";

import React, { useEffect, useState } from "react";
import { Globe } from "lucide-react";

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "hi", name: "हिन्दी" },
  { code: "mr", name: "मराठी" },
  { code: "gu", name: "ગુજરાતી" },
  { code: "bn", name: "বাংলা" },
  { code: "ta", name: "தமிழ்" },
  { code: "te", name: "తెలుగు" },
];

export function LanguageSelector() {
  const [currentLang, setCurrentLang] = useState("en");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // 1. Check cookie for current language
    const match = document.cookie.match(/(?:^|;)\s*googtrans=([^;]*)/);
    if (match && match[1]) {
      const parts = match[1].split("/");
      if (parts.length > 2) {
        setCurrentLang(parts[2]);
      }
    }

    // 2. Aggressive DOM Cleanup to hide Google Translate Banner
    const hideGoogleTranslate = () => {
      // Force body to top
      if (document.body) {
        document.body.style.top = "0px";
        document.body.style.position = "static";
        document.body.style.marginTop = "0px";
      }

      // Hide the iframe dynamically if it exists
      const iframes = document.querySelectorAll('.skiptranslate iframe, iframe.goog-te-banner-frame');
      iframes.forEach((iframe) => {
        (iframe as HTMLElement).style.display = 'none';
      });
    };

    // Run immediately
    hideGoogleTranslate();

    // Use MutationObserver to catch Google injecting the banner AFTER initial render
    const observer = new MutationObserver(() => {
      hideGoogleTranslate();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style'] // Reacts immediately if Google tries to add 'top: 40px'
    });

    return () => observer.disconnect();
  }, []);

  const changeLanguage = (langCode: string) => {
    if (langCode === currentLang) {
      setIsOpen(false);
      return;
    }

    // Set googtrans cookie
    const cookieString = `/en/${langCode}`;

    document.cookie = `googtrans=${cookieString};path=/;`;
    document.cookie = `googtrans=${cookieString};path=/;domain=${window.location.host};`;

    window.location.reload();
  };

  const selectedPrefix = LANGUAGES.find(l => l.code === currentLang)?.name.substring(0, 2).toUpperCase() || "EN";

  return (
    <>
      {/* 3. Inject raw CSS directly to bypass Next.js global caching issues */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .skiptranslate iframe, .goog-te-banner-frame { display: none !important; }
        body { top: 0px !important; position: static !important; margin-top: 0px !important; }
        .goog-tooltip { display: none !important; }
        .goog-tooltip:hover { display: none !important; }
        .goog-text-highlight { background-color: transparent !important; border: none !important; box-shadow: none !important; }
        #goog-gt-tt { display: none !important; }
      `}} />

      <div className="relative inline-block text-left">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 h-9 px-3 rounded-md border font-medium transition-colors hover:shadow-sm"
          style={{
            borderColor: '#b0d8db',
            backgroundColor: '#f4feff',
            color: '#57737a',
          }}
          aria-expanded={isOpen}
        >
          <Globe size={16} />
          <span className="text-sm hidden sm:inline-block">{selectedPrefix}</span>
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <div
              className="absolute right-0 mt-2 w-40 rounded-xl shadow-lg z-50 overflow-hidden notranslate"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #b0d8db'
              }}
            >
              <div className="py-1">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${currentLang === lang.code ? 'font-bold' : ''
                      }`}
                    style={{
                      backgroundColor: currentLang === lang.code ? '#e0f7f9' : 'transparent',
                      color: currentLang === lang.code ? '#040f0f' : '#57737a',
                    }}
                    onMouseEnter={(e) => {
                      if (currentLang !== lang.code) {
                        e.currentTarget.style.backgroundColor = '#f4feff';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentLang !== lang.code) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}