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

router.post('/', async (req, res) => {
  try {
    const { url, format = 'mp4', quality = '720' } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required'
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
        error: 'Unsupported platform. Supported: TikTok, Instagram, YouTube, VK, Rutube'
      });
    }

    const result = await downloadVideo(url, platform, { format, quality });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to download video'
      });
    }

    const stats = fs.statSync(result.filePath);
    const filename = path.basename(result.filePath);

    try {
      const userIp = req.ip || 'unknown';
      downloadDB.addDownload(0, platform, url, stats.size, true);
    } catch (dbError) {
      console.error('Failed to record download stats:', dbError);
    }

    res.json({
      success: true,
      platform,
      title: result.title || 'Video',
      duration: result.duration || null,
      fileSize: stats.size,
      filename,
      downloadUrl: `/api/download/file/${filename}`
    });

    setTimeout(() => {
      if (fs.existsSync(result.filePath)) {
        fs.unlinkSync(result.filePath);
        console.log(`Cleaned up file: ${filename}`);
      }
    }, 5 * 60 * 1000);

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

router.get('/file/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    
    if (filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    const filePath = path.join(downloadsDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const contentType = filename.endsWith('.mp3') ? 'audio/mpeg' : 
                        filename.endsWith('.webm') ? 'video/webm' : 'video/mp4';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('File download error:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

export default router;