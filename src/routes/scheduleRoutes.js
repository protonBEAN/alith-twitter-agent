const express = require('express');
const router = express.Router();
const { scheduleController } = require('../controllers/scheduleController');

/**
 * @route GET /api/schedule
 * @description Get the current posting schedule
 */
router.get('/', (req, res) => {
  try {
    const scheduleInfo = scheduleController.getSchedule();
    res.status(200).json(scheduleInfo);
  } catch (error) {
    console.error('Error getting schedule:', error);
    res.status(500).json({ error: 'Failed to get schedule' });
  }
});

/**
 * @route PUT /api/schedule
 * @description Update the posting schedule
 */
router.put('/', (req, res) => {
  try {
    const { schedule } = req.body;
    
    if (!schedule) {
      return res.status(400).json({ error: 'Schedule is required' });
    }
    
    const result = scheduleController.updateSchedule(schedule);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({ error: 'Failed to update schedule' });
  }
});

/**
 * @route GET /api/schedule/presets
 * @description Get predefined schedule presets
 */
router.get('/presets', (req, res) => {
  try {
    const presets = scheduleController.getPresets();
    res.status(200).json(presets);
  } catch (error) {
    console.error('Error getting schedule presets:', error);
    res.status(500).json({ error: 'Failed to get schedule presets' });
  }
});

module.exports = router;