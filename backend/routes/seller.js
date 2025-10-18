const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { auth } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Middleware to check if user is seller
const sellerAuth = (req, res, next) => {
  if (req.user.role !== 'SELLER') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Seller privileges required.'
    });
  }
  next();
};

// Get seller's orders (orders containing seller's products)
router.get('/orders', auth, sellerAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const whereClause = {
      items: {
        some: {
          product: {
            sellerId: req.user.id
          }
        }
      }
    };

    if (status) {
      whereClause.orderStatus = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
        include: {
          items: {
            where: {
              product: {
                sellerId: req.user.id
              }
            },
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                  slug: true
                }
              }
            }
          },
          address: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.order.count({
        where: whereClause
      })
    ]);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get seller orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
});

// Update order status (seller can confirm/reject orders)
router.put('/orders/:orderId/status', [
  auth,
  sellerAuth,
  body('status').isIn(['CONFIRMED', 'PROCESSING', 'SHIPPED', 'CANCELLED'])
    .withMessage('Invalid status'),
  body('deliveryPartnerId').optional().isString()
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

    const { orderId } = req.params;
    const { status, deliveryPartnerId } = req.body;

    // Check if order contains seller's products
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        items: {
          some: {
            product: {
              sellerId: req.user.id
            }
          }
        }
      },
      include: {
        items: {
          where: {
            product: {
              sellerId: req.user.id
            }
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or not authorized'
      });
    }

    // Update order status
    const updateData = { orderStatus: status };
    
    // If shipping and delivery partner is provided, assign it
    if (status === 'SHIPPED' && deliveryPartnerId) {
      updateData.deliveryPartnerId = deliveryPartnerId;
      updateData.trackingNumber = `TRK${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    }
    
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        items: {
          where: {
            product: {
              sellerId: req.user.id
            }
          },
          include: {
            product: {
              select: {
                name: true,
                images: true
              }
            }
          }
        },
        address: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: `Order ${status.toLowerCase()} successfully`,
      data: updatedOrder
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status'
    });
  }
});

// Get seller's products
router.get('/products', auth, sellerAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: { sellerId: req.user.id },
        include: {
          category: {
            select: {
              name: true,
              slug: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.product.count({
        where: { sellerId: req.user.id }
      })
    ]);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get seller products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
});

// Get available delivery partners
router.get('/delivery-partners', auth, sellerAuth, async (req, res) => {
  try {
    const deliveryPartners = await prisma.user.findMany({
      where: {
        role: 'DELIVERY',
        isActive: true
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true
      }
    });

    res.json({
      success: true,
      data: deliveryPartners
    });

  } catch (error) {
    console.error('Get delivery partners error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch delivery partners'
    });
  }
});

// Get seller dashboard stats
router.get('/dashboard', auth, sellerAuth, async (req, res) => {
  try {
    const [
      totalProducts,
      totalOrders,
      pendingOrders,
      totalRevenue
    ] = await Promise.all([
      prisma.product.count({
        where: { sellerId: req.user.id }
      }),
      prisma.order.count({
        where: {
          items: {
            some: {
              product: {
                sellerId: req.user.id
              }
            }
          }
        }
      }),
      prisma.order.count({
        where: {
          orderStatus: 'PENDING',
          items: {
            some: {
              product: {
                sellerId: req.user.id
              }
            }
          }
        }
      }),
      prisma.orderItem.aggregate({
        where: {
          product: {
            sellerId: req.user.id
          },
          order: {
            orderStatus: {
              in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED']
            }
          }
        },
        _sum: {
          total: true
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalProducts,
        totalOrders,
        pendingOrders,
        totalRevenue: totalRevenue._sum.total || 0
      }
    });

  } catch (error) {
    console.error('Get seller dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
});

// Update seller bank details
router.put('/bank-details', [
  auth,
  sellerAuth,
  body('accountHolderName').optional().notEmpty().withMessage('Account holder name cannot be empty'),
  body('accountNumber').optional().notEmpty().withMessage('Account number cannot be empty'),
  body('ifscCode').optional().notEmpty().withMessage('IFSC code cannot be empty'),
  body('bankName').optional().notEmpty().withMessage('Bank name cannot be empty'),
  body('branchName').optional().notEmpty().withMessage('Branch name cannot be empty')
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

    const bankDetails = req.body;

    // Store bank details in user table (in a real app, you might want a separate table)
    await prisma.user.update({
      where: { id: req.user.id },
      data: { 
        bankDetails: bankDetails 
      }
    });

    res.json({
      success: true,
      message: 'Bank details updated successfully'
    });

  } catch (error) {
    console.error('Update bank details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update bank details'
    });
  }
});

// Get seller bank details
router.get('/bank-details', auth, sellerAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { bankDetails: true }
    });

    res.json({
      success: true,
      data: user.bankDetails || {}
    });

  } catch (error) {
    console.error('Get bank details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bank details'
    });
  }
});

module.exports = router;