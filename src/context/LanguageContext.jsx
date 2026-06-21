import { createContext, useState, useEffect } from 'react';
import en from '../locales/en';
import am from '../locales/am';

const translations = { en, am };

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        try {
            const saved = localStorage.getItem('notflix-language');
            return translations[saved] ? saved : 'en';
        } catch (error) {
            console.error('Error reading language cache:', error);
            return 'en';
        }
    });

    const t = translations[language] || en;

    const changeLanguage = (lang) => {
        if (!translations[lang]) return;
        setLanguage(lang);
        localStorage.setItem('notflix-language', lang);
    };

    // Apply data-lang attribute to body so CSS font rules can target it
    useEffect(() => {
        document.body.setAttribute('data-lang', language);
        // Also update html lang for accessibility
        document.documentElement.setAttribute('lang', language);
    }, [language]);

    return (
        <LanguageContext.Provider value={{ language, changeLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export default LanguageContext;
