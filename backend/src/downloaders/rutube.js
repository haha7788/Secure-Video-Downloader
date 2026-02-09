import YTDlpWrap from 'yt-dlp-wrap';
const YTDlp = YTDlpWrap.default || YTDlpWrap;
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';

export async function downloadRutube(url) {
  try {
    const ytDlpPath = process.env.YTDLP_PATH || './yt-dlp';
    const ytDlpWrap = new YTDlp(ytDlpPath);
    
    const filename = `rutube_${crypto.randomBytes(8).toString('hex')}.mp4`;
    const filePath = path.join(process.cwd(), 'downloads', filename);
    
    let videoInfo;
    try {
      videoInfo = await ytDlpWrap.getVideoInfo(url);
    } catch (e) {
      console.error('Error getting Rutube video info:', e);
      videoInfo = { title: 'Rutube Video' };
    }
    
    await ytDlpWrap.execPromise([
      url,
      '-f', 'best[ext=mp4]/best',
      '--merge-output-format', 'mp4',
      '-o', filePath,
      '--quiet',
      '--no-warnings'
    ]);
    
    if (!fs.existsSync(filePath)) {
      throw new Error('Video file was not created');
    }
    
    const duration = videoInfo.duration ? `${Math.floor(videoInfo.duration / 60)}:${String(Math.floor(videoInfo.duration % 60)).padStart(2, '0')}` : null;
    
    return {
      success: true,
      filePath,
      title: videoInfo.title || 'Rutube Video',
      duration: duration
    };
    
  } catch (error) {
    console.error('Rutube download error:', error);
    return {
      success: false,
      error: 'Не удалось скачать видео с Rutube'
    };
  }
}