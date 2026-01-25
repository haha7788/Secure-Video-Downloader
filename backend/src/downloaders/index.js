import { downloadTikTok } from './tiktok.js';
import { downloadInstagram } from './instagram.js';
import { downloadYouTube } from './youtube.js';

export async function downloadVideo(url, platform) {
  try {
    switch (platform.toLowerCase()) {
      case 'tiktok':
        return await downloadTikTok(url);
      
      case 'instagram':
        return await downloadInstagram(url);
      
      case 'youtube':
        return await downloadYouTube(url);
      
      default:
        return {
          success: false,
          error: 'Unsupported platform'
        };
    }
  } catch (error) {
    console.error(`Error downloading from ${platform}:`, error);
    return {
      success: false,
      error: error.message || 'Unknown error'
    };
  }
}