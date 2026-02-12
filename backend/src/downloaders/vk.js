import YTDlpWrap from 'yt-dlp-wrap';
const YTDlp = YTDlpWrap.default || YTDlpWrap;
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';

export async function downloadVK(url, options = {}) {
  try {
    const { format = 'mp4', quality = '720' } = options;
    const ytDlpPath = process.env.YTDLP_PATH || './yt-dlp';
    const ytDlpWrap = new YTDlp(ytDlpPath);
    
    const fileExt = format === 'mp3' ? 'mp3' : format;
    const filename = `vk_${crypto.randomBytes(8).toString('hex')}.${fileExt}`;
    const filePath = path.join(process.cwd(), 'downloads', filename);
    
    let videoInfo;
    try {
      videoInfo = await ytDlpWrap.getVideoInfo(url);
    } catch (e) {
      console.error('Error getting VK video info:', e);
      videoInfo = { title: 'VK Video' };
    }
    
    const args = [url];
    
    if (format === 'mp3') {
      args.push('-x', '--audio-format', 'mp3', '--audio-quality', '0');
    } else {
      const height = quality === 'best' ? '9999' : quality;
      const formatStr = format === 'webm'
        ? `bestvideo[height<=${height}][ext=webm]+bestaudio[ext=webm]/best[height<=${height}]`
        : `bestvideo[height<=${height}][ext=mp4]+bestaudio/best[height<=${height}][ext=mp4]/best`;
      args.push('-f', formatStr, '--merge-output-format', format);
    }
    
    args.push('-o', filePath, '--quiet', '--no-warnings');
    
    await ytDlpWrap.execPromise(args);
    
    if (!fs.existsSync(filePath)) {
      throw new Error('Video file was not created');
    }
    
    const duration = videoInfo.duration ? `${Math.floor(videoInfo.duration / 60)}:${String(Math.floor(videoInfo.duration % 60)).padStart(2, '0')}` : null;
    
    return {
      success: true,
      filePath,
      title: videoInfo.title || 'VK Video',
      duration: duration
    };
    
  } catch (error) {
    console.error('VK download error:', error);
    return {
      success: false,
      error: 'Не удалось скачать видео с VK'
    };
  }
}