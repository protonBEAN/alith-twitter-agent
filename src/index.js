require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const path = require('path');
const { twitterAgent } = require('./agents/twitterAgent');
const { twitterClient } = require('./services/twitterService');
const { scheduleController } = require('./controllers/scheduleController');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/schedule', require('./routes/scheduleRoutes'));
app.use('/api/posts', require('./routes/postsRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));

// Serve the frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Initialize the Twitter posting schedule
let postingSchedule = process.env.POSTING_SCHEDULE || '0 */8 * * *'; // Default: every 8 hours
let scheduledJob = null;

// Function to schedule the Twitter posting job
const scheduleTwitterPosts = (cronExpression) => {
  if (scheduledJob) {
    scheduledJob.stop();
  }
  
  scheduledJob = cron.schedule(cronExpression, async () => {
    try {
      console.log('Running scheduled Twitter post job...');
      await twitterAgent.generateAndPostTweet();
    } catch (error) {
      console.error('Error in scheduled Twitter post:', error);
    }
  });
  
  console.log(`Twitter posts scheduled with cron expression: ${cronExpression}`);
};

// Initialize the schedule
scheduleTwitterPosts(postingSchedule);

// API endpoint to update the posting schedule
app.post('/api/schedule/update', (req, res) => {
  try {
    const { schedule } = req.body;
    if (!schedule) {
      return res.status(400).json({ error: 'Schedule is required' });
    }
    
    // Validate the cron expression
    if (!cron.validate(schedule)) {
      return res.status(400).json({ error: 'Invalid cron expression' });
    }
    
    postingSchedule = schedule;
    scheduleTwitterPosts(postingSchedule);
    
    return res.status(200).json({ message: 'Schedule updated successfully', schedule: postingSchedule });
  } catch (error) {
    console.error('Error updating schedule:', error);
    return res.status(500).json({ error: 'Failed to update schedule' });
  }
});

// API endpoint to manually trigger a Twitter post
app.post('/api/posts/create', async (req, res) => {
  try {
    const result = await twitterAgent.generateAndPostTweet();
    return res.status(200).json({ message: 'Tweet posted successfully', result });
  } catch (error) {
    console.error('Error posting tweet:', error);
    return res.status(500).json({ error: 'Failed to post tweet' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Twitter Agent initialized with schedule: ${postingSchedule}`);
});