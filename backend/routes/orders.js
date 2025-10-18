const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { auth } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Generate order number
function generateOrderNumber() {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PPT${timestamp.slice(-6)}${random}`;
}

// Create order
router.post('/create', [
  auth,
  body('addressId').notEmpty().withMessage('Address is required'),
  body('paymentMethod').isIn(['COD', 'DEBIT_CARD', 'CREDIT_CARD', 'UPI', 'NET_BANKING', 'WALLET'])
    .withMessage('Invalid payment method'),
  body('couponCode').optional({ nullable: true }).isString()
], async (req, res) => {
  try {
    console.log('📦 Order creation request:', {
      body: req.body,
      user: req.user?.id,
      userEmail: req.user?.email
    });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { addressId, paymentMethod, couponCode, notes } = req.body;

    // Verify address belongs to user
    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId: req.user.id
      }
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // Get cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            stock: true,
            isActive: true
          }
        }
      }
    });

    if (cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Validate stock and calculate totals
    let totalAmount = 0;
    const orderItems = [];

    for (const item of cartItems) {
      if (!item.product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.product.name} is no longer available`
        });
      }

      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.product.name}`
        });
      }

      const itemTotal = parseFloat(item.product.price) * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price,
        total: itemTotal
      });
    }

    // Apply coupon if provided
    let discount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode }
      });

      if (coupon && coupon.isActive && 
          new Date() >= coupon.validFrom && 
          new Date() <= coupon.validUntil &&
          (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) &&
          (!coupon.minAmount || totalAmount >= parseFloat(coupon.minAmount))) {
        
        if (coupon.type === 'PERCENTAGE') {
          discount = (totalAmount * parseFloat(coupon.value)) / 100;
          if (coupon.maxDiscount) {
            discount = Math.min(discount, parseFloat(coupon.maxDiscount));
          }
        } else {
          discount = parseFloat(coupon.value);
        }
        
        discount = Math.min(discount, totalAmount);
      }
    }

    // Calculate shipping (free for orders above ₹500)
    const shippingFee = totalAmount >= 500 ? 0 : 50;
    const finalAmount = totalAmount - discount + shippingFee;

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: req.user.id,
        addressId,
        totalAmount,
        shippingFee,
        discount,
        finalAmount,
        paymentMethod,
        couponCode: couponCode || null,
        notes: notes || null,
        items: {
          create: orderItems
        }
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
        address: true
      }
    });

    // Update product stock
    for (const item of cartItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      });
    }

    // Update coupon usage
    if (couponCode && discount > 0) {
      await prisma.coupon.update({
        where: { code: couponCode },
        data: {
          usedCount: {
            increment: 1
          }
        }
      });
    }

    // Clear cart
    await prisma.cartItem.deleteMany({
      where: { userId: req.user.id }
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order'
    });
  }
});

// Get user orders
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId: req.user.id },
        include: {
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  images: true,
                  slug: true
                }
              }
            }
          },
          address: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.order.count({
        where: { userId: req.user.id }
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
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
});

// Get single order
router.get('/:orderId', auth, async (req, res) => {
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: req.params.orderId,
        userId: req.user.id
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                images: true,
                slug: true
              }
            }
          }
        },
        address: true,
        payments: true
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order'
    });
  }
});

// Generate invoice
router.get('/:orderId/invoice', auth, async (req, res) => {
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: req.params.orderId,
        userId: req.user.id
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                images: true,
                slug: true
              }
            }
          }
        },
        address: true,
        payments: true
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Only allow invoice generation for delivered orders
    if (order.orderStatus !== 'DELIVERED') {
      return res.status(400).json({
        success: false,
        message: 'Invoice can only be generated for delivered orders'
      });
    }

    const invoiceService = require('../services/invoiceService');
    const { filename, filepath } = await invoiceService.generateInvoice(order);

    // Send the PDF file
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    const fs = require('fs');
    const fileStream = fs.createReadStream(filepath);
    fileStream.pipe(res);

    // Clean up the file after sending (optional)
    fileStream.on('end', () => {
      fs.unlink(filepath, (err) => {
        if (err) console.error('Error deleting invoice file:', err);
      });
    });

  } catch (error) {
    console.error('Generate invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate invoice'
    });
  }
});

// Cancel order
router.put('/:orderId/cancel', auth, async (req, res) => {
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: req.params.orderId,
        userId: req.user.id
      },
      include: {
        items: true
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (!['PENDING', 'CONFIRMED'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled'
      });
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: req.params.orderId },
      data: { orderStatus: 'CANCELLED' }
    });

    // Restore product stock
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            increment: item.quantity
          }
        }
      });
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: updatedOrder
    });

  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order'
    });
  }
});

module.exports = router;