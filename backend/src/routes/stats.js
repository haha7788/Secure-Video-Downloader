import express from 'express';
import { downloadDB } from '../database/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const totalDownloads = downloadDB.getTotalDownloads();
    const downloadsByPlatform = downloadDB.getDownloadsByPlatform();

    const platforms = {};
    downloadsByPlatform.forEach(p => {
      platforms[p.platform.toLowerCase()] = p.count;
    });

    res.json({
      success: true,
      totalDownloads,
      platforms: {
        tiktok: platforms.tiktok || 0,
        instagram: platforms.instagram || 0,
        youtube: platforms.youtube || 0
      }
    });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/recent', async (req, res) => {
  try {
    const stats = downloadDB.getStatsForPeriod(1);

    res.json({
      success: true,
      period: '24h',
      downloads: stats.total || 0,
      platforms: {
        tiktok: stats.tiktok || 0,
        instagram: stats.instagram || 0,
        youtube: stats.youtube || 0
      }
    });

  } catch (error) {
    console.error('Recent stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;