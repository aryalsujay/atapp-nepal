import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '@/translations/en.json';
import ne from '@/translations/ne.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ne: { translation: ne },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  compatibilityJSON: 'v4',
});

export default i18n;
