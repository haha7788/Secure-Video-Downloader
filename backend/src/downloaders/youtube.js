import YTDlpWrap from 'yt-dlp-wrap';
const YTDlp = YTDlpWrap.default || YTDlpWrap;
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';

export async function downloadYouTube(url) {
  try {
    const ytDlpPath = process.env.YTDLP_PATH || './yt-dlp';
    const ytDlpWrap = new YTDlp(ytDlpPath);
    
    const filename = `youtube_${crypto.randomBytes(8).toString('hex')}.mp4`;
    const filePath = path.join(process.cwd(), 'downloads', filename);
    
    let videoInfo;
    try {
      videoInfo = await ytDlpWrap.getVideoInfo(url);
    } catch (e) {
      console.error('Error getting video info:', e);
      videoInfo = { title: 'YouTube Video' };
    }
    
    await ytDlpWrap.execPromise([
      url,
      '-f', 'bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]/best',
      '--merge-output-format', 'mp4',
      '-o', filePath,
      '--no-playlist',
      '--quiet',
      '--no-warnings',
      '--add-metadata',
      '--embed-thumbnail'
    ]);
    
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
      return await downloadYouTubeFallback(url);
    } catch (fallbackError) {
      return {
        success: false,
        error: 'Не удалось скачать видео с YouTube'
      };
    }
  }
}

async function downloadYouTubeFallback(url) {
  const ytDlpPath = process.env.YTDLP_PATH || './yt-dlp';
  const ytDlpWrap = new YTDlp(ytDlpPath);
  
  const filename = `youtube_${crypto.randomBytes(8).toString('hex')}.mp4`;
  const filePath = path.join(process.cwd(), 'downloads', filename);
  
  await ytDlpWrap.execPromise([
    url,
    '-f', 'best[ext=mp4]/best',
    '-o', filePath,
    '--no-playlist'
  ]);
  
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