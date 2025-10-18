const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all products with filters and pagination
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('category').optional().isString(),
  query('brand').optional().isString(),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('search').optional().isString(),
  query('sortBy').optional().isIn(['price_asc', 'price_desc', 'name_asc', 'name_desc', 'newest', 'popular']),
  query('featured').optional().isBoolean()
], async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      brand,
      minPrice,
      maxPrice,
      search,
      sortBy = 'newest',
      featured
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build where clause
    const where = {
      isActive: true,
      ...(category && { category: { slug: category } }),
      ...(brand && { brand: { contains: brand, mode: 'insensitive' } }),
      ...(minPrice && { price: { gte: parseFloat(minPrice) } }),
      ...(maxPrice && { price: { lte: parseFloat(maxPrice) } }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { brand: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(featured === 'true' && { isFeatured: true })
    };

    // Build orderBy clause
    let orderBy = {};
    switch (sortBy) {
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
      case 'name_asc':
        orderBy = { name: 'asc' };
        break;
      case 'name_desc':
        orderBy = { name: 'desc' };
        break;
      case 'popular':
        orderBy = { reviews: { _count: 'desc' } };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: parseInt(limit),
        include: {
          category: {
            select: { name: true, slug: true }
          },
          reviews: {
            select: { rating: true }
          },
          _count: {
            select: { reviews: true }
          }
        }
      }),
      prisma.product.count({ where })
    ]);

    // Calculate average ratings
    const productsWithRatings = products.map(product => {
      const avgRating = product.reviews.length > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        : 0;
      
      return {
        ...product,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: product._count.reviews,
        reviews: undefined,
        _count: undefined
      };
    });

    res.json({
      success: true,
      data: {
        products: productsWithRatings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
});

// Get single product by slug
router.get('/:slug', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: {
        category: {
          select: { name: true, slug: true }
        },
        reviews: {
          include: {
            user: {
              select: { firstName: true, lastName: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Calculate average rating
    const avgRating = product.reviews.length > 0
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
      : 0;

    res.json({
      success: true,
      data: {
        ...product,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: product.reviews.length
      }
    });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product'
    });
  }
});

// Get featured products
router.get('/featured/list', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        isFeatured: true
      },
      take: 8,
      include: {
        category: {
          select: { name: true, slug: true }
        },
        reviews: {
          select: { rating: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const productsWithRatings = products.map(product => {
      const avgRating = product.reviews.length > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        : 0;
      
      return {
        ...product,
        avgRating: Math.round(avgRating * 10) / 10,
        reviews: undefined
      };
    });

    res.json({
      success: true,
      data: productsWithRatings
    });

  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured products'
    });
  }
});

// Get related products
router.get('/:id/related', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      select: { categoryId: true, id: true }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        isActive: true
      },
      take: 4,
      include: {
        category: {
          select: { name: true, slug: true }
        },
        reviews: {
          select: { rating: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const productsWithRatings = relatedProducts.map(product => {
      const avgRating = product.reviews.length > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        : 0;
      
      return {
        ...product,
        avgRating: Math.round(avgRating * 10) / 10,
        reviews: undefined
      };
    });

    res.json({
      success: true,
      data: productsWithRatings
    });

  } catch (error) {
    console.error('Get related products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch related products'
    });
  }
});

// Create new product (for sellers)
router.post('/', [
  auth,
  body('name').notEmpty().withMessage('Product name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('mrp').isFloat({ min: 0 }).withMessage('Valid MRP is required'),
  body('stock').isInt({ min: 0 }).withMessage('Valid stock quantity is required'),
  body('brand').notEmpty().withMessage('Brand is required'),
  body('sku').notEmpty().withMessage('SKU is required'),
  body('categoryId').notEmpty().withMessage('Category is required'),
  body('slug').notEmpty().withMessage('Slug is required'),
  body('images').isArray().withMessage('Images must be an array'),
  body('features').isArray().withMessage('Features must be an array')
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

    // Only sellers and admins can create products
    if (!['SELLER', 'ADMIN'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only sellers can create products.'
      });
    }

    const {
      name,
      description,
      price,
      mrp,
      stock,
      brand,
      model,
      sku,
      categoryId,
      slug,
      images,
      features,
      specifications
    } = req.body;

    // Check if SKU already exists
    const existingSKU = await prisma.product.findUnique({
      where: { sku }
    });

    if (existingSKU) {
      return res.status(400).json({
        success: false,
        message: 'SKU already exists'
      });
    }

    // Check if slug already exists
    const existingSlug = await prisma.product.findUnique({
      where: { slug }
    });

    if (existingSlug) {
      return res.status(400).json({
        success: false,
        message: 'Product slug already exists'
      });
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price,
        mrp,
        stock,
        brand,
        model: model || null,
        sku,
        categoryId,
        sellerId: req.user.role === 'SELLER' ? req.user.id : null,
        images: images || [],
        features: features || [],
        specifications: specifications || {}
      },
      include: {
        category: {
          select: { name: true, slug: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product'
    });
  }
});

