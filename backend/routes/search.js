const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Get search suggestions with typo tolerance
router.get('/suggestions', async (req, res) => {
  try {
    const { q, limit = 5 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.json({
        success: true,
        data: { suggestions: [] }
      });
    }

    const searchTerm = q.trim().toLowerCase();
    
    // Get suggestions from multiple sources
    const [productNames, brands, categories] = await Promise.all([
      // Product names
      prisma.product.findMany({
        where: {
          isActive: true,
          name: { contains: searchTerm, mode: 'insensitive' }
        },
        select: { name: true },
        take: 10
      }),
      
      // Brands
      prisma.product.findMany({
        where: {
          isActive: true,
          brand: { contains: searchTerm, mode: 'insensitive' }
        },
        select: { brand: true },
        distinct: ['brand'],
        take: 5
      }),
      
      // Categories
      prisma.category.findMany({
        where: {
          isActive: true,
          name: { contains: searchTerm, mode: 'insensitive' }
        },
        select: { name: true },
        take: 3
      })
    ]);

    // Combine and deduplicate suggestions
    const suggestions = new Set();
    
    // Add product names
    productNames.forEach(p => suggestions.add(p.name));
    
    // Add brands
    brands.forEach(b => suggestions.add(b.brand));
    
    // Add categories
    categories.forEach(c => suggestions.add(c.name));
    
    // Convert to array and limit
    const suggestionArray = Array.from(suggestions)
      .slice(0, parseInt(limit))
      .sort((a, b) => {
        // Prioritize exact matches
        const aExact = a.toLowerCase().includes(searchTerm);
        const bExact = b.toLowerCase().includes(searchTerm);
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        return a.length - b.length; // Shorter suggestions first
      });

    res.json({
      success: true,
      data: {
        suggestions: suggestionArray,
        searchTerm: q
      }
    });

  } catch (error) {
    console.error('Search suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get search suggestions'
    });
  }
});

// Get popular search terms (mock data for now)
router.get('/popular', async (req, res) => {
  try {
    // In a real app, this would come from analytics/search logs
    const popularSearches = [
      { term: 'iPhone 15', count: 1250, trend: '+12%' },
      { term: 'MacBook Pro', count: 980, trend: '+8%' },
      { term: 'Samsung Galaxy', count: 850, trend: '+15%' },
      { term: 'AirPods', count: 720, trend: '+5%' },
      { term: 'Gaming Laptop', count: 650, trend: '+20%' },
      { term: 'Smart Watch', count: 580, trend: '+10%' },
      { term: 'Wireless Headphones', count: 520, trend: '+7%' },
      { term: 'iPad', count: 480, trend: '+3%' }
    ];

    res.json({
      success: true,
      data: {
        popular: popularSearches.slice(0, parseInt(req.query.limit || 8))
      }
    });

  } catch (error) {
    console.error('Popular searches error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get popular searches'
    });
  }
});

// Search analytics endpoint (for tracking user searches)
router.post('/track', async (req, res) => {
  try {
    const { searchTerm, resultCount, userId } = req.body;
    
    // In a real app, you'd store this in a search analytics table
    console.log('Search tracked:', {
      searchTerm,
      resultCount,
      userId,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Search tracked successfully'
    });

  } catch (error) {
    console.error('Search tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track search'
    });
  }
});

module.exports = router;