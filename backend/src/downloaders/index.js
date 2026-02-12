import { downloadTikTok } from './tiktok.js';
import { downloadInstagram } from './instagram.js';
import { downloadYouTube } from './youtube.js';
import { downloadVK } from './vk.js';
import { downloadRutube } from './rutube.js';

export async function downloadVideo(url, platform, options = {}) {
  try {
    switch (platform.toLowerCase()) {
      case 'tiktok':
        return await downloadTikTok(url, options);
      
      case 'instagram':
        return await downloadInstagram(url, options);
      
      case 'youtube':
        return await downloadYouTube(url, options);
      
      case 'vk':
      case 'vk video':
        return await downloadVK(url, options);
      
      case 'rutube':
        return await downloadRutube(url, options);
      
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