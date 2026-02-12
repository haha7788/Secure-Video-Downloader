import YTDlpWrap from 'yt-dlp-wrap';
const YTDlp = YTDlpWrap.default || YTDlpWrap;
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';

function getFormatString(format, quality) {
  if (format === 'mp3') {
    return null;
  }
  
  const height = quality === 'best' ? '9999' : quality;
  
  if (format === 'webm') {
    return `bestvideo[height<=${height}][ext=webm]+bestaudio[ext=webm]/bestvideo[height<=${height}]+bestaudio/best[height<=${height}][ext=webm]/best`;
  }
  
  return `bestvideo[height<=${height}][ext=mp4]+bestaudio[ext=m4a]/best[height<=${height}][ext=mp4]/best`;
}

export async function downloadYouTube(url, options = {}) {
  try {
    const { format = 'mp4', quality = '720' } = options;
    const ytDlpPath = process.env.YTDLP_PATH || './yt-dlp';
    const ytDlpWrap = new YTDlp(ytDlpPath);
    
    const fileExt = format === 'mp3' ? 'mp3' : format;
    const filename = `youtube_${crypto.randomBytes(8).toString('hex')}.${fileExt}`;
    const filePath = path.join(process.cwd(), 'downloads', filename);
    
    let videoInfo;
    try {
      videoInfo = await ytDlpWrap.getVideoInfo(url);
    } catch (e) {
      console.error('Error getting video info:', e);
      videoInfo = { title: 'YouTube Video' };
    }
    
    const args = [url];
    
    if (format === 'mp3') {
      args.push('-x', '--audio-format', 'mp3', '--audio-quality', '0');
    } else {
      const formatStr = getFormatString(format, quality);
      args.push('-f', formatStr);
      args.push('--merge-output-format', format);
    }
    
    args.push(
      '-o', filePath,
      '--no-playlist',
      '--quiet',
      '--no-warnings'
    );
    
    if (format !== 'mp3') {
      args.push('--add-metadata', '--embed-thumbnail');
    }
    
    await ytDlpWrap.execPromise(args);
    
    if (!fs.existsSync(filePath)) {
      throw new Error('Video file was not created');
    }
    
    const duration = videoInfo.duration ? `${Math.floor(videoInfo.duration / 60)}:${String(Math.floor(videoInfo.duration % 60)).padStart(2, '0')}` : null;
    
    return {
      success: true,
      filePath,
      title: videoInfo.title || 'YouTube Video',
      duration: duration
    };
    
  } catch (error) {
    console.error('YouTube download error:', error);
    
    try {
      return await downloadYouTubeFallback(url, options);
    } catch (fallbackError) {
      return {
        success: false,
        error: 'Не удалось скачать видео с YouTube'
      };
    }
  }
}

async function downloadYouTubeFallback(url, options = {}) {
  const { format = 'mp4', quality = '720' } = options;
  const ytDlpPath = process.env.YTDLP_PATH || './yt-dlp';
  const ytDlpWrap = new YTDlp(ytDlpPath);
  
  const fileExt = format === 'mp3' ? 'mp3' : format;
  const filename = `youtube_${crypto.randomBytes(8).toString('hex')}.${fileExt}`;
  const filePath = path.join(process.cwd(), 'downloads', filename);
  
  const args = [url];
  
  if (format === 'mp3') {
    args.push('-x', '--audio-format', 'mp3', '--audio-quality', '0');
  } else {
    args.push('-f', `best[ext=${format}]/best`);
  }
  
  args.push('-o', filePath, '--no-playlist');
  
  await ytDlpWrap.execPromise(args);
  
  if (!fs.existsSync(filePath)) {
    throw new Error('Video file was not created');
  }
  
  return {
    success: true,
    filePath,
    title: 'YouTube Video',
    duration: null
  };
}