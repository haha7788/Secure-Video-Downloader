import { Markup } from 'telegraf';
import { translations } from './locales.js';

export const languageSelectionKeyboard = () => {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('🇷🇺 Русский', 'lang_ru'),
      Markup.button.callback('🇬🇧 English', 'lang_en')
    ]
  ]);
};

export const mainMenuKeyboard = (lang = 'ru') => {
  const buttons = lang === 'ru' 
    ? [
        [
          Markup.button.callback('ℹ️ Информация', 'info'),
          Markup.button.callback('🇬🇧 EN', 'change_lang')
        ]
      ]
    : [
        [
          Markup.button.callback('ℹ️ Information', 'info'),
          Markup.button.callback('🇷🇺 RU', 'change_lang')
        ]
      ];
  
  return Markup.inlineKeyboard(buttons);
};

export const backButton = (lang = 'ru', action = 'back_to_main') => {
  const t = translations[lang] || translations.ru;
  return Markup.inlineKeyboard([
    [Markup.button.callback(t.backButton, action)]
  ]);
};