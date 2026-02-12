import YTDlpWrap from 'yt-dlp-wrap';
const YTDlp = YTDlpWrap.default || YTDlpWrap;
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export async function downloadInstagram(url, options = {}) {
  try {
    const { format = 'mp4', quality = '720' } = options;
    const ytDlpPath = process.env.YTDLP_PATH || './yt-dlp';
    const ytDlpWrap = new YTDlp(ytDlpPath);
    
    const fileExt = format === 'mp3' ? 'mp3' : format;
    const filename = `instagram_${crypto.randomBytes(8).toString('hex')}.${fileExt}`;
    const filePath = path.join(process.cwd(), 'downloads', filename);
    
    console.log('Downloading Instagram video with Firefox cookies...');
    
    let videoInfo;
    try {
      videoInfo = await ytDlpWrap.getVideoInfo(url);
    } catch (e) {
      console.error('Error getting Instagram video info:', e);
      videoInfo = { title: 'Instagram Video' };
    }
    
    const args = [url, '--cookies-from-browser', 'firefox'];
    
    if (format === 'mp3') {
      args.push('-x', '--audio-format', 'mp3', '--audio-quality', '0');
    } else {
      const height = quality === 'best' ? '9999' : quality;
      const formatStr = format === 'webm' 
        ? `bestvideo[height<=${height}][ext=webm]+bestaudio[ext=webm]/best[height<=${height}]`
        : `bestvideo[height<=${height}][ext=mp4]+bestaudio/best[height<=${height}]`;
      args.push('-f', formatStr);
    }
    
    args.push('-o', filePath);
    
    await ytDlpWrap.execPromise(args);
    
    if (!fs.existsSync(filePath)) {
      throw new Error('Video file was not created');
    }
    
    const duration = videoInfo.duration ? `${Math.floor(videoInfo.duration / 60)}:${String(Math.floor(videoInfo.duration % 60)).padStart(2, '0')}` : null;
    
    return {
      success: true,
      filePath,
      title: videoInfo.title || videoInfo.description || 'Instagram Video',
      duration: duration
    };
    
  } catch (error) {
    console.error('Instagram download error:', error.message);
    return {
      success: false,
      error: 'Не удалось скачать видео с Instagram. Убедись что залогинен в Firefox на instagram.com'
    };
  }
}