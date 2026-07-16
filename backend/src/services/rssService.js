```javascript
import Parser from 'rss-parser';
import News from '../models/News.js';

// Initialize the RSS Parser
const parser = new Parser({
  // Custom headers to prevent being blocked by some news sites
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 TRACK_Intelligence_Engine',
  }
});

// List of target feeds (You can add or remove sources here dynamically or via the Admin Panel later)
const FEEDS = [
  { 
    source: 'Moneycontrol', 
    url: 'https://www.moneycontrol.com/rss/MCtopnews.xml' 
  },
  { 
    source: 'Google News India', 
    url: 'https://news.google.com/rss/search?q=indian+stock+market&hl=en-IN&gl=IN&ceid=IN:en' 
  },
  { 
    source: 'Economic Times', 
    url: 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms' 
  }
  // Add Reuters, Financial Times, LiveMint RSS feeds here as needed
];

/**
 * Fetches RSS feeds, checks for duplicates, and stores raw articles in MongoDB.
 * @returns {Array} - Array of newly inserted News document objects
 */
export const fetchAndStoreNews = async () => {
  let newArticles = [];

  console.log(`[RSS Service] Starting feed ingestion from ${FEEDS.length} sources...`);

  for (const feed of FEEDS) {
    try {
      // Fetch and parse the XML feed
      const parsedFeed = await parser.parseURL(feed.url);
      
      for (const item of parsedFeed.items) {
        // 1. Deduplication Check
        // We use the article link as a unique identifier to ensure we don't save the same news twice
        const exists = await News.findOne({ originalUrl: item.link });
        
        if (!exists) {
          // 2. Format and Save the Raw Article
          const article = new News({
            title: item.title,
            originalUrl: item.link,
            source: feed.source,
            // Fallback to current date if pubDate is missing from the RSS feed
            publishDate: item.pubDate ? new Date(item.pubDate) : new Date(), 
            // Some feeds use contentSnippet, some use content, some just have a title
            rawContent: item.contentSnippet || item.content || item.title
          });
          
          await article.save();
          newArticles.push(article);
        }
      }
    } catch (error) {
      // If one feed fails (e.g., site is down), catch the error and continue to the next feed
      console.error(`[RSS Error] Failed to fetch feed from ${feed.source}:`, error.message);
    }
  }
  
  return newArticles;
};

```
