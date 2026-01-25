import axios from 'axios';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export async function downloadTikTok(url) {
  try {
    const videoData = await getTikTokVideoData(url);
    
    if (!videoData) {
      throw new Error('Не удалось получить данные видео');
    }
    
    const filename = `tiktok_${crypto.randomBytes(8).toString('hex')}.mp4`;
    const filePath = path.join(process.cwd(), 'downloads', filename);
    
    const response = await axios({
      method: 'GET',
      url: videoData.videoUrl,
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.tiktok.com/'
      }
    });
    
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);
    
    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        resolve({
          success: true,
          filePath,
          title: videoData.title || 'TikTok Video',
          duration: videoData.duration || null
        });
      });
      writer.on('error', reject);
    });
    
  } catch (error) {
    console.error('TikTok download error:', error);
    return {
      success: false,
      error: 'Не удалось скачать видео с TikTok'
    };
  }
}

async function getTikTokVideoData(url) {
  if (url.includes('vm.tiktok.com') || url.includes('vt.tiktok.com')) {
    try {
      const response = await axios.get(url, {
        maxRedirects: 5,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      url = response.request.res.responseUrl || url;
    } catch (e) {
      console.error('Error resolving short URL:', e.message);
    }
  }
  
  try {
    const videoId = extractTikTokVideoId(url);
    if (videoId) {
      const apiUrl = `https://api16-normal-c-useast1a.tiktokv.com/aweme/v1/feed/?aweme_id=${videoId}`;
      const response = await axios.get(apiUrl, {
        headers: {
          'User-Agent': 'com.ss.android.ugc.trill/494+Mozilla/5.0+(Linux;+Android+12;+2112123G+Build/SKQ1.211006.001;+wv)+AppleWebKit/537.36+(KHTML,+like+Gecko)+Version/4.0+Chrome/107.0.5304.105+Mobile+Safari/537.36'
        },
        timeout: 10000
      });
      
      if (response.data?.aweme_list?.[0]) {
        const video = response.data.aweme_list[0];
        const videoUrl = video.video?.play_addr?.url_list?.[0] || 
                        video.video?.download_addr?.url_list?.[0];
        
        if (videoUrl) {
          const duration = video.video?.duration ? Math.floor(video.video.duration / 1000) : null;
          const formatDuration = duration ? `${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, '0')}` : null;
          
          return {
            videoUrl,
            title: video.desc || 'TikTok Video',
            duration: formatDuration
          };
        }
      }
    }
  } catch (e) {
    console.log('TikTok API method failed, trying alternative...');
  }
  
  try {
    const response = await axios.post('https://www.tikwm.com/api/', {
      url: url,
      hd: 1
    }, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 15000
    });
    
    if (response.data?.code === 0) {
      const data = response.data.data;
      const duration = data.duration ? `${Math.floor(data.duration / 60)}:${String(data.duration % 60).padStart(2, '0')}` : null;
      
      return {
        videoUrl: data.hdplay || data.play,
        title: data.title || 'TikTok Video',
        duration: duration
      };
    }
  } catch (e) {
    console.log('Tikwm API failed:', e.message);
  }
  
  return null;
}

function extractTikTokVideoId(url) {
  const patterns = [
    /\/video\/(\d+)/,
    /\/v\/(\d+)/,
    /tiktok\.com\/.*\/video\/(\d+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}