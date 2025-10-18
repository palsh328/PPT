const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ConversationService {
  constructor() {
    this.conversations = new Map(); // In-memory storage for active conversations
    this.maxHistoryLength = 20;
    this.contextTimeout = 30 * 60 * 1000; // 30 minutes
  }

  // Get or create conversation context
  getConversation(sessionId, userId = null) {
    const key = `${sessionId}_${userId || 'anonymous'}`;
    
    if (!this.conversations.has(key)) {
      this.conversations.set(key, {
        sessionId,
        userId,
        messages: [],
        context: {
          userProfile: {},
          preferences: {},
          currentTopic: null,
          lastActivity: new Date(),
          searchHistory: [],
          viewedProducts: [],
          cartItems: [],
          mood: 'neutral'
        },
        metadata: {
          totalMessages: 0,
          startTime: new Date(),
          lastInteraction: new Date()
        }
      });
    }

    const conversation = this.conversations.get(key);
    conversation.metadata.lastInteraction = new Date();
    
    return conversation;
  }

  // Add message to conversation history
  addMessage(sessionId, userId, message, type = 'user', metadata = {}) {
    const conversation = this.getConversation(sessionId, userId);
    
    const messageObj = {
      id: Date.now(),
      type,
      content: message,
      timestamp: new Date(),
      metadata
    };

    conversation.messages.push(messageObj);
    conversation.metadata.totalMessages++;

    // Keep only recent messages
    if (conversation.messages.length > this.maxHistoryLength) {
      conversation.messages = conversation.messages.slice(-this.maxHistoryLength);
    }

    return messageObj;
  }

  // Update conversation context
  updateContext(sessionId, userId, updates) {
    const conversation = this.getConversation(sessionId, userId);
    conversation.context = { ...conversation.context, ...updates };
    return conversation.context;
  }

  // Get conversation history for AI context
  getContextForAI(sessionId, userId, limit = 6) {
    const conversation = this.getConversation(sessionId, userId);
    
    return {
      recentMessages: conversation.messages.slice(-limit).map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: typeof msg.content === 'string' ? msg.content : msg.content.message || ''
      })),
      context: conversation.context,
      metadata: conversation.metadata
    };
  }

  // Analyze user behavior patterns
  analyzeUserBehavior(sessionId, userId) {
    const conversation = this.getConversation(sessionId, userId);
    const { messages, context } = conversation;

    const analysis = {
      isNewUser: messages.length <= 3,
      isActiveUser: messages.length > 10,
      preferredCategories: this.extractPreferredCategories(messages),
      budgetRange: this.extractBudgetRange(messages),
      shoppingIntent: this.analyzeShoppingIntent(messages),
      urgency: this.analyzeUrgency(messages),
      mood: context.mood || 'neutral'
    };

    // Update context with analysis
    this.updateContext(sessionId, userId, { 
      userProfile: analysis,
      lastAnalysis: new Date()
    });

    return analysis;
  }

  extractPreferredCategories(messages) {
    const categories = {};
    const categoryKeywords = {
      laptop: ['laptop', 'notebook', 'computer', 'pc'],
      phone: ['phone', 'mobile', 'smartphone', 'cell'],
      tablet: ['tablet', 'ipad'],
      headphones: ['headphones', 'earphones', 'earbuds', 'audio'],
      gaming: ['gaming', 'game', 'gamer', 'esports']
    };

    messages.forEach(msg => {
      if (msg.type === 'user') {
        const content = msg.content.toLowerCase();
        Object.entries(categoryKeywords).forEach(([category, keywords]) => {
          keywords.forEach(keyword => {
            if (content.includes(keyword)) {
              categories[category] = (categories[category] || 0) + 1;
            }
          });
        });
      }
    });

    return Object.entries(categories)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);
  }

  extractBudgetRange(messages) {
    const budgets = [];
    const budgetRegex = /(?:under|below|around|about|₹|rs\.?)\s*(\d+(?:,\d+)*(?:k|000)?)/gi;

    messages.forEach(msg => {
      if (msg.type === 'user') {
        const matches = msg.content.matchAll(budgetRegex);
        for (const match of matches) {
          let amount = match[1].replace(/,/g, '');
          if (amount.endsWith('k')) {
            amount = parseInt(amount) * 1000;
          } else {
            amount = parseInt(amount);
          }
          if (amount > 1000 && amount < 1000000) {
            budgets.push(amount);
          }
        }
      }
    });

    if (budgets.length === 0) return null;

    const avgBudget = budgets.reduce((sum, b) => sum + b, 0) / budgets.length;
    return {
      min: Math.min(...budgets),
      max: Math.max(...budgets),
      average: Math.round(avgBudget),
      mentions: budgets.length
    };
  }

  analyzeShoppingIntent(messages) {
    const intentKeywords = {
      browsing: ['looking', 'browsing', 'checking', 'exploring'],
      buying: ['buy', 'purchase', 'order', 'get', 'need now'],
      comparing: ['compare', 'difference', 'better', 'vs', 'versus'],
      researching: ['specs', 'features', 'reviews', 'performance']
    };

    const scores = {};
    messages.slice(-5).forEach(msg => {
      if (msg.type === 'user') {
        const content = msg.content.toLowerCase();
        Object.entries(intentKeywords).forEach(([intent, keywords]) => {
          keywords.forEach(keyword => {
            if (content.includes(keyword)) {
              scores[intent] = (scores[intent] || 0) + 1;
            }
          });
        });
      }
    });

    const topIntent = Object.entries(scores)
      .sort(([,a], [,b]) => b - a)[0];

    return topIntent ? topIntent[0] : 'browsing';
  }

  analyzeUrgency(messages) {
    const urgentKeywords = ['urgent', 'asap', 'immediately', 'today', 'now', 'quick'];
    const recentMessages = messages.slice(-3);

    const urgentCount = recentMessages.reduce((count, msg) => {
      if (msg.type === 'user') {
        const hasUrgent = urgentKeywords.some(keyword => 
          msg.content.toLowerCase().includes(keyword)
        );
        return count + (hasUrgent ? 1 : 0);
      }
      return count;
    }, 0);

    return urgentCount > 0 ? 'high' : 'normal';
  }

  // Clean up old conversations
  cleanup() {
    const now = new Date();
    for (const [key, conversation] of this.conversations.entries()) {
      const timeSinceLastActivity = now - conversation.metadata.lastInteraction;
      if (timeSinceLastActivity > this.contextTimeout) {
        this.conversations.delete(key);
      }
    }
  }

  // Get conversation statistics
  getStats() {
    return {
      activeConversations: this.conversations.size,
      totalMessages: Array.from(this.conversations.values())
        .reduce((sum, conv) => sum + conv.metadata.totalMessages, 0),
      averageSessionLength: this.calculateAverageSessionLength()
    };
  }

  calculateAverageSessionLength() {
    const conversations = Array.from(this.conversations.values());
    if (conversations.length === 0) return 0;

    const totalLength = conversations.reduce((sum, conv) => {
      const duration = conv.metadata.lastInteraction - conv.metadata.startTime;
      return sum + duration;
    }, 0);

    return Math.round(totalLength / conversations.length / 1000 / 60); // minutes
  }

  // Proactive suggestions based on context
  generateProactiveSuggestions(sessionId, userId) {
    const conversation = this.getConversation(sessionId, userId);
    const analysis = this.analyzeUserBehavior(sessionId, userId);
    const suggestions = [];

    // Based on shopping intent
    if (analysis.shoppingIntent === 'comparing') {
      suggestions.push({
        type: 'comparison',
        message: "Would you like me to create a detailed comparison of these products?",
        action: 'compare_products'
      });
    }

    // Based on budget mentions
    if (analysis.budgetRange && analysis.budgetRange.mentions > 1) {
      suggestions.push({
        type: 'budget_optimization',
        message: `I noticed you're looking around ₹${analysis.budgetRange.average.toLocaleString()}. Want to see the best value options in this range?`,
        action: 'show_best_value'
      });
    }

    // Based on category preferences
    if (analysis.preferredCategories.length > 0) {
      const topCategory = analysis.preferredCategories[0];
      suggestions.push({
        type: 'category_deals',
        message: `Check out our latest ${topCategory} deals and new arrivals!`,
        action: `browse_${topCategory}_deals`
      });
    }

    // Based on urgency
    if (analysis.urgency === 'high') {
      suggestions.push({
        type: 'express_delivery',
        message: "Need it fast? I can show you products with same-day or next-day delivery!",
        action: 'show_express_delivery'
      });
    }

    return suggestions.slice(0, 2); // Return top 2 suggestions
  }
}

// Cleanup old conversations every 10 minutes
const conversationService = new ConversationService();
setInterval(() => {
  conversationService.cleanup();
}, 10 * 60 * 1000);

module.exports = conversationService;