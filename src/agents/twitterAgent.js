const { postTweet, getTrendingTopics } = require('../services/twitterService');
const axios = require('axios');

// Import Alith
try {
  const alith = require('@0xlazai/alith');
  console.log('Alith loaded successfully');
} catch (error) {
  console.error('Error loading Alith:', error);
  console.warn('Falling back to alternative content generation method');
}

// Function to fetch trending crypto topics
const fetchTrendingCryptoTopics = async () => {
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/search/trending');
    return response.data.coins.map(coin => coin.item);
  } catch (error) {
    console.error('Error fetching trending crypto topics:', error);
    return [];
  }
};

// Function to fetch trending news
const fetchTrendingNews = async (category = 'crypto,politics') => {
  try {
    // This is a placeholder - you would need to use a real news API
    const response = await axios.get(`https://newsapi.org/v2/top-headlines?category=${category}&apiKey=${process.env.NEWS_API_KEY}`);
    return response.data.articles;
  } catch (error) {
    console.error('Error fetching trending news:', error);
    // Return some fallback news if the API fails
    return [
      { title: 'Crypto markets showing volatility amid regulatory news', url: 'https://example.com/news1' },
      { title: 'New blockchain project launches with focus on scalability', url: 'https://example.com/news2' },
      { title: 'Political developments impact global markets', url: 'https://example.com/news3' }
    ];
  }
};

// Initialize the Alith agent
const initializeAlithAgent = () => {
  try {
    // This is a placeholder for the actual Alith initialization
    // You would need to adapt this based on the actual Alith API
    const alith = require('@0xlazai/alith');
    
    // Create an agent with the appropriate configuration
    const agent = new alith.Agent({
      name: 'TwitterBot',
      description: 'An AI agent that posts about trending web3/crypto topics and politics',
      tools: [
        // Define tools the agent can use
        {
          name: 'fetchTrendingTopics',
          description: 'Fetch trending topics from Twitter',
          handler: getTrendingTopics
        },
        {
          name: 'fetchCryptoTrends',
          description: 'Fetch trending cryptocurrency information',
          handler: fetchTrendingCryptoTopics
        },
        {
          name: 'fetchNews',
          description: 'Fetch trending news articles',
          handler: fetchTrendingNews
        },
        {
          name: 'postToTwitter',
          description: 'Post a tweet to Twitter',
          handler: postTweet
        }
      ],
      // Define the agent's workflow
      workflow: {
        // Define the steps the agent should take
        steps: [
          {
            name: 'gatherInformation',
            description: 'Gather information about trending topics',
            action: async (context) => {
              const twitterTrends = await context.tools.fetchTrendingTopics();
              const cryptoTrends = await context.tools.fetchCryptoTrends();
              const news = await context.tools.fetchNews();
              
              return {
                twitterTrends,
                cryptoTrends,
                news
              };
            }
          },
          {
            name: 'generateContent',
            description: 'Generate tweet content based on trending information',
            action: async (context, previousResults) => {
              // Use the gathered information to generate tweet content
              const { twitterTrends, cryptoTrends, news } = previousResults.gatherInformation;
              
              // Generate the tweet content using Alith's AI capabilities
              const tweetContent = await alith.generate({
                prompt: `Create a tweet about trending web3/crypto topics or politics. Use these trending topics: ${JSON.stringify(twitterTrends.slice(0, 3))}. 
                         Consider these trending cryptocurrencies: ${JSON.stringify(cryptoTrends.slice(0, 3))}. 
                         And these news headlines: ${JSON.stringify(news.slice(0, 3).map(n => n.title))}.
                         The tweet should be informative, engaging, and under 280 characters.`,
                maxTokens: 100
              });
              
              return { tweetContent };
            }
          },
          {
            name: 'postTweet',
            description: 'Post the generated content to Twitter',
            action: async (context, previousResults) => {
              const { tweetContent } = previousResults.generateContent;
              const result = await context.tools.postToTwitter(tweetContent);
              return { result };
            }
          }
        ]
      }
    });
    
    return agent;
  } catch (error) {
    console.error('Error initializing Alith agent:', error);
    return null;
  }
};

// Fallback content generation if Alith is not available
const generateTweetContentFallback = async () => {
  try {
    // Fetch trending topics and news
    const twitterTrends = await getTrendingTopics();
    const cryptoTrends = await fetchTrendingCryptoTopics();
    const news = await fetchTrendingNews();
    
    // Select random items from each category
    const randomTwitterTrend = twitterTrends[Math.floor(Math.random() * twitterTrends.length)];
    const randomCryptoTrend = cryptoTrends[Math.floor(Math.random() * cryptoTrends.length)];
    const randomNews = news[Math.floor(Math.random() * news.length)];
    
    // Generate a simple tweet based on the random selections
    const tweetTemplates = [
      `Trending now: ${randomTwitterTrend?.name || 'Web3 innovations'} 🔥 In crypto: ${randomCryptoTrend?.name || 'Bitcoin'} is making moves! #Crypto #Web3`,
      `📰 ${randomNews?.title || 'Exciting developments in the crypto space!'} #Crypto #Politics`,
      `Keep an eye on ${randomCryptoTrend?.name || 'emerging blockchain projects'} today. Market is showing interesting patterns. #Crypto #Trading`,
      `Political developments could impact ${randomTwitterTrend?.name || 'regulatory landscape'} for crypto. Stay informed! #Politics #Crypto`,
    ];
    
    const randomTemplate = tweetTemplates[Math.floor(Math.random() * tweetTemplates.length)];
    return randomTemplate;
  } catch (error) {
    console.error('Error in fallback content generation:', error);
    return 'Exciting developments in the #crypto and #web3 space today! Stay tuned for more updates.';
  }
};

// The main agent interface
const twitterAgent = {
  // Initialize the agent (either Alith or fallback)
  agent: initializeAlithAgent(),
  
  // Method to generate and post a tweet
  generateAndPostTweet: async () => {
    try {
      if (twitterAgent.agent) {
        // If Alith agent is available, use it
        console.log('Using Alith agent to generate and post tweet');
        const result = await twitterAgent.agent.run();
        return result;
      } else {
        // Otherwise use the fallback method
        console.log('Using fallback method to generate and post tweet');
        const tweetContent = await generateTweetContentFallback();
        const result = await postTweet(tweetContent);
        return { tweetContent, result };
      }
    } catch (error) {
      console.error('Error generating and posting tweet:', error);
      throw error;
    }
  }
};

module.exports = { twitterAgent };