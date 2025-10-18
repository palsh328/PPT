const { PrismaClient } = require('@prisma/client');
const sambaNovaService = require('./sambaNovaService');
const conversationService = require('./conversationService');
const sentimentService = require('./sentimentService');
const productComparisonService = require('./productComparisonService');
const prisma = new PrismaClient();

class ChatbotService {
  constructor() {
    this.intents = {
      PRODUCT_SEARCH: 'product_search',
      ORDER_TRACKING: 'order_tracking',
      FAQ: 'faq',
      SUPPORT: 'support',
      GREETING: 'greeting',
      GOODBYE: 'goodbye',
      RETURN_POLICY: 'return_policy',
      SHIPPING_INFO: 'shipping_info',
      PAYMENT_INFO: 'payment_info',
      PRODUCT_COMPARISON: 'product_comparison',
      RECOMMENDATION_REQUEST: 'recommendation_request',
      PRICE_INQUIRY: 'price_inquiry',
      AVAILABILITY_CHECK: 'availability_check',
      TECHNICAL_SUPPORT: 'technical_support'
    };

    this.faqs = {
      return_policy: {
        question: "What's your return policy?",
        answer: "You can return any product within 7 days of delivery. The product should be in original condition with all accessories. Full refund will be processed within 5-7 business days.",
        category: "Returns"
      },
      shipping_info: {
        question: "How long does shipping take?",
        answer: "We offer free shipping on orders above ₹500. Standard delivery takes 3-5 business days, while express delivery takes 1-2 business days.",
        category: "Shipping"
      },
      payment_methods: {
        question: "What payment methods do you accept?",
        answer: "We accept all major payment methods: Credit/Debit Cards, UPI, Net Banking, Wallets, and Cash on Delivery (COD).",
        category: "Payment"
      },
      warranty: {
        question: "Do products come with warranty?",
        answer: "Yes! All products come with manufacturer warranty. Warranty period varies by product - typically 1-3 years for electronics.",
        category: "Warranty"
      },
      order_cancellation: {
        question: "Can I cancel my order?",
        answer: "You can cancel your order within 24 hours of placing it. After that, you can return the product once delivered.",
        category: "Orders"
      }
    };
  }

  // Enhanced intent analysis with Dialogflow + rule-based fallback + context awareness
  async analyzeIntent(message, context = {}) {
    const { sessionId, userId } = context;
    
    // Add message to conversation history
    if (sessionId) {
      conversationService.addMessage(sessionId, userId, message, 'user');
    }

    // Analyze sentiment for emotional intelligence
    const sentiment = sentimentService.analyzeSentiment(message);
    
    // Get conversation context for better understanding
    const conversationContext = sessionId ? 
      conversationService.getContextForAI(sessionId, userId) : null;

    try {
      // Try SambaNova intent detection first
      const sambaNovaResult = await sambaNovaService.detectIntent(
        sessionId || `session_${Date.now()}`, 
        message, 
        userId
      );
      
      if (sambaNovaResult && sambaNovaResult.confidence > 0.6) {
        console.log('✅ Using SambaNova intent analysis:', sambaNovaResult.intent);
        
        // Update conversation context with analysis
        if (sessionId) {
          conversationService.updateContext(sessionId, userId, {
            lastIntent: sambaNovaResult.intent,
            mood: sentiment.sentiment,
            aiContext: sambaNovaResult
          });
        }

        return {
          intent: sambaNovaResult.intent,
          confidence: sambaNovaResult.confidence,
          entities: this.normalizeEntities(sambaNovaResult.entities),
          fulfillmentText: sambaNovaResult.fulfillmentText,
          sentiment,
          source: 'sambanova'
        };
      }
      
      console.log('⚠️ SambaNova confidence low or unavailable, using rule-based fallback');
    } catch (error) {
      console.log('❌ SambaNova analysis failed, using rule-based fallback:', error.message);
    }

    // Fallback to rule-based analysis with sentiment
    const ruleBasedResult = this.ruleBasedAnalysis(message);
    return {
      ...ruleBasedResult,
      sentiment
    };
  }

  // Original rule-based analysis as fallback
  ruleBasedAnalysis(message) {
    const lowerMessage = message.toLowerCase();
    
    // Product search patterns
    if (this.isProductSearch(lowerMessage)) {
      return {
        intent: this.intents.PRODUCT_SEARCH,
        confidence: 0.9,
        entities: this.extractProductEntities(lowerMessage),
        source: 'rules'
      };
    }

    // Order tracking patterns
    if (this.isOrderTracking(lowerMessage)) {
      return {
        intent: this.intents.ORDER_TRACKING,
        confidence: 0.9,
        entities: this.extractOrderNumber(lowerMessage),
        source: 'rules'
      };
    }

    // FAQ patterns
    const faqMatch = this.matchFAQ(lowerMessage);
    if (faqMatch) {
      return {
        intent: this.intents.FAQ,
        confidence: 0.8,
        faqKey: faqMatch,
        source: 'rules'
      };
    }

    // Greeting patterns
    if (this.isGreeting(lowerMessage)) {
      return {
        intent: this.intents.GREETING,
        confidence: 0.9,
        source: 'rules'
      };
    }

    // Goodbye patterns
    if (this.isGoodbye(lowerMessage)) {
      return {
        intent: this.intents.GOODBYE,
        confidence: 0.9,
        source: 'rules'
      };
    }

    // Default to support
    return {
      intent: this.intents.SUPPORT,
      confidence: 0.5,
      source: 'rules'
    };
  }

  // Normalize entities from Dialogflow to match our format
  normalizeEntities(entities) {
    if (!entities) return {};
    
    return {
      category: entities.category,
      budget: entities.budget,
      features: entities.features || [],
      brand: entities.brand,
      orderNumber: entities.orderNumber,
      productName: entities.productName
    };
  }

  isProductSearch(message) {
    const productKeywords = [
      'laptop', 'phone', 'mobile', 'tablet', 'headphones', 'speaker',
      'camera', 'watch', 'gaming', 'ssd', 'ram', 'processor',
      'need', 'want', 'looking for', 'search', 'find', 'buy',
      'under', 'budget', 'price', 'cheap', 'best'
    ];
    
    return productKeywords.some(keyword => message.includes(keyword));
  }

  isOrderTracking(message) {
    const trackingKeywords = [
      'track', 'order', 'status', 'delivery', 'shipped',
      'where is my', 'order number', '#'
    ];
    
    return trackingKeywords.some(keyword => message.includes(keyword));
  }

  isGreeting(message) {
    const greetings = [
      'hi', 'hello', 'hey', 'good morning', 'good afternoon',
      'good evening', 'start', 'help'
    ];
    
    return greetings.some(greeting => message.includes(greeting));
  }

  isGoodbye(message) {
    const goodbyes = [
      'bye', 'goodbye', 'thanks', 'thank you', 'done', 'exit'
    ];
    
    return goodbyes.some(goodbye => message.includes(goodbye));
  }

  matchFAQ(message) {
    for (const [key, faq] of Object.entries(this.faqs)) {
      const keywords = faq.question.toLowerCase().split(' ');
      const matchCount = keywords.filter(keyword => 
        keyword.length > 3 && message.includes(keyword)
      ).length;
      
      if (matchCount >= 2) {
        return key;
      }
    }
    return null;
  }

  extractProductEntities(message) {
    const entities = {
      category: null,
      budget: null,
      features: [],
      brand: null
    };

    // Extract category
    const categories = ['laptop', 'phone', 'mobile', 'tablet', 'headphones', 'speaker', 'camera', 'watch'];
    entities.category = categories.find(cat => message.includes(cat));

    // Extract budget
    const budgetMatch = message.match(/under\s*₹?(\d+(?:,\d+)*)/i) || 
                       message.match(/below\s*₹?(\d+(?:,\d+)*)/i) ||
                       message.match(/₹(\d+(?:,\d+)*)/);
    if (budgetMatch) {
      entities.budget = parseInt(budgetMatch[1].replace(/,/g, ''));
    }

    // Extract features
    const features = ['gaming', 'ssd', 'ram', '4gb', '8gb', '16gb', 'i5', 'i7', 'ryzen'];
    entities.features = features.filter(feature => message.includes(feature));

    // Extract brand
    const brands = ['apple', 'samsung', 'oneplus', 'xiaomi', 'dell', 'hp', 'lenovo', 'asus'];
    entities.brand = brands.find(brand => message.includes(brand));

    return entities;
  }

  extractOrderNumber(message) {
    const orderMatch = message.match(/#?(\w+\d+|\d+)/);
    return orderMatch ? orderMatch[1] : null;
  }

  // Enhanced response generation with context, sentiment, and proactive features
  async generateResponse(intent, entities, userId = null, context = {}) {
    const { sessionId, originalMessage } = context;
    
    // Get conversation context and user behavior analysis
    let conversationContext = null;
    let userBehavior = null;
    if (sessionId) {
      conversationContext = conversationService.getContextForAI(sessionId, userId);
      userBehavior = conversationService.analyzeUserBehavior(sessionId, userId);
    }

    try {
      // Enhanced SambaNova response generation with full context
      if (intent.source === 'sambanova' || intent.confidence > 0.7) {
        // Start with SambaNova's fulfillment text if available
        let baseMessage = intent.fulfillmentText || '';
        
        // Enhance with structured data based on intent
        const enhancedResponse = await this.enhanceSambaNovaResponse(
          baseMessage, intent, entities, userId, context
        );
        
        // Apply sentiment-based tone adjustments
        if (intent.sentiment && enhancedResponse.message) {
          enhancedResponse.message = sentimentService.adjustResponseTone(
            enhancedResponse.message, 
            intent.sentiment, 
            intent.sentiment.emotions
          );
          
          // Add empathetic prefix if needed
          const empatheticResponse = sentimentService.generateEmpatheticResponse(
            intent.sentiment, 
            intent.sentiment.emotions
          );
          if (empatheticResponse) {
            enhancedResponse.message = empatheticResponse + '\n\n' + enhancedResponse.message;
          }
        }

        // Add proactive suggestions based on user behavior
        if (userBehavior && sessionId) {
          const proactiveSuggestions = conversationService.generateProactiveSuggestions(
            sessionId, userId
          );
          if (proactiveSuggestions.length > 0) {
            enhancedResponse.proactiveSuggestions = proactiveSuggestions;
          }
        }

        // Store bot response in conversation
        if (sessionId) {
          conversationService.addMessage(sessionId, userId, enhancedResponse, 'bot', {
            intent: intent.intent,
            confidence: intent.confidence,
            sentiment: intent.sentiment?.sentiment,
            source: 'sambanova'
          });
        }

        return enhancedResponse;
      }
    } catch (error) {
      console.log('SambaNova response generation failed, using rule-based fallback:', error.message);
    }

    // Enhanced rule-based fallback with sentiment awareness
    const ruleBasedResponse = await this.generateRuleBasedResponse(intent, entities, userId, context);
    
    // Apply sentiment adjustments to rule-based responses too
    if (intent.sentiment) {
      ruleBasedResponse.message = sentimentService.adjustResponseTone(
        ruleBasedResponse.message, 
        intent.sentiment, 
        intent.sentiment.emotions
      );
    }

    // Store bot response in conversation
    if (sessionId) {
      conversationService.addMessage(sessionId, userId, ruleBasedResponse, 'bot', {
        intent: intent.intent,
        confidence: intent.confidence,
        source: 'rules'
      });
    }

    return ruleBasedResponse;
  }

  // Enhanced SambaNova response with structured data and advanced features
  async enhanceSambaNovaResponse(baseMessage, intent, entities, userId, context = {}) {
    // If no base message from Dialogflow, generate one based on intent
    if (!baseMessage) {
      baseMessage = this.generateDefaultMessage(intent.intent, entities);
    }
    switch (intent.intent) {
      case this.intents.PRODUCT_SEARCH:
        const products = await this.getProductRecommendations(entities);
        if (products.length > 0) {
          return {
            type: 'products',
            message: baseMessage || `Here are some great ${entities.category || 'products'} for you! 🛍️`,
            products: products,
            quickReplies: [
              'Show more options',
              'Compare these products',
              'Filter by price',
              'Need help choosing'
            ]
          };
        }
        break;
      
      case this.intents.ORDER_TRACKING:
        const orderInfo = await this.getOrderInfo(entities, userId);
        if (orderInfo) {
          return {
            type: 'order_status',
            message: baseMessage || 'Here\'s your order status:',
            order: orderInfo,
            quickReplies: [
              'Track package',
              'Contact delivery partner',
              'Need help'
            ]
          };
        }
        break;

      case this.intents.PRODUCT_COMPARISON:
        return await this.handleProductComparison(entities, { message: baseMessage });

      case this.intents.RECOMMENDATION_REQUEST:
        return await this.handleRecommendationRequest(entities, { message: baseMessage }, context);

      case this.intents.FAQ:
        return {
          type: 'faq',
          message: baseMessage || this.getFAQResponse(entities),
          quickReplies: [
            'More questions',
            'Contact support',
            'Browse products'
          ]
        };

      case this.intents.GREETING:
        return {
          type: 'text',
          message: baseMessage || 'Hi there! 👋 I\'m your shopping assistant. How can I help you today?',
          quickReplies: [
            'Find products',
            'Track my order',
            'Return policy',
            'Need help'
          ]
        };
    }

    return {
      type: 'text',
      message: baseMessage || 'I\'m here to help! What would you like to know?',
      quickReplies: [
        'Find products',
        'Track order',
        'FAQs',
        'Contact support'
      ]
    };
  }

  generateDefaultMessage(intent, entities) {
    const messages = {
      product_search: `Let me help you find the perfect ${entities.category || 'product'}! 🔍`,
      order_tracking: 'I\'ll help you track your order! 📦',
      faq: 'I\'m here to answer your questions! ❓',
      greeting: 'Hello! How can I assist you today? 😊',
      goodbye: 'Thank you for chatting! Have a great day! 👋',
      support: 'I\'m here to help! What do you need assistance with? 🤝'
    };

    return messages[intent] || 'How can I help you today?';
  }

  getFAQResponse(entities) {
    // Return appropriate FAQ response based on context
    return 'I\'d be happy to help answer your questions! What would you like to know about our policies or services?';
  }

  async handleProductComparison(entities, dialogflowResponse) {
    try {
      if (entities.productIds && entities.productIds.length >= 2) {
        const comparison = await productComparisonService.compareProducts(
          entities.productIds,
          entities.preferences || {}
        );

        return {
          type: 'product_comparison',
          message: dialogflowResponse.message || 'Here\'s a detailed comparison of these products:',
          comparison: comparison,
          quickReplies: [
            'Show detailed specs',
            'Which is better value?',
            'See more alternatives',
            'Help me decide'
          ]
        };
      }
    } catch (error) {
      console.error('Product comparison error:', error);
    }

    return {
      type: 'text',
      message: "I'd be happy to help you compare products! Please share the specific products you'd like to compare, and I'll provide a detailed analysis.",
      quickReplies: ['Browse products', 'Popular comparisons', 'Need help choosing']
    };
  }

  async handleRecommendationRequest(entities, dialogflowResponse, context) {
    // Get personalized recommendations based on user behavior
    const { sessionId, userId } = context;
    let userBehavior = null;
    
    if (sessionId) {
      userBehavior = conversationService.analyzeUserBehavior(sessionId, userId);
    }

    const recommendations = await this.getPersonalizedRecommendations(
      entities, 
      userBehavior
    );

    return {
      type: 'recommendations',
      message: dialogflowResponse.message || 'Here are some personalized recommendations for you:',
      recommendations: recommendations,
      reasoning: this.generateRecommendationReasoning(userBehavior, entities),
      quickReplies: [
        'Tell me more',
        'Show alternatives',
        'Compare options',
        'Check prices'
      ]
    };
  }

  async getPersonalizedRecommendations(entities, userBehavior) {
    let whereClause = { isActive: true };

    // Use user behavior to enhance recommendations
    if (userBehavior) {
      // Prefer categories user has shown interest in
      if (userBehavior.preferredCategories.length > 0) {
        const categories = await prisma.category.findMany({
          where: {
            name: { in: userBehavior.preferredCategories, mode: 'insensitive' }
          }
        });
        if (categories.length > 0) {
          whereClause.categoryId = { in: categories.map(c => c.id) };
        }
      }

      // Respect user's budget preferences
      if (userBehavior.budgetRange) {
        whereClause.price = {
          gte: userBehavior.budgetRange.min * 0.8, // 20% below min
          lte: userBehavior.budgetRange.max * 1.2  // 20% above max
        };
      }
    }

    // Apply entity filters
    if (entities.category) {
      const category = await prisma.category.findFirst({
        where: { name: { contains: entities.category, mode: 'insensitive' } }
      });
      if (category) {
        whereClause.categoryId = category.id;
      }
    }

    if (entities.budget) {
      whereClause.price = { lte: entities.budget };
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: true,
        reviews: { select: { rating: true } }
      },
      take: 8,
      orderBy: [
        { isFeatured: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return products.map(product => ({
      ...product,
      avgRating: product.reviews.length > 0 
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        : 0,
      personalizedScore: this.calculatePersonalizationScore(product, userBehavior)
    })).sort((a, b) => b.personalizedScore - a.personalizedScore);
  }

  calculatePersonalizationScore(product, userBehavior) {
    let score = 0;

    if (!userBehavior) return Math.random(); // Random if no behavior data

    // Category preference boost
    if (userBehavior.preferredCategories.includes(product.category?.name?.toLowerCase())) {
      score += 3;
    }

    // Budget alignment boost
    if (userBehavior.budgetRange) {
      const { min, max, average } = userBehavior.budgetRange;
      if (product.price >= min && product.price <= max) {
        score += 2;
      }
      // Bonus for being close to average budget
      const budgetDiff = Math.abs(product.price - average) / average;
      if (budgetDiff < 0.2) score += 1;
    }

    // Shopping intent boost
    if (userBehavior.shoppingIntent === 'buying' && product.stock > 0) {
      score += 1;
    }

    // Rating boost
    const avgRating = product.reviews.length > 0 
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
      : 0;
    score += avgRating * 0.5;

    return score;
  }

  generateRecommendationReasoning(userBehavior, entities) {
    const reasons = [];

    if (userBehavior?.preferredCategories?.length > 0) {
      reasons.push(`Based on your interest in ${userBehavior.preferredCategories.join(', ')}`);
    }

    if (userBehavior?.budgetRange) {
      reasons.push(`Matching your budget range of ₹${userBehavior.budgetRange.min.toLocaleString()} - ₹${userBehavior.budgetRange.max.toLocaleString()}`);
    }

    if (userBehavior?.shoppingIntent === 'buying') {
      reasons.push('Prioritizing available products for immediate purchase');
    }

    if (reasons.length === 0) {
      reasons.push('Based on popular products and current trends');
    }

    return reasons.join('. ');
  }

  // Original rule-based response generation
  async generateRuleBasedResponse(intent, entities, userId) {
    switch (intent.intent) {
      case this.intents.GREETING:
        return this.generateGreeting();
      
      case this.intents.PRODUCT_SEARCH:
        return await this.generateProductRecommendations(entities);
      
      case this.intents.ORDER_TRACKING:
        return await this.generateOrderStatus(entities, userId);
      
      case this.intents.FAQ:
        return this.generateFAQResponse(intent.faqKey);
      
      case this.intents.GOODBYE:
        return this.generateGoodbye();
      
      default:
        return this.generateSupportResponse();
    }
  }

  generateGreeting() {
    const greetings = [
      "Hi there! 👋 I'm your shopping assistant. How can I help you today?",
      "Hello! 😊 I'm here to help you find the perfect electronics. What are you looking for?",
      "Hey! 🛍️ Ready to discover some amazing tech products? Ask me anything!"
    ];
    
    return {
      type: 'text',
      message: greetings[Math.floor(Math.random() * greetings.length)],
      quickReplies: [
        "Find products",
        "Track my order",
        "Return policy",
        "Need help"
      ]
    };
  }

  // Separate method for getting product recommendations (used by both Dialogflow and rule-based)
  async getProductRecommendations(entities) {
    try {
      let whereClause = { isActive: true };
      
      // Add category filter
      if (entities.category) {
        const category = await prisma.category.findFirst({
          where: {
            name: { contains: entities.category, mode: 'insensitive' }
          }
        });
        if (category) {
          whereClause.categoryId = category.id;
        }
      }

      // Add budget filter
      if (entities.budget) {
        whereClause.price = { lte: entities.budget };
      }

      // Add feature filters
      if (entities.features && entities.features.length > 0) {
        whereClause.OR = entities.features.map(feature => ({
          OR: [
            { name: { contains: feature, mode: 'insensitive' } },
            { description: { contains: feature, mode: 'insensitive' } },
            { features: { has: feature } }
          ]
        }));
      }

      // Add brand filter
      if (entities.brand) {
        whereClause.brand = { contains: entities.brand, mode: 'insensitive' };
      }

      const products = await prisma.product.findMany({
        where: whereClause,
        include: {
          category: true,
          reviews: {
            select: { rating: true }
          }
        },
        take: 6,
        orderBy: [
          { isFeatured: 'desc' },
          { createdAt: 'desc' }
        ]
      });

      return products.map(product => ({
        ...product,
        avgRating: product.reviews.length > 0 
          ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
          : 0
      }));

    } catch (error) {
      console.error('Product recommendation error:', error);
      return [];
    }
  }

  async generateProductRecommendations(entities) {
    const products = await this.getProductRecommendations(entities);

    if (products.length === 0) {
      return {
        type: 'text',
        message: "I couldn't find products matching your criteria. Let me show you some popular options instead! 🔍",
        quickReplies: [
          "Show popular laptops",
          "Show budget phones",
          "Browse categories"
        ]
      };
    }

    let responseMessage = "Here are some great options for you! 👇";
    
    if (entities.budget) {
      responseMessage = `Here are some excellent ${entities.category || 'products'} under ₹${entities.budget.toLocaleString()}! 💰`;
    }

    return {
      type: 'products',
      message: responseMessage,
      products: products,
      quickReplies: [
        "Show more options",
        "Filter by price",
        "Need help choosing"
      ]
    };
  }

  // Separate method for getting order information (used by both Dialogflow and rule-based)
  async getOrderInfo(entities, userId) {
    try {
      const orderNumber = entities.orderNumber || entities;
      
      if (!orderNumber) {
        return null;
      }

      const order = await prisma.order.findFirst({
        where: {
          orderNumber: orderNumber,
          ...(userId && { userId })
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });

      if (!order) {
        return null;
      }

      return {
        orderNumber: order.orderNumber,
        status: order.orderStatus,
        totalAmount: order.finalAmount,
        items: order.items,
        estimatedDelivery: order.estimatedDelivery,
        trackingNumber: order.trackingNumber
      };

    } catch (error) {
      console.error('Order info error:', error);
      return null;
    }
  }

  async generateOrderStatus(entities, userId) {
    const orderNumber = entities.orderNumber || entities;
    
    if (!orderNumber) {
      return {
        type: 'text',
        message: "Please provide your order number to track your order. You can find it in your email confirmation! 📧",
        quickReplies: ["Check my orders", "Contact support"]
      };
    }

    const order = await this.getOrderInfo(entities, userId);

    if (!order) {
      return {
        type: 'text',
        message: `I couldn't find order #${orderNumber}. Please check the order number and try again! 🔍`,
        quickReplies: ["Try again", "Contact support", "View my orders"]
      };
    }

    const statusEmojis = {
      PENDING: '⏳',
      CONFIRMED: '✅',
      PROCESSING: '📦',
      SHIPPED: '🚚',
      OUT_FOR_DELIVERY: '🚛',
      DELIVERED: '✅',
      CANCELLED: '❌',
      RETURNED: '↩️'
    };

    const statusMessages = {
      PENDING: 'Your order is being processed',
      CONFIRMED: 'Your order has been confirmed',
      PROCESSING: 'Your order is being prepared',
      SHIPPED: 'Your order has been shipped',
      OUT_FOR_DELIVERY: 'Your order is out for delivery',
      DELIVERED: 'Your order has been delivered',
      CANCELLED: 'Your order has been cancelled',
      RETURNED: 'Your order has been returned'
    };

    let deliveryInfo = '';
    if (order.estimatedDelivery) {
      const deliveryDate = new Date(order.estimatedDelivery);
      const today = new Date();
      const diffTime = deliveryDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 0) {
        deliveryInfo = `\n📅 Expected delivery: ${diffDays} day${diffDays > 1 ? 's' : ''}`;
      } else if (diffDays === 0) {
        deliveryInfo = '\n📅 Expected delivery: Today';
      }
    }

    return {
      type: 'order_status',
      message: `${statusEmojis[order.status]} ${statusMessages[order.status]}${deliveryInfo}`,
      order: order,
      quickReplies: [
        "Track package",
        "Contact delivery partner",
        "Need help"
      ]
    };
  }

  generateFAQResponse(faqKey) {
    const faq = this.faqs[faqKey];
    if (!faq) {
      return this.generateSupportResponse();
    }

    return {
      type: 'faq',
      message: faq.answer,
      category: faq.category,
      quickReplies: [
        "More questions",
        "Contact support",
        "Browse products"
      ]
    };
  }

  generateGoodbye() {
    const goodbyes = [
      "Thanks for chatting! Have a great day! 😊",
      "Goodbye! Feel free to ask if you need anything else! 👋",
      "Take care! I'm here whenever you need help shopping! 🛍️"
    ];
    
    return {
      type: 'text',
      message: goodbyes[Math.floor(Math.random() * goodbyes.length)]
    };
  }

  generateSupportResponse() {
    return {
      type: 'text',
      message: "I'm here to help! You can ask me about:\n\n🔍 Finding products\n📦 Order tracking\n❓ FAQs and policies\n🛍️ Shopping assistance\n\nWhat would you like to know?",
      quickReplies: [
        "Find products",
        "Track order",
        "Return policy",
        "Contact human support"
      ]
    };
  }

  // Get conversation context for better responses
  async getConversationContext(userId, sessionId) {
    // In a real implementation, you'd store conversation history
    // For now, return empty context
    return {
      previousMessages: [],
      userPreferences: {},
      currentTopic: null
    };
  }
}

module.exports = new ChatbotService();