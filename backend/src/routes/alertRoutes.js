import express from 'express';
import Alert from '../models/Alert.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/alerts — All alerts for the logged-in user
router.get('/', protect, async (req, res) => {
  try {
    const alerts = await Alert.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch alerts.' });
  }
});

// POST /api/alerts — Create a new alert rule
router.post('/', protect, async (req, res) => {
  try {
    const { name, type, targetTickers, targetTheme, minImportance } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: 'Alert name and type are required.' });
    }

    const alert = await Alert.create({
      userId: req.user._id,
      name,
      type,
      targetTickers: targetTickers || [],
      targetTheme: targetTheme || '',
      minImportance: minImportance || 'MEDIUM'
    });

    res.status(201).json(alert);
  } catch (err) {
    console.error('[Alert Route] Create error:', err.message);
    res.status(500).json({ error: 'Failed to create alert.' });
  }
});

// PATCH /api/alerts/:id/toggle — Enable or disable an alert
router.patch('/:id/toggle', protect, async (req, res) => {
  try {
    const alert = await Alert.findOne({ _id: req.params.id, userId: req.user._id });
    if (!alert) return res.status(404).json({ error: 'Alert not found.' });

    alert.isActive = !alert.isActive;
    await alert.save();

    res.json(alert);
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle alert.' });
  }
});

// DELETE /api/alerts/:id — Remove an alert rule
router.delete('/:id', protect, async (req, res) => {
  try {
    const alert = await Alert.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!alert) return res.status(404).json({ error: 'Alert not found.' });
    res.json({ message: 'Alert deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete alert.' });
  }
});

export default router;
