const { TwitterApi } = require('twitter-api-v2');

// Twitter API credentials from environment variables
const apiKey = process.env.TWITTER_API_KEY;
const apiSecret = process.env.TWITTER_API_SECRET;
const accessToken = process.env.TWITTER_ACCESS_TOKEN;
const accessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET;

// Create a Twitter client instance
const twitterClient = new TwitterApi({
  appKey: apiKey,
  appSecret: apiSecret,
  accessToken: accessToken,
  accessSecret: accessTokenSecret,
});

// Get the read-write client
const rwClient = twitterClient.readWrite;

/**
 * Post a tweet
 * @param {string} text - The text content of the tweet
 * @returns {Promise<Object>} - The response from the Twitter API
 */
const postTweet = async (text) => {
  try {
    const response = await rwClient.v2.tweet(text);
    console.log('Tweet posted successfully:', response);
    return response;
  } catch (error) {
    console.error('Error posting tweet:', error);
    throw error;
  }
};

/**
 * Get trending topics
 * @param {string} woeid - The "Where On Earth ID" (default: 1 for worldwide)
 * @returns {Promise<Array>} - Array of trending topics
 */
const getTrendingTopics = async (woeid = 1) => {
  try {
    // Using v1.1 API for trends since v2 doesn't have this endpoint yet
    const response = await twitterClient.v1.trendingPlaces(woeid);
    return response[0]?.trends || [];
  } catch (error) {
    console.error('Error getting trending topics:', error);
    throw error;
  }
};

/**
 * Search for tweets
 * @param {string} query - The search query
 * @param {number} maxResults - Maximum number of results to return
 * @returns {Promise<Array>} - Array of tweets
 */
const searchTweets = async (query, maxResults = 10) => {
  try {
    const response = await rwClient.v2.search(query, {
      'tweet.fields': ['created_at', 'public_metrics', 'author_id'],
      max_results: maxResults,
    });
    return response.data;
  } catch (error) {
    console.error('Error searching tweets:', error);
    throw error;
  }
};

module.exports = {
  twitterClient,
  rwClient,
  postTweet,
  getTrendingTopics,
  searchTweets,
};