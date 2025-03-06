# Alith Twitter Agent

An AI agent built with Alith that automatically posts to Twitter about trending web3/crypto topics and politics.

## Features

- Automatically posts to Twitter on a configurable schedule (default: 3 times per day)
- Generates content about trending web3/crypto topics and politics
- Uses Alith AI agent framework for intelligent content generation
- Web interface for configuring posting schedule and content preferences
- Real-time monitoring of posts and agent activity

## Prerequisites

- Node.js (v16 or higher)
- Twitter Developer Account with API credentials
- OpenAI API key (optional, for enhanced content generation)

## Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in your credentials:
   ```
   cp .env.example .env
   ```

## Configuration

Edit the `.env` file with your Twitter API credentials and other settings:

```
# Twitter API Credentials
TWITTER_API_KEY=your_api_key
TWITTER_API_SECRET=your_api_secret
TWITTER_BEARER_TOKEN=your_bearer_token
TWITTER_ACCESS_TOKEN=your_access_token
TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret

# Posting Schedule (cron format)
POSTING_SCHEDULE="0 */8 * * *"  # Every 8 hours by default

# OpenAI API Key (for content generation if needed)
OPENAI_API_KEY=your_openai_api_key

# Server Configuration
PORT=3000
```

## Usage

### Starting the Agent

```
npm start
```

For development with auto-restart:

```
npm run dev
```

### Web Interface

Access the web interface at `http://localhost:3000` to configure and monitor your Twitter agent.

## Architecture

This project uses:

- **Alith**: AI agent framework for content generation and decision making
- **Twitter API v2**: For posting tweets and interacting with Twitter
- **Express.js**: For the web interface and API
- **Node-cron**: For scheduling posts

## License

MIT