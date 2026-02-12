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

export const formatSelectionKeyboard = (lang = 'ru') => {
  const t = translations[lang] || translations.ru;
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('MP4', 'format_mp4'),
      Markup.button.callback('WebM', 'format_webm'),
      Markup.button.callback('MP3', 'format_mp3')
    ],
    [Markup.button.callback(t.cancel, 'cancel_download')]
  ]);
};

export const qualitySelectionKeyboard = (lang = 'ru') => {
  const t = translations[lang] || translations.ru;
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('360p', 'quality_360'),
      Markup.button.callback('480p', 'quality_480'),
      Markup.button.callback('720p', 'quality_720')
    ],
    [
      Markup.button.callback('1080p', 'quality_1080'),
      Markup.button.callback('1440p', 'quality_1440'),
      Markup.button.callback('4K', 'quality_2160')
    ],
    [Markup.button.callback(t.best, 'quality_best')],
    [Markup.button.callback(t.cancel, 'cancel_download')]
  ]);
};