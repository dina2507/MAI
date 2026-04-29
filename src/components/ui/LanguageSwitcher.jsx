import { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./LanguageSwitcher.css";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
  { code: "ta", label: "தமிழ்" },
  { code: "te", label: "తెలుగు" },
  { code: "bn", label: "বাংলা" },
  { code: "mr", label: "मराठी" },
  { code: "gu", label: "ગુજરાતી" },
  { code: "kn", label: "ಕನ್ನಡ" },
  { code: "ml", label: "മലയാളം" },
  { code: "pa", label: "ਪੰਜਾਬੀ" },
  { code: "ur", label: "اردو" },
];

export default function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("en");

  useEffect(() => {
    // Read the current language from the googtrans cookie
    const match = document.cookie.match(/googtrans=\/en\/([^;]+)/);
    if (match && match[1]) {
      setCurrentLang(match[1]);
    }

    // Inject Google Translate script if not already present
    if (!document.getElementById("google-translate-script")) {
      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "en,hi,ta,te,bn,mr,gu,kn,ml,pa,ur",
            autoDisplay: false,
          },
          "google_translate_element"
        );
      };

      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      document.body.appendChild(script);
    }
  }, []);

  function handleSelect(code) {
    setCurrentLang(code);
    setOpen(false);

    if (code === "en") {
      // Clear cookie to revert to original
      document.cookie = "googtrans=/en/en; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "googtrans=/en/en; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=" + window.location.hostname + "; path=/;";
    } else {
      // Set googtrans cookie for the whole site
      document.cookie = `googtrans=/en/${code}; path=/`;
      document.cookie = `googtrans=/en/${code}; domain=${window.location.hostname}; path=/`;
    }
    
    // Reload page to apply translation cleanly (prevents React DOM hydration errors)
    window.location.reload();
  }

  const currentLabel = LANGUAGES.find((l) => l.code === currentLang)?.label || "English";

  return (
    <div className="language-switcher">
      <div id="google_translate_element" style={{ display: "none" }}></div>
      
      <button 
        className="lang-btn" 
        onClick={() => setOpen(!open)}
        aria-label="Change language"
      >
        <Globe size={18} />
        <span className="lang-current">{currentLabel}</span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div 
              className="lang-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="lang-dropdown"
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.2 }}
            >
              <div className="lang-header text-caption">Select Language</div>
              <div className="lang-list">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    className={`lang-option ${currentLang === lang.code ? "active" : ""}`}
                    onClick={() => handleSelect(lang.code)}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
