import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Language, defaultLanguage } from './config';
import { en } from './translations/en';
import { es } from './translations/es';

const translations = {
  en,
  es,
} as const;

type TranslationStore = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
};

type TranslationValue = string | { [key: string]: TranslationValue };

export const useTranslation = create<TranslationStore>()(
  persist(
    (set, get) => ({
      language: defaultLanguage,
      setLanguage: (language: Language) => set({ language }),
      t: (key: string) => {
        const keys = key.split('.');
        let value: TranslationValue = translations[get().language];
        
        for (const k of keys) {
          if (typeof value === 'object' && value !== null) {
            value = value[k];
          } else {
            console.warn(`Translation key not found: ${key}`);
            return key;
          }
          if (value === undefined) {
            console.warn(`Translation key not found: ${key}`);
            return key;
          }
        }
        
        return typeof value === 'string' ? value : key;
      },
    }),
    {
      name: 'language-storage',
    }
  )
); 