import { userLanguageManager } from '../utils/userLanguage.js';
import { mainMenuKeyboard, backButton } from '../utils/keyboards.js';
import { translations } from '../utils/locales.js';

function getT(userId) {
  const lang = userLanguageManager.getLanguage(userId);
  const t = translations[lang] || translations.ru;
  return t;
}

export async function showMainMenu(ctx) {
  const lang = userLanguageManager.getLanguage(ctx.from.id);
  const t = getT(ctx.from.id);
  
  const message = `
${t.welcome}

${t.canDownload}
✅ ${t.tiktok}
✅ ${t.instagram}
✅ ${t.youtube}
✅ ${t.vk}
✅ ${t.rutube}

${t.sendLink}
`.trim();

  try {
    if (ctx.callbackQuery) {
      await ctx.editMessageText(message, {
        parse_mode: 'Markdown',
        ...mainMenuKeyboard(lang)
      });
      await ctx.answerCbQuery();
    } else {
      await ctx.reply(message, {
        parse_mode: 'Markdown',
        ...mainMenuKeyboard(lang)
      });
    }
  } catch (e) {
    await ctx.reply(message, {
      parse_mode: 'Markdown',
      ...mainMenuKeyboard(lang)
    });
  }
}

export async function showInfo(ctx) {
  const lang = userLanguageManager.getLanguage(ctx.from.id);
  const t = getT(ctx.from.id);
  
  const infoMessage = `
${t.infoTitle}

${t.infoDescription}

${t.supportedPlatforms}
🎵 *TikTok* — ${t.tiktok}
📸 *Instagram* — ${t.instagram}
▶️ *YouTube* — ${t.youtube}
🎬 *VK* — ${t.vk}
📺 *Rutube* — ${t.rutube}

${t.howToUse}
${t.step1}
${t.step2}
${t.step3}

${t.examples}
• \`tiktok.com/@user/video/...\`
• \`instagram.com/reel/...\`
• \`youtube.com/watch?v=...\`
• \`vk.com/video-12345_67890\` или \`vkvideo.ru/video-...\`
• \`rutube.ru/video/abc123/\`

${t.features}
${t.noWatermarks}
${t.highQuality}
${t.fastProcessing}
${t.noLimits}
${t.free}
  `.trim();

  try {
    if (ctx.callbackQuery) {
      await ctx.editMessageText(infoMessage, {
        parse_mode: 'Markdown',
        ...backButton(lang, 'back_to_main')
      });
      await ctx.answerCbQuery();
    } else {
      await ctx.reply(infoMessage, {
        parse_mode: 'Markdown',
        ...mainMenuKeyboard(lang)
      });
    }
  } catch (e) {
    await ctx.reply(infoMessage, {
      parse_mode: 'Markdown',
      ...mainMenuKeyboard(lang)
    });
  }
}

export async function handleLanguageSelection(ctx, language) {
  userLanguageManager.setLanguage(ctx.from.id, language);
  const t = getT(ctx.from.id);
  
  await ctx.answerCbQuery(t.languageSelected);
  await showMainMenu(ctx);
}

export async function handleLanguageChange(ctx) {
  const currentLang = userLanguageManager.getLanguage(ctx.from.id);
  const newLang = currentLang === 'ru' ? 'en' : 'ru';
  
  userLanguageManager.setLanguage(ctx.from.id, newLang);
  const t = getT(ctx.from.id);
  
  await ctx.answerCbQuery(t.languageSelected);
  await showMainMenu(ctx);
}