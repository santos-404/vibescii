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

export const useTranslation = create<TranslationStore>()(
  persist(
    (set, get) => ({
      language: defaultLanguage,
      setLanguage: (language: Language) => set({ language }),
      t: (key: string) => {
        const keys = key.split('.');
        let value: any = translations[get().language];
        
        for (const k of keys) {
          value = value?.[k];
          if (value === undefined) {
            console.warn(`Translation key not found: ${key}`);
            return key;
          }
        }
        
        return value;
      },
    }),
    {
      name: 'language-storage',
    }
  )
); 