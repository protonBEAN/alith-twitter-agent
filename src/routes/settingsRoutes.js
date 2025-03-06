const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Path to store settings
const CONFIG_DIR = path.join(__dirname, '..', '..', 'config');
const SETTINGS_PATH = path.join(CONFIG_DIR, 'settings.json');

// Default settings
const DEFAULT_SETTINGS = {
  topics: {
    crypto: true,
    web3: true,
    politics: true
  },
  contentStyle: 'informative', // informative, casual, professional
  includeHashtags: true,
  maxHashtags: 3,
  maxTweetLength: 280
};

// Ensure config directory exists
if (!fs.existsSync(CONFIG_DIR)) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
}

// Load settings
const loadSettings = () => {
  try {
    if (fs.existsSync(SETTINGS_PATH)) {
      const data = fs.readFileSync(SETTINGS_PATH, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
  
  // If file doesn't exist or there's an error, return default settings and create the file
  saveSettings(DEFAULT_SETTINGS);
  return DEFAULT_SETTINGS;
};

// Save settings
const saveSettings = (settings) => {
  try {
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
};

/**
 * @route GET /api/settings
 * @description Get agent settings
 */
router.get('/', (req, res) => {
  try {
    const settings = loadSettings();
    res.status(200).json(settings);
  } catch (error) {
    console.error('Error getting settings:', error);
    res.status(500).json({ error: 'Failed to get settings' });
  }
});

/**
 * @route PUT /api/settings
 * @description Update agent settings
 */
router.put('/', (req, res) => {
  try {
    const newSettings = req.body;
    
    if (!newSettings) {
      return res.status(400).json({ error: 'Settings are required' });
    }
    
    // Merge with existing settings to ensure all fields are present
    const currentSettings = loadSettings();
    const mergedSettings = { ...currentSettings, ...newSettings };
    
    const saved = saveSettings(mergedSettings);
    
    if (!saved) {
      return res.status(500).json({ error: 'Failed to save settings' });
    }
    
    res.status(200).json({
      message: 'Settings updated successfully',
      settings: mergedSettings
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

/**
 * @route GET /api/settings/reset
 * @description Reset settings to default
 */
router.get('/reset', (req, res) => {
  try {
    const saved = saveSettings(DEFAULT_SETTINGS);
    
    if (!saved) {
      return res.status(500).json({ error: 'Failed to reset settings' });
    }
    
    res.status(200).json({
      message: 'Settings reset to default',
      settings: DEFAULT_SETTINGS
    });
  } catch (error) {
    console.error('Error resetting settings:', error);
    res.status(500).json({ error: 'Failed to reset settings' });
  }
});

module.exports = router;