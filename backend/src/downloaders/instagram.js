import YTDlpWrap from 'yt-dlp-wrap';
const YTDlp = YTDlpWrap.default || YTDlpWrap;
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export async function downloadInstagram(url) {
  try {
    const ytDlpPath = process.env.YTDLP_PATH || './yt-dlp';
    const ytDlpWrap = new YTDlp(ytDlpPath);
    
    const filename = `instagram_${crypto.randomBytes(8).toString('hex')}.mp4`;
    const filePath = path.join(process.cwd(), 'downloads', filename);
    
    console.log('Downloading Instagram video with Firefox cookies...');
    
    let videoInfo;
    try {
      videoInfo = await ytDlpWrap.getVideoInfo(url);
    } catch (e) {
      console.error('Error getting Instagram video info:', e);
      videoInfo = { title: 'Instagram Video' };
    }
    
    await ytDlpWrap.execPromise([
      url,
      '--cookies-from-browser', 'firefox',
      '-f', 'best',
      '-o', filePath
    ]);
    
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