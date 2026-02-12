import { userLanguageManager } from '../utils/userLanguage.js';
import { mainMenuKeyboard, backButton, formatSelectionKeyboard, qualitySelectionKeyboard } from '../utils/keyboards.js';
import { translations } from '../utils/locales.js';
import axios from 'axios';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';
export const userDownloadState = new Map();

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

export async function handleFormatSelection(ctx, format) {
  const lang = userLanguageManager.getLanguage(ctx.from.id);
  const t = getT(ctx.from.id);
  const state = userDownloadState.get(ctx.from.id);
  
  if (!state) {
    await ctx.answerCbQuery();
    return showMainMenu(ctx);
  }
  
  state.format = format;
  userDownloadState.set(ctx.from.id, state);
  
  await ctx.answerCbQuery();
  
  if (format === 'mp3') {
    await ctx.deleteMessage();
    return downloadVideo(ctx, state.url, format, '720');
  }
  
  await ctx.editMessageText(t.selectQuality, { 
    parse_mode: 'Markdown', 
    ...qualitySelectionKeyboard(lang)
  });
}

export async function handleQualitySelection(ctx, quality) {
  const state = userDownloadState.get(ctx.from.id);
  
  if (!state) {
    await ctx.answerCbQuery();
    return showMainMenu(ctx);
  }
  
  await ctx.answerCbQuery();
  await ctx.deleteMessage();
  
  return downloadVideo(ctx, state.url, state.format, quality);
}

export async function cancelDownload(ctx) {
  userDownloadState.delete(ctx.from.id);
  await ctx.answerCbQuery();
  await ctx.deleteMessage();
  await showMainMenu(ctx);
}

async function downloadVideo(ctx, url, format, quality) {
  const lang = userLanguageManager.getLanguage(ctx.from.id);
  const t = getT(ctx.from.id);
  
  userDownloadState.delete(ctx.from.id);
  
  const processingEmojis = ['⏳', '🔄', '⚡', '🎬'];
  let emojiIndex = 0;
  
  const processingMsg = await ctx.reply(`${processingEmojis[0]} ${t.processing} ${t.video}`);
  
  const animationInterval = setInterval(async () => {
    emojiIndex = (emojiIndex + 1) % processingEmojis.length;
    try {
      await ctx.telegram.editMessageText(
        ctx.chat.id,
        processingMsg.message_id,
        null,
        `${processingEmojis[emojiIndex]} ${t.processing} ${t.video}`
      );
    } catch (e) {}
  }, 1000);
  
  try {
    const response = await axios.post(`${BACKEND_URL}/api/download`, {
      url,
      format,
      quality
    });
    
    clearInterval(animationInterval);
    
    if (!response.data.success) {
      await ctx.telegram.editMessageText(
        ctx.chat.id,
        processingMsg.message_id,
        null,
        `${t.error}: ${response.data.error}`
      );
      return;
    }
    
    await ctx.telegram.deleteMessage(ctx.chat.id, processingMsg.message_id);
    
    const data = response.data;
    const sizeMB = (data.fileSize / (1024 * 1024)).toFixed(2);
    
    const escapeHtml = (text) => {
      return text.replace(/&/g, '&amp;')
                 .replace(/</g, '&lt;')
                 .replace(/>/g, '&gt;');
    };
    
    const botUsername = ctx.botInfo.username;
    const videoTitle = data.title ? escapeHtml(data.title) : (lang === 'ru' ? 'Без названия' : 'Untitled');
    const platformName = escapeHtml(data.platform);
    const durationLine = data.duration ? `⏱️ <b>${t.duration}:</b> ${data.duration}\n` : '';
    
    const caption = `✅ <b>${t.downloaded} ${platformName}</b>

📝 <b>${t.description}:</b> ${videoTitle}
${durationLine}📦 <b>${t.size}:</b> ${sizeMB} MB

🔗 ${t.downloadedVia} @${botUsername}`.trim();
    
    const fileUrl = `${BACKEND_URL}${data.downloadUrl}`;
    
    if (format === 'mp3') {
      await ctx.replyWithAudio(
        { url: fileUrl },
        { 
          caption,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: t.downloadMore, callback_data: 'back_to_main' }]
            ]
          }
        }
      );
    } else {
      await ctx.replyWithVideo(
        { url: fileUrl },
        { 
          caption,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: t.downloadMore, callback_data: 'back_to_main' }]
            ]
          }
        }
      );
    }
    
  } catch (error) {
    clearInterval(animationInterval);
    console.error('Error processing video:', error);
    
    try {
      await ctx.telegram.editMessageText(
        ctx.chat.id,
        processingMsg.message_id,
        null,
        t.errorProcessing
      );
    } catch (e) {
      await ctx.reply(t.errorProcessing);
    }
  }
}