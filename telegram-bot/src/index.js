import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import dotenv from 'dotenv';
import axios from 'axios';
import { userLanguageManager } from './utils/userLanguage.js';
import { rateLimiter } from './utils/rateLimiter.js';

import {
  showMainMenu,
  showInfo,
  handleLanguageSelection,
  handleLanguageChange
} from './handlers/user.js';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

bot.use(async (ctx, next) => {
  if (!ctx.from) return next();

  if (!rateLimiter.canPerform(ctx.from.id)) {
    const remaining = rateLimiter.getRemainingCooldown(ctx.from.id);
    const lang = userLanguageManager.getLanguage(ctx.from.id);
    const message = lang === 'ru' 
      ? `⏳ Пожалуйста, подождите ${remaining} сек. перед следующим действием.`
      : `⏳ Please wait ${remaining} sec. before next action.`;
    
    if (ctx.callbackQuery) {
      await ctx.answerCbQuery(message, { show_alert: true });
    } else {
      await ctx.reply(message);
    }
    return;
  }
  
  return next();
});

bot.start(showMainMenu);

bot.action('back_to_main', showMainMenu);
bot.action('info', showInfo);

bot.action('lang_ru', (ctx) => handleLanguageSelection(ctx, 'ru'));
bot.action('lang_en', (ctx) => handleLanguageSelection(ctx, 'en'));
bot.action('change_lang', handleLanguageChange);

bot.on(message('text'), async (ctx) => {
  const text = ctx.message.text.trim();
  const lang = userLanguageManager.getLanguage(ctx.from.id);
  const { translations } = await import('./utils/locales.js');
  const t = translations[lang];
  
  if (!text.match(/^https?:\/\//)) {
    return ctx.reply(
      t.invalidUrl,
      { reply_markup: { inline_keyboard: [[{ text: 'ℹ️ ' + (lang === 'ru' ? 'Информация' : 'Information'), callback_data: 'info' }]] } }
    );
  }
  
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
    } catch (e) {
    }
  }, 1000);
  
  try {
    const response = await axios.post(`${BACKEND_URL}/api/download`, {
      url: text
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
    
    const botUsername = ctx.botInfo.username.replace(/_/g, '\\_');
    
    const escapeMarkdown = (text) => text.replace(/[_*\[\]()~`>#+\-=|{}.!]/g, '\\$&');
    
    const videoTitle = data.title ? escapeMarkdown(data.title) : (lang === 'ru' ? 'Без названия' : 'Untitled');
    const duration = data.duration ? `${t.duration}: ${data.duration}` : '';
    
    const caption = `
${t.downloaded} ${data.platform}*

${t.description}: ${videoTitle}
${duration ? duration + '\n' : ''}${t.size}: ${sizeMB} MB

${t.downloadedVia} @${botUsername}
    `.trim();
    
    const videoUrl = `${BACKEND_URL}${data.downloadUrl}`;
    
    await ctx.replyWithVideo(
      { url: videoUrl },
      { 
        caption,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: t.downloadMore, callback_data: 'back_to_main' }]
          ]
        }
      }
    );
    
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
});

bot.catch((err, ctx) => {
  console.error('Bot error:', err);
  const lang = ctx.from ? userLanguageManager.getLanguage(ctx.from.id) : 'ru';
  const message = lang === 'ru' 
    ? '❌ Произошла внутренняя ошибка. Попробуй позже.'
    : '❌ An internal error occurred. Try again later.';
  ctx.reply(message);
});

bot.launch().then(() => {
  console.log('');
  console.log('╔═══════════════════════════════════════╗');
  console.log('║   🚀 SecureVideoDownloader Bot Started   ║');
  console.log('╚═══════════════════════════════════════╝');
  console.log('');
  console.log('✅ Bot is running and ready!');
  console.log('📊 Database initialized');
  console.log('🎥 Ready to download videos!');
  console.log('');
  console.log('Supported platforms:');
  console.log('  🎵 TikTok');
  console.log('  📸 Instagram');
  console.log('  ▶️  YouTube');
  console.log('');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));