// routes/news.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const xml2js = require('xml2js');
const feedparser = require('feedparser-promised');

// GET /api/v1/news
// Fetch agriculture news from Google News RSS
router.get('/', async (req, res) => {
  try {
    const rss_url = "https://news.google.com/rss/search?q=agriculture+india&hl=en-IN&gl=IN&ceid=IN:en";
    
    // Use feedparser to parse the RSS feed
    const items = await feedparser.parse(rss_url);
    
    // Format the articles for the frontend
    const articles = items.map((item, index) => ({
      id: index,
      title: item.title,
      link: item.link,
      published: item.pubDate || item.date,
      summary: item.summary || item.description || '',
      // Extract source if available (Google News format)
      source: item.meta?.title || 'Google News'
    }));
    
    res.status(200).json({
      success: true,
      count: articles.length,
      articles: articles
    });
  } catch (error) {
    console.error('Error fetching or parsing RSS feed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news',
      error: error.message
    });
  }
});

// GET /api/v1/news/category/:category
// Optional: Filter news by category if needed
router.get('/category/:category', async (req, res) => {
  try {
    const category = req.params.category.toLowerCase();
    const rss_url = `https://news.google.com/rss/search?q=agriculture+india+${category}&hl=en-IN&gl=IN&ceid=IN:en`;
    
    const items = await feedparser.parse(rss_url);
    
    const articles = items.map((item, index) => ({
      id: index,
      title: item.title,
      link: item.link,
      published: item.pubDate || item.date,
      summary: item.summary || item.description || '',
      source: item.meta?.title || 'Google News'
    }));
    
    res.status(200).json({
      success: true,
      count: articles.length,
      category: category,
      articles: articles
    });
  } catch (error) {
    console.error(`Error fetching ${req.params.category} news:`, error);
    res.status(500).json({
      success: false,
      message: `Failed to fetch ${req.params.category} news`,
      error: error.message
    });
  }
});

// GET /api/v1/news/search
// Search news with a specific query
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    const rss_url = `https://news.google.com/rss/search?q=agriculture+india+${encodeURIComponent(query)}&hl=en-IN&gl=IN&ceid=IN:en`;
    
    const items = await feedparser.parse(rss_url);
    
    const articles = items.map((item, index) => ({
      id: index,
      title: item.title,
      link: item.link,
      published: item.pubDate || item.date,
      summary: item.summary || item.description || '',
      source: item.meta?.title || 'Google News'
    }));
    
    res.status(200).json({
      success: true,
      count: articles.length,
      query: query,
      articles: articles
    });
  } catch (error) {
    console.error(`Error searching news:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to search news',
      error: error.message
    });
  }
});

module.exports = router;