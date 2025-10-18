const express = require('express');
const chatbotService = require('../services/chatbotService');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Chat endpoint - handles user messages
router.post('/chat', async (req, res) => {
  try {
    const { message, sessionId, userId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Analyze user intent (now async with Dialogflow integration)
    const intent = await chatbotService.analyzeIntent(message.trim(), {
      userId,
      sessionId
    });
    
    // Generate response based on intent (enhanced with context)
    const response = await chatbotService.generateResponse(intent, intent.entities, userId, {
      originalMessage: message.trim(),
      sessionId,
      userId
    });

    // Log conversation for analytics (optional)
    console.log('Chatbot conversation:', {
      sessionId,
      userId,
      userMessage: message,
      intent: intent.intent,
      confidence: intent.confidence,
      timestamp: new Date()
    });

    res.json({
      success: true,
      data: {
        response,
        intent: intent.intent,
        confidence: intent.confidence,
        sessionId: sessionId || `session_${Date.now()}`
      }
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({
      success: false,
      message: 'Chatbot service error',
      data: {
        response: {
          type: 'text',
          message: "Sorry, I'm experiencing some technical difficulties. Please try again! 🤖",
          quickReplies: ["Try again", "Contact support"]
        }
      }
    });
  }
});

// Get quick reply suggestions
router.get('/quick-replies', (req, res) => {
  const quickReplies = [
    {
      category: 'Product Discovery',
      replies: [
        "Show me gaming laptops",
        "Best phones under ₹30000",
        "Latest headphones",
        "Budget tablets"
      ]
    },
    {
      category: 'Support',
      replies: [
        "Track my order",
        "Return policy",
        "Shipping info",
        "Payment methods"
      ]
    },
    {
      category: 'General',
      replies: [
        "What's trending?",
        "Today's deals",
        "New arrivals",
        "Help me choose"
      ]
    }
  ];

  res.json({
    success: true,
    data: quickReplies
  });
});

// Get FAQ categories and questions
router.get('/faqs', (req, res) => {
  const faqs = [
    {
      category: 'Returns & Refunds',
      questions: [
        {
          question: "What's your return policy?",
          answer: "You can return any product within 7 days of delivery. The product should be in original condition with all accessories. Full refund will be processed within 5-7 business days."
        },
        {
          question: "How do I return a product?",
          answer: "Go to 'My Orders', select the product you want to return, choose return reason, and schedule a pickup. Our team will collect the product from your address."
        }
      ]
    },
    {
      category: 'Shipping & Delivery',
      questions: [
        {
          question: "How long does shipping take?",
          answer: "Standard delivery takes 3-5 business days, while express delivery takes 1-2 business days. Free shipping on orders above ₹500."
        },
        {
          question: "Do you deliver everywhere in India?",
          answer: "Yes, we deliver pan-India. Some remote areas might take 1-2 additional days for delivery."
        }
      ]
    },
    {
      category: 'Payment & Pricing',
      questions: [
        {
          question: "What payment methods do you accept?",
          answer: "We accept Credit/Debit Cards, UPI, Net Banking, Wallets, and Cash on Delivery (COD)."
        },
        {
          question: "Is it safe to pay online?",
          answer: "Yes, absolutely! We use industry-standard encryption and secure payment gateways to protect your financial information."
        }
      ]
    },
    {
      category: 'Products & Warranty',
      questions: [
        {
          question: "Do products come with warranty?",
          answer: "Yes! All products come with manufacturer warranty. Warranty period varies by product - typically 1-3 years for electronics."
        },
        {
          question: "Are products genuine?",
          answer: "Yes, we only sell 100% genuine products sourced directly from authorized distributors and manufacturers."
        }
      ]
    }
  ];

  res.json({
    success: true,
    data: faqs
  });
});

// Test endpoint to verify chatbot is working
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Chatbot API is working!',
    timestamp: new Date().toISOString()
  });
});

// SambaNova health check endpoint
router.get('/ai-status', async (req, res) => {
  try {
    const sambaNovaService = require('../services/sambaNovaService');
    const status = await sambaNovaService.healthCheck();
    
    res.json({
      success: true,
      data: {
        sambanova: status,
        fallback: 'Rule-based system available'
      }
    });
  } catch (error) {
    res.json({
      success: true,
      data: {
        sambanova: { status: 'error', reason: error.message },
        fallback: 'Rule-based system available'
      }
    });
  }
});

// AI webhook endpoint for external integrations
router.post('/webhook', async (req, res) => {
  try {
    const { message, sessionId, userId } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Process the request through our chatbot service
    const intent = await chatbotService.analyzeIntent(message, { sessionId, userId });
    const response = await chatbotService.generateResponse(intent, intent.entities, userId, {
      originalMessage: message,
      sessionId,
      userId
    });

    res.json({
      success: true,
      data: {
        response: response.message,
        quickReplies: response.quickReplies || [],
        type: response.type
      }
    });

  } catch (error) {
    console.error('Webhook error:', error);
    res.json({
      success: false,
      message: 'Sorry, I\'m having trouble right now. Please try again!'
    });
  }
});

// Product comparison endpoint
router.post('/compare-products', async (req, res) => {
  try {
    const { productIds, preferences = {} } = req.body;
    
    if (!productIds || productIds.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'At least 2 product IDs are required for comparison'
      });
    }

    const productComparisonService = require('../services/productComparisonService');
    const comparison = await productComparisonService.compareProducts(productIds, preferences);

    res.json({
      success: true,
      data: comparison
    });

  } catch (error) {
    console.error('Product comparison error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to compare products'
    });
  }
});

// Conversation analytics endpoint
router.get('/conversation-stats', (req, res) => {
  try {
    const conversationService = require('../services/conversationService');
    const stats = conversationService.getStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Conversation stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conversation statistics'
    });
  }
});

// Get personalized recommendations
router.post('/recommendations', async (req, res) => {
  try {
    const { sessionId, userId, preferences = {} } = req.body;
    
    const conversationService = require('../services/conversationService');
    let userBehavior = null;
    
    if (sessionId) {
      userBehavior = conversationService.analyzeUserBehavior(sessionId, userId);
    }

    // Get recommendations using chatbot service
    const recommendations = await chatbotService.getPersonalizedRecommendations(
      preferences, 
      userBehavior
    );

    res.json({
      success: true,
      data: {
        recommendations,
        reasoning: chatbotService.generateRecommendationReasoning(userBehavior, preferences),
        userBehavior: userBehavior
      }
    });

  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendations'
    });
  }
});

// Get chatbot analytics (admin only)
router.get('/analytics', auth, async (req, res) => {
  try {
    // In a real implementation, you'd fetch analytics from database
    const analytics = {
      totalConversations: 1250,
      avgResponseTime: '0.8s',
      topIntents: [
        { intent: 'product_search', count: 450, percentage: 36 },
        { intent: 'faq', count: 300, percentage: 24 },
        { intent: 'order_tracking', count: 250, percentage: 20 },
        { intent: 'support', count: 150, percentage: 12 },
        { intent: 'greeting', count: 100, percentage: 8 }
      ],
      satisfactionRate: 4.2,
      commonQuestions: [
        "Gaming laptops under 70000",
        "Return policy",
        "Track order",
        "Best phones",
        "Shipping time"
      ]
    };

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics'
    });
  }
});

module.exports = router;