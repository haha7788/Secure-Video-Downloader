import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(path.join(dbDir, 'db.db'));

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS downloads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    platform TEXT NOT NULL,
    url TEXT NOT NULL,
    file_size INTEGER,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    success INTEGER DEFAULT 1
  );

  CREATE INDEX IF NOT EXISTS idx_user_id ON downloads(user_id);
  CREATE INDEX IF NOT EXISTS idx_platform ON downloads(platform);
  CREATE INDEX IF NOT EXISTS idx_created_at ON downloads(created_at);
`);

export const downloadDB = {
  addDownload(userId, platform, url, fileSize = 0, success = true) {
    const stmt = db.prepare(`
      INSERT INTO downloads (user_id, platform, url, file_size, success)
      VALUES (?, ?, ?, ?, ?)
    `);
    return stmt.run(userId, platform, url, fileSize, success ? 1 : 0);
  },

  getTotalDownloads() {
    return db.prepare('SELECT COUNT(*) as count FROM downloads WHERE success = 1').get().count;
  },

  getDownloadsByPlatform() {
    return db.prepare(`
      SELECT platform, COUNT(*) as count 
      FROM downloads 
      WHERE success = 1 
      GROUP BY platform
    `).all();
  },

  getStatsForPeriod(days = 7) {
    const timestamp = Math.floor(Date.now() / 1000) - (days * 24 * 60 * 60);
    return db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN platform = 'TikTok' THEN 1 ELSE 0 END) as tiktok,
        SUM(CASE WHEN platform = 'Instagram' THEN 1 ELSE 0 END) as instagram,
        SUM(CASE WHEN platform = 'YouTube' THEN 1 ELSE 0 END) as youtube
      FROM downloads 
      WHERE success = 1 AND created_at > ?
    `).get(timestamp);
  }
};


export default db;