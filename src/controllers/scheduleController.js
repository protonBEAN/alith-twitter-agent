const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

// Default schedule (3 times per day = every 8 hours)
const DEFAULT_SCHEDULE = '0 */8 * * *';

// Path to store schedule configuration
const CONFIG_DIR = path.join(__dirname, '..', '..', 'config');
const SCHEDULE_CONFIG_PATH = path.join(CONFIG_DIR, 'schedule.json');

// Ensure config directory exists
if (!fs.existsSync(CONFIG_DIR)) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
}

// Load schedule from config file or use default
const loadSchedule = () => {
  try {
    if (fs.existsSync(SCHEDULE_CONFIG_PATH)) {
      const data = fs.readFileSync(SCHEDULE_CONFIG_PATH, 'utf8');
      const config = JSON.parse(data);
      return config.schedule || DEFAULT_SCHEDULE;
    }
  } catch (error) {
    console.error('Error loading schedule config:', error);
  }
  
  // If file doesn't exist or there's an error, return default and create the file
  saveSchedule(DEFAULT_SCHEDULE);
  return DEFAULT_SCHEDULE;
};

// Save schedule to config file
const saveSchedule = (schedule) => {
  try {
    const config = { schedule, updatedAt: new Date().toISOString() };
    fs.writeFileSync(SCHEDULE_CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error saving schedule config:', error);
    return false;
  }
};

// Validate cron expression
const validateSchedule = (schedule) => {
  return cron.validate(schedule);
};

// Convert cron expression to human-readable format
const getReadableSchedule = (schedule) => {
  const parts = schedule.split(' ');
  
  if (parts.length !== 5) {
    return 'Invalid schedule format';
  }
  
  // Handle common patterns
  if (parts[1] === '*/8' && parts[0] === '0' && parts[2] === '*' && parts[3] === '*' && parts[4] === '*') {
    return 'Every 8 hours (3 times per day)';
  }
  
  if (parts[1] === '*/6' && parts[0] === '0' && parts[2] === '*' && parts[3] === '*' && parts[4] === '*') {
    return 'Every 6 hours (4 times per day)';
  }
  
  if (parts[1] === '*/12' && parts[0] === '0' && parts[2] === '*' && parts[3] === '*' && parts[4] === '*') {
    return 'Every 12 hours (2 times per day)';
  }
  
  if (parts[1] === '*/4' && parts[0] === '0' && parts[2] === '*' && parts[3] === '*' && parts[4] === '*') {
    return 'Every 4 hours (6 times per day)';
  }
  
  // For other patterns, return a more generic description
  return `Custom schedule (${schedule})`;
};

// Get next scheduled run times
const getNextRunTimes = (schedule, count = 5) => {
  try {
    const times = [];
    let nextDate = new Date();
    
    for (let i = 0; i < count; i++) {
      const cronInstance = cron.schedule(schedule, () => {});
      nextDate = cronInstance.nextDate(nextDate).toDate();
      times.push(nextDate.toISOString());
      // Add a minute to avoid getting the same time
      nextDate = new Date(nextDate.getTime() + 60000);
      cronInstance.stop();
    }
    
    return times;
  } catch (error) {
    console.error('Error calculating next run times:', error);
    return [];
  }
};

// Schedule controller
const scheduleController = {
  getSchedule: () => {
    const schedule = loadSchedule();
    return {
      schedule,
      readable: getReadableSchedule(schedule),
      nextRuns: getNextRunTimes(schedule)
    };
  },
  
  updateSchedule: (newSchedule) => {
    if (!validateSchedule(newSchedule)) {
      return { success: false, error: 'Invalid cron expression' };
    }
    
    const saved = saveSchedule(newSchedule);
    
    if (!saved) {
      return { success: false, error: 'Failed to save schedule' };
    }
    
    return {
      success: true,
      schedule: newSchedule,
      readable: getReadableSchedule(newSchedule),
      nextRuns: getNextRunTimes(newSchedule)
    };
  },
  
  getPresets: () => {
    return [
      { name: 'Twice daily', schedule: '0 */12 * * *', description: 'Posts every 12 hours' },
      { name: 'Three times daily', schedule: '0 */8 * * *', description: 'Posts every 8 hours' },
      { name: 'Four times daily', schedule: '0 */6 * * *', description: 'Posts every 6 hours' },
      { name: 'Six times daily', schedule: '0 */4 * * *', description: 'Posts every 4 hours' },
      { name: 'Once daily', schedule: '0 12 * * *', description: 'Posts once at 12:00 PM' },
    ];
  }
};

module.exports = { scheduleController };