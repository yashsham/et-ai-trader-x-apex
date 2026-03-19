import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 
  | 'English' 
  | 'Hindi' 
  | 'Gujarati' 
  | 'Marathi' 
  | 'Bengali' 
  | 'Kannada' 
  | 'Tamil' 
  | 'Telugu';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  languageLabel: string;
}

const languageMap: Record<Language, string> = {
  English: 'English',
  Hindi: 'हिंदी',
  Gujarati: 'ગુજરાતી',
  Marathi: 'मराठी',
  Bengali: 'বাংলা',
  Kannada: 'ಕನ್ನಡ',
  Tamil: 'தமிழ்',
  Telugu: 'తెలుగు'
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('et_ai_language');
    return (saved as Language) || 'English';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('et_ai_language', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, languageLabel: languageMap[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
