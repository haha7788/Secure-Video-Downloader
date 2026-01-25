import { ref } from 'vue';
import { translations } from '../utils/locales.js';

const locale = ref('ru');

export function useLocale() {
  const t = (key) => {
    if (key === 'langBtn') {
      return locale.value === 'ru' ? 'EN' : 'RU';
    }
    if (key === 'themeBtn') {
      const { theme } = useTheme();
      return theme.value === 'dark' 
        ? (locale.value === 'ru' ? 'Светлая' : 'Light') 
        : (locale.value === 'ru' ? 'Тёмная' : 'Dark');
    }
    
    const keys = key.split('.');
    let value = translations[locale.value];
    for (const k of keys) {
      value = value[k];
    }
    return value;
  };

  const toggleLocale = () => {
    locale.value = locale.value === 'ru' ? 'en' : 'ru';
    localStorage.setItem('locale', locale.value);
  };

  const initLocale = () => {
    const savedLocale = localStorage.getItem('locale');
    if (savedLocale) {
      locale.value = savedLocale;
    }
  };

  return {
    locale,
    t,
    toggleLocale,
    initLocale
  };
}

import { useTheme } from './useTheme.js';