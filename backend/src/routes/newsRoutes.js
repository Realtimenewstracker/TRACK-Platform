import express from 'express';
import News from '../models/News.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/news — Latest analyzed articles with pagination + filtering
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = { isAnalyzed: true };
    if (req.query.importance) query.importance = req.query.importance;
    if (req.query.sector) query.affectedSectors = req.query.sector;
    if (req.query.stock) {
      query.$or = [
        { positiveStocks: req.query.stock.toUpperCase() },
        { negativeStocks: req.query.stock.toUpperCase() }
      ];
    }

    const [news, total] = await Promise.all([
      News.find(query)
        .sort({ publishDate: -1 })
        .skip(skip)
        .limit(limit)
        .select('-rawContent'),
      News.countDocuments(query)
    ]);

    res.json({
      news,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    console.error('[News Route] Fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch news.' });
  }
});

// GET /api/news/stats — Dashboard summary cards
router.get('/stats', protect, async (req, res) => {
  try {
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [total24h, critical, sentimentData, topThemes] = await Promise.all([
      News.countDocuments({ publishDate: { $gte: last24h }, isAnalyzed: true }),
      News.countDocuments({ importance: 'CRITICAL', publishDate: { $gte: last24h } }),
      News.aggregate([
        { $match: { publishDate: { $gte: last24h }, isAnalyzed: true } },
        {
          $group: {
            _id: null,
            pos: { $sum: { $size: '$positiveStocks' } },
            neg: { $sum: { $size: '$negativeStocks' } }
          }
        }
      ]),
      News.aggregate([
        { $match: { publishDate: { $gte: last24h }, isAnalyzed: true } },
        { $unwind: '$themes' },
        { $group: { _id: '$themes', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ])
    ]);

    const s = sentimentData[0] || { pos: 0, neg: 0 };
    const marketSentiment =
      s.pos > s.neg ? 'BULLISH' : s.neg > s.pos ? 'BEARISH' : 'NEUTRAL';

    res.json({
      analyzed24h: total24h,
      criticalAlerts: critical,
      marketSentiment,
      systemStatus: 'ONLINE',
      topThemes: topThemes.map(t => ({ theme: t._id, count: t.count }))
    });
  } catch (err) {
    console.error('[News Route] Stats error:', err.message);
    res.status(500).json({ error: 'Failed to fetch stats.' });
  }
});

// GET /api/news/:id — Single article detail
router.get('/:id', protect, async (req, res) => {
  try {
    const article = await News.findById(req.params.id);
    if (!article) return res.status(404).json({ error: 'Article not found.' });
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch article.' });
  }
});

export default router;
