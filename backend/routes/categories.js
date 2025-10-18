const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            products: {
              where: { isActive: true }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      data: categories.map(category => ({
        ...category,
        productCount: category._count.products,
        _count: undefined
      }))
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
});

// Get category by slug
router.get('/:slug', async (req, res) => {
  try {
    const category = await prisma.category.findUnique({
      where: { slug: req.params.slug },
      include: {
        _count: {
          select: {
            products: {
              where: { isActive: true }
            }
          }
        }
      }
    });

    if (!category || !category.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: {
        ...category,
        productCount: category._count.products,
        _count: undefined
      }
    });

  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category'
    });
  }
});

// Search categories
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 5 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.json({
        success: true,
        data: { categories: [] }
      });
    }

    const searchTerm = q.trim();
    
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } }
        ]
      },
      include: {
        _count: {
          select: {
            products: {
              where: { isActive: true }
            }
          }
        }
      },
      take: parseInt(limit)
    });

    // Add product count to each category
    const categoriesWithCount = categories.map(category => ({
      ...category,
      productCount: category._count.products,
      _count: undefined
    }));

    res.json({
      success: true,
      data: {
        categories: categoriesWithCount,
        searchTerm: q
      }
    });

  } catch (error) {
    console.error('Category search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search categories'
    });
  }
});

module.exports = router;