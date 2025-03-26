import { languages, languageNames } from '@/lib/i18n/config';
import { useTranslation } from '@/lib/i18n/useTranslation';

export function LanguageSelector() {
  const { language, setLanguage, t } = useTranslation();

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="language" className="text-sm font-medium text-white">
        {t('settings.language')}
      </label>
      <select
        id="language"
        value={language}
        onChange={(e) => setLanguage(e.target.value as 'en' | 'es')}
        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
      >
        {languages.map((lang) => (
          <option key={lang} value={lang}>
            {languageNames[lang]}
          </option>
        ))}
      </select>
    </div>
  );
} 