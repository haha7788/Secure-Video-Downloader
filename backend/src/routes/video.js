import express from 'express';
import { downloadVideo } from '../downloaders/index.js';
import { detectPlatform, isValidUrl } from '../utils/urlParser.js';
import { downloadDB } from '../database/db.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

const downloadsDir = path.join(process.cwd(), 'downloads');
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
}

router.get('/', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL parameter is required'
      });
    }

    if (!isValidUrl(url)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid URL format'
      });
    }

    const platform = detectPlatform(url);
    if (!platform) {
      return res.status(400).json({
        success: false,
        error: 'Unsupported platform. Supported: TikTok, Instagram, YouTube'
      });
    }

    console.log(`[API] Downloading ${platform} video: ${url}`);

    const result = await downloadVideo(url, platform);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to download video'
      });
    }

    if (!fs.existsSync(result.filePath)) {
      return res.status(404).json({
        success: false,
        error: 'Video file not found'
      });
    }

    const stats = fs.statSync(result.filePath);
    const filename = path.basename(result.filePath);

    try {
      downloadDB.addDownload(0, platform, url, stats.size, true);
    } catch (dbError) {
      console.error('Failed to record download stats:', dbError);
    }

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Content-Disposition', `attachment; filename="${result.title ? result.title.replace(/[^a-zA-Z0-9_\-\.]/g, '_') : filename}.mp4"`);
    res.setHeader('Accept-Ranges', 'bytes');

    const fileStream = fs.createReadStream(result.filePath);
    
    fileStream.on('error', (error) => {
      console.error('Stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to stream video' });
      }
    });

    fileStream.pipe(res);

    fileStream.on('end', () => {
      setTimeout(() => {
        if (fs.existsSync(result.filePath)) {
          fs.unlinkSync(result.filePath);
          console.log(`[API] Cleaned up: ${filename}`);
        }
      }, 5000);
    });

  } catch (error) {
    console.error('Video API error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error'
      });
    }
  }
});

export default router;