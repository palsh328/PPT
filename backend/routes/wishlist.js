const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { auth } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get user's wishlist
router.get('/', auth, async (req, res) => {
  try {
    const wishlistItems = await prisma.wishlist.findMany({
      where: { userId: req.user.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            mrp: true,
            images: true,
            stock: true,
            isActive: true,
            reviews: {
              select: { rating: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate average ratings
    const wishlistWithRatings = wishlistItems.map(item => {
      const avgRating = item.product.reviews.length > 0
        ? item.product.reviews.reduce((sum, review) => sum + review.rating, 0) / item.product.reviews.length
        : 0;
      
      return {
        ...item,
        product: {
          ...item.product,
          avgRating: Math.round(avgRating * 10) / 10,
          reviewCount: item.product.reviews.length,
          reviews: undefined
        }
      };
    });

    res.json({
      success: true,
      data: wishlistWithRatings
    });

  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wishlist'
    });
  }
});

// Add item to wishlist
router.post('/add', [
  auth,
  body('productId').notEmpty().withMessage('Product ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { productId } = req.body;

    // Check if product exists and is active
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, isActive: true }
    });

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if item already exists in wishlist
    const existingItem = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId
        }
      }
    });

    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: 'Item already in wishlist'
      });
    }

    const wishlistItem = await prisma.wishlist.create({
      data: {
        userId: req.user.id,
        productId
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            images: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Item added to wishlist',
      data: wishlistItem
    });

  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to wishlist'
    });
  }
});

// Remove item from wishlist
router.delete('/:itemId', auth, async (req, res) => {
  try {
    // Check if wishlist item exists and belongs to user
    const wishlistItem = await prisma.wishlist.findFirst({
      where: {
        id: req.params.itemId,
        userId: req.user.id
      }
    });

    if (!wishlistItem) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist item not found'
      });
    }

    await prisma.wishlist.delete({
      where: { id: req.params.itemId }
    });

    res.json({
      success: true,
      message: 'Item removed from wishlist'
    });

  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from wishlist'
    });
  }
});

// Remove by product ID
router.delete('/product/:productId', auth, async (req, res) => {
  try {
    const deleted = await prisma.wishlist.deleteMany({
      where: {
        userId: req.user.id,
        productId: req.params.productId
      }
    });

    if (deleted.count === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in wishlist'
      });
    }

    res.json({
      success: true,
      message: 'Item removed from wishlist'
    });

  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from wishlist'
    });
  }
});

// Check if product is in wishlist
router.get('/check/:productId', auth, async (req, res) => {
  try {
    const wishlistItem = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId: req.params.productId
        }
      }
    });

    res.json({
      success: true,
      data: {
        inWishlist: !!wishlistItem,
        itemId: wishlistItem?.id || null
      }
    });

  } catch (error) {
    console.error('Check wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check wishlist'
    });
  }
});

module.exports = router;