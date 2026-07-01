"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { defaultTranslations, TranslationMap } from "@/lib/translationData";

type Locale = "pt" | "es";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  updateTranslation: (key: string, ptValue: string, esValue: string) => void;
  allTranslations: TranslationMap;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>("pt");
  const [allTranslations, setAllTranslations] = useState<TranslationMap>(defaultTranslations);

  useEffect(() => {
    // Load preference from localStorage
    const savedLocale = localStorage.getItem("muebles_locale") as Locale;
    if (savedLocale === "pt" || savedLocale === "es") {
      setLocaleState(savedLocale);
    }

    // Load custom translations from localStorage if any
    const savedCustomTranslations = localStorage.getItem("muebles_custom_translations");
    if (savedCustomTranslations) {
      try {
        const parsed = JSON.parse(savedCustomTranslations);
        setAllTranslations((prev) => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error("Failed to parse custom translations", e);
      }
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("muebles_locale", newLocale);
  };

  const t = (key: string): string => {
    const entry = allTranslations[key];
    if (!entry) return key;
    return entry[locale] || entry["pt"] || key;
  };

  const updateTranslation = (key: string, ptValue: string, esValue: string) => {
    const updated = {
      ...allTranslations,
      [key]: { pt: ptValue, es: esValue }
    };
    setAllTranslations(updated);
    
    // Save custom translations in localStorage to mock DB persistence
    const savedCustomTranslations = localStorage.getItem("muebles_custom_translations");
    let currentCustom: TranslationMap = {};
    if (savedCustomTranslations) {
      try {
        currentCustom = JSON.parse(savedCustomTranslations);
      } catch (e) {}
    }
    currentCustom[key] = { pt: ptValue, es: esValue };
    localStorage.setItem("muebles_custom_translations", JSON.stringify(currentCustom));
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, updateTranslation, allTranslations }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
};