// Toggle product deal status
router.patch('/:id/deal', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { isDeal, dealPrice, dealEndDate, dealDescription } = req.body;

    // Check if product exists and belongs to the seller
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user is the seller of this product or admin
    if (req.user.role !== 'ADMIN' && existingProduct.sellerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this product'
      });
    }

    // Update product deal status
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        isDeal,
        dealPrice: isDeal ? (dealPrice ? parseFloat(dealPrice) : null) : null,
        dealEndDate: isDeal ? (dealEndDate ? new Date(dealEndDate) : null) : null,
        dealDescription: isDeal ? dealDescription : null
      },
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: `Product ${isDeal ? 'added to' : 'removed from'} deals successfully`,
      data: updatedProduct
    });

  } catch (error) {
    console.error('Toggle deal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update deal status'
    });
  }
});

// Smart search with typo tolerance and suggestions
router.get('/smart-search', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.json({
        success: true,
        data: { products: [] }
      });
    }

    const searchTerm = q.trim().toLowerCase();
    
    // Enhanced search with multiple strategies
    const searchStrategies = [
      // Exact match (highest priority)
      {
        name: { contains: searchTerm, mode: 'insensitive' }
      },
      // Brand match
      {
        brand: { contains: searchTerm, mode: 'insensitive' }
      },
      // Description match
      {
        description: { contains: searchTerm, mode: 'insensitive' }
      },
      // Features match
      {
        features: { hasSome: [searchTerm] }
      }
    ];

    // Try each strategy and combine results
    let allProducts = [];
    const seenIds = new Set();

    for (const strategy of searchStrategies) {
      const products = await prisma.product.findMany({
        where: {
          isActive: true,
          ...strategy
        },
        include: {
          category: true,
          seller: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          },
          reviews: {
            select: {
              rating: true
            }
          }
        },
        take: parseInt(limit)
      });

      // Add unique products
      products.forEach(product => {
        if (!seenIds.has(product.id)) {
          seenIds.add(product.id);
          allProducts.push(product);
        }
      });

      if (allProducts.length >= parseInt(limit)) break;
    }

    // Calculate ratings and enhance data
    const enhancedProducts = allProducts.slice(0, parseInt(limit)).map(product => {
      const avgRating = product.reviews.length > 0 
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        : 0;

      return {
        ...product,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: product.reviews.length,
        reviews: undefined // Remove reviews array from response
      };
    });

    res.json({
      success: true,
      data: {
        products: enhancedProducts,
        searchTerm: q,
        totalFound: allProducts.length
      }
    });

  } catch (error) {
    console.error('Smart search error:', error);
    res.status(500).json({
      success: false,
      message: 'Smart search failed'
    });
  }
});

// Get all deals (active deals only)
router.get('/deals', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      brand,
      minPrice,
      maxPrice,
      search,
      sortBy = 'newest'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build where clause for deals
    const where = {
      isActive: true,
      isDeal: true,
      dealEndDate: {
        gte: new Date() // Only active deals
      },
      ...(category && { category: { slug: category } }),
      ...(brand && { brand: { contains: brand, mode: 'insensitive' } }),
      ...(minPrice && { dealPrice: { gte: parseFloat(minPrice) } }),
      ...(maxPrice && { dealPrice: { lte: parseFloat(maxPrice) } }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { brand: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    // Build orderBy clause
    let orderBy = {};
    switch (sortBy) {
      case 'price_asc':
        orderBy = { dealPrice: 'asc' };
        break;
      case 'price_desc':
        orderBy = { dealPrice: 'desc' };
        break;
      case 'name_asc':
        orderBy = { name: 'asc' };
        break;
      case 'name_desc':
        orderBy = { name: 'desc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'ending_soon':
        orderBy = { dealEndDate: 'asc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    const [deals, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          seller: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          },
          reviews: {
            select: {
              rating: true
            }
          }
        },
        orderBy,
        skip,
        take: parseInt(limit)
      }),
      prisma.product.count({ where })
    ]);

    // Calculate average ratings and add deal info
    const dealsWithRatings = deals.map(deal => {
      const avgRating = deal.reviews.length > 0 
        ? deal.reviews.reduce((sum, review) => sum + review.rating, 0) / deal.reviews.length
        : 0;

      const discount = deal.price && deal.dealPrice 
        ? Math.round(((deal.price - deal.dealPrice) / deal.price) * 100)
        : 0;

      return {
        ...deal,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: deal.reviews.length,
        discount,
        savings: deal.price && deal.dealPrice ? deal.price - deal.dealPrice : 0,
        reviews: undefined // Remove reviews array from response
      };
    });

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      success: true,
      data: dealsWithRatings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: totalPages,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Get deals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch deals'
    });
  }
});

module.exports = router;