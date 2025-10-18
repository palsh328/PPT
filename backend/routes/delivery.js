const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { auth } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Middleware to check if user is delivery partner
const deliveryAuth = (req, res, next) => {
  if (req.user.role !== 'DELIVERY') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Delivery partner privileges required.'
    });
  }
  next();
};

// Get delivery partner's assigned orders
router.get('/orders', auth, deliveryAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const whereClause = {
      deliveryPartnerId: req.user.id
    };

    if (status) {
      whereClause.orderStatus = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
        include: {
          items: {
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
    console.error('Get delivery orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
});

// Update order delivery status
router.put('/orders/:orderId/status', [
  auth,
  deliveryAuth,
  body('status').isIn(['OUT_FOR_DELIVERY', 'DELIVERED'])
    .withMessage('Invalid status')
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
    const { status } = req.body;

    // Check if order is assigned to this delivery partner
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        deliveryPartnerId: req.user.id
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or not assigned to you'
      });
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { 
        orderStatus: status,
        ...(status === 'DELIVERED' && { estimatedDelivery: new Date() })
      },
      include: {
        items: {
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
      message: `Order marked as ${status.toLowerCase().replace('_', ' ')} successfully`,
      data: updatedOrder
    });

  } catch (error) {
    console.error('Update delivery status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status'
    });
  }
});

// Update delivery partner location
router.put('/location', [
  auth,
  deliveryAuth,
  body('latitude').isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
  body('longitude').isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),
  body('timestamp').isISO8601()
    .withMessage('Invalid timestamp')
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

    const { latitude, longitude, timestamp } = req.body;

    // Update or create delivery partner location
    const location = await prisma.deliveryLocation.upsert({
      where: { deliveryPartnerId: req.user.id },
      update: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        lastUpdated: new Date(timestamp),
        isActive: true
      },
      create: {
        deliveryPartnerId: req.user.id,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        lastUpdated: new Date(timestamp),
        isActive: true
      }
    });

    res.json({
      success: true,
      message: 'Location updated successfully',
      data: location
    });

  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update location'
    });
  }
});

// Get delivery partner dashboard stats
router.get('/dashboard', auth, deliveryAuth, async (req, res) => {
  try {
    const [
      totalOrders,
      pendingOrders,
      deliveredOrders,
      todayDeliveries
    ] = await Promise.all([
      prisma.order.count({
        where: { deliveryPartnerId: req.user.id }
      }),
      prisma.order.count({
        where: {
          deliveryPartnerId: req.user.id,
          orderStatus: 'SHIPPED'
        }
      }),
      prisma.order.count({
        where: {
          deliveryPartnerId: req.user.id,
          orderStatus: 'DELIVERED'
        }
      }),
      prisma.order.count({
        where: {
          deliveryPartnerId: req.user.id,
          orderStatus: 'DELIVERED',
          updatedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        deliveredOrders,
        todayDeliveries
      }
    });

  } catch (error) {
    console.error('Get delivery dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
});

module.exports = router;