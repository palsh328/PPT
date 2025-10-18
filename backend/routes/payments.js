const express = require('express');
const { body, validationResult } = require('express-validator');
const paymentService = require('../services/paymentService');
const { PrismaClient } = require('@prisma/client');
const { auth } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get payment methods
router.get('/methods', (req, res) => {
  res.json({
    success: true,
    data: {
      methods: [
        {
          id: 'COD',
          name: 'Cash on Delivery',
          description: 'Pay when you receive your order',
          icon: '💵',
          enabled: true
        },
        {
          id: 'DEBIT_CARD',
          name: 'Debit Card',
          description: 'Visa, Mastercard, RuPay',
          icon: '💳',
          enabled: true
        },
        {
          id: 'CREDIT_CARD', 
          name: 'Credit Card',
          description: 'Visa, Mastercard, American Express',
          icon: '💎',
          enabled: true
        },
        {
          id: 'UPI',
          name: 'UPI',
          description: 'Google Pay, PhonePe, Paytm, BHIM',
          icon: '📱',
          enabled: true
        },
        {
          id: 'NET_BANKING',
          name: 'Net Banking',
          description: 'All major banks supported',
          icon: '🏦',
          enabled: true
        },
        {
          id: 'WALLET',
          name: 'Wallet',
          description: 'Paytm, Amazon Pay, etc.',
          icon: '👛',
          enabled: true
        }
      ]
    }
  });
});

// Process payment
router.post('/process', 
  auth,
  [
    body('orderId').notEmpty().withMessage('Order ID is required'),
    body('method').isIn(['COD', 'DEBIT_CARD', 'CREDIT_CARD', 'UPI', 'NET_BANKING', 'WALLET'])
      .withMessage('Invalid payment method'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Invalid amount')
  ],
  async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { orderId, method, amount, paymentData } = req.body;

    // Verify order exists and belongs to user
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: req.user.id
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order amount matches
    if (parseFloat(order.finalAmount) !== parseFloat(amount)) {
      return res.status(400).json({
        success: false,
        message: 'Amount mismatch'
      });
    }

    let paymentResult;

    // Process payment based on method
    switch (method) {
      case 'COD':
        paymentResult = {
          success: true,
          transactionId: `COD${Date.now()}`,
          message: 'Cash on Delivery order confirmed',
          gatewayResponse: { method: 'COD' }
        };
        break;

      case 'DEBIT_CARD':
        paymentResult = await paymentService.processDebitCard({
          ...paymentData,
          amount
        });
        break;

      case 'CREDIT_CARD':
        paymentResult = await paymentService.processCreditCard({
          ...paymentData,
          amount
        });
        break;

      case 'UPI':
        paymentResult = await paymentService.processUPI({
          ...paymentData,
          amount
        });
        break;

      case 'NET_BANKING':
        paymentResult = await paymentService.processNetBanking({
          ...paymentData,
          amount
        });
        break;

      case 'WALLET':
        paymentResult = await paymentService.processWallet({
          ...paymentData,
          amount
        });
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Unsupported payment method'
        });
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        orderId,
        amount: parseFloat(amount),
        method,
        status: paymentResult.success ? 'COMPLETED' : 'FAILED',
        transactionId: paymentResult.transactionId,
        gatewayResponse: paymentResult.gatewayResponse
      }
    });

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: paymentResult.success ? 'COMPLETED' : 'FAILED',
        orderStatus: paymentResult.success ? 'CONFIRMED' : 'PENDING'
      }
    });

    res.json({
      success: true,
      data: {
        paymentId: payment.id,
        transactionId: paymentResult.transactionId,
        status: paymentResult.success ? 'SUCCESS' : 'FAILED',
        message: paymentResult.message,
        method
      }
    });

  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Payment processing failed'
    });
  }
});

// Get payment details
router.get('/:paymentId', auth, async (req, res) => {
  try {
    const payment = await prisma.payment.findFirst({
      where: {
        id: req.params.paymentId,
        order: {
          userId: req.user.id
        }
      },
      include: {
        order: {
          select: {
            orderNumber: true,
            totalAmount: true,
            finalAmount: true
          }
        }
      }
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      data: payment
    });

  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment details'
    });
  }
});

module.exports = router;