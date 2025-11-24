import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

// eslint-disable-next-line import/no-named-as-default-member -- intended
void i18next
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    supportedLngs: ["zh", "en"],
    fallbackLng: "zh",
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    backend: {
      loadPath: `${import.meta.env.BASE_URL}locales/{{lng}}/translation.json`,
    },
    detection: {
      lookupQuerystring: "lang",
      lookupLocalStorage: "i18nextLang",
    },
  });

/*
// Expose i18n to the global scope for debugging purposes
declare global {
  interface Window {
    i18n: typeof i18n;
  }
}
window.i18n = i18n;
*/
