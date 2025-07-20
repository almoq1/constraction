import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import enTranslation from './locales/en/translation.json';
import drTranslation from './locales/dr/translation.json';
import psTranslation from './locales/ps/translation.json';

const resources = {
  en: {
    translation: enTranslation
  },
  dr: {
    translation: drTranslation
  },
  ps: {
    translation: psTranslation
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes values
    },
    react: {
      useSuspense: false
    }
  });

export default i18n;