const express = require('express');
const router = express.Router();
const { twitterAgent } = require('../agents/twitterAgent');
const fs = require('fs');
const path = require('path');

// Path to store post history
const CONFIG_DIR = path.join(__dirname, '..', '..', 'config');
const POSTS_HISTORY_PATH = path.join(CONFIG_DIR, 'posts_history.json');

// Ensure config directory exists
if (!fs.existsSync(CONFIG_DIR)) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
}

// Load post history
const loadPostHistory = () => {
  try {
    if (fs.existsSync(POSTS_HISTORY_PATH)) {
      const data = fs.readFileSync(POSTS_HISTORY_PATH, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading post history:', error);
  }
  
  // If file doesn't exist or there's an error, return empty array and create the file
  savePostHistory([]);
  return [];
};

// Save post history
const savePostHistory = (history) => {
  try {
    fs.writeFileSync(POSTS_HISTORY_PATH, JSON.stringify(history, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error saving post history:', error);
    return false;
  }
};

// Add a post to history
const addPostToHistory = (post) => {
  try {
    const history = loadPostHistory();
    history.unshift({
      ...post,
      timestamp: new Date().toISOString()
    });
    
    // Keep only the last 100 posts
    const trimmedHistory = history.slice(0, 100);
    savePostHistory(trimmedHistory);
    return true;
  } catch (error) {
    console.error('Error adding post to history:', error);
    return false;
  }
};

/**
 * @route GET /api/posts
 * @description Get post history
 */
router.get('/', (req, res) => {
  try {
    const history = loadPostHistory();
    res.status(200).json(history);
  } catch (error) {
    console.error('Error getting post history:', error);
    res.status(500).json({ error: 'Failed to get post history' });
  }
});

/**
 * @route POST /api/posts
 * @description Create a new post
 */
router.post('/', async (req, res) => {
  try {
    const result = await twitterAgent.generateAndPostTweet();
    
    // Add to history
    addPostToHistory({
      content: result.tweetContent || result.result?.data?.text,
      tweetId: result.result?.data?.id,
      success: true
    });
    
    res.status(200).json({
      message: 'Tweet posted successfully',
      result
    });
  } catch (error) {
    console.error('Error posting tweet:', error);
    
    // Add failed attempt to history
    addPostToHistory({
      content: error.message,
      success: false,
      error: error.toString()
    });
    
    res.status(500).json({ error: 'Failed to post tweet' });
  }
});

module.exports = router;