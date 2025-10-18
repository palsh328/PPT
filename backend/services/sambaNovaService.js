const axios = require('axios');
require('dotenv').config();

class SambaNovaService {
  constructor() {
    this.apiKey = process.env.SAMBANOVA_API_KEY;
    this.baseURL = 'https://api.sambanova.ai/v1';
    this.model = 'Meta-Llama-3.1-8B-Instruct';
    
    if (!this.apiKey) {
      console.warn('⚠️ SambaNova API key not found. Chatbot will use rule-based responses only.');
    }
  }

  async detectIntent(sessionId, message, userId = null) {
    if (!this.apiKey) {
      throw new Error('SambaNova API key not configured');
    }

    try {
      const prompt = this.buildIntentDetectionPrompt(message);
      
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are an AI assistant that analyzes user messages for e-commerce intent detection. Respond only with valid JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 200,
          temperature: 0.1
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const aiResponse = response.data.choices[0].message.content;
      const intentData = this.parseIntentResponse(aiResponse);
      
      return {
        intent: intentData.intent,
        confidence: intentData.confidence,
        entities: intentData.entities,
        fulfillmentText: intentData.response,
        source: 'sambanova'
      };

    } catch (error) {
      console.error('SambaNova intent detection error:', error.message);
      throw error;
    }
  }

  buildIntentDetectionPrompt(message) {
    return `Analyze this e-commerce customer message and return a JSON response with intent classification:

Message: "${message}"

Available intents:
- product_search: User looking for products
- order_tracking: User wants to track an order
- faq: User asking general questions
- support: User needs help
- greeting: User saying hello
- goodbye: User ending conversation
- return_policy: User asking about returns
- shipping_info: User asking about shipping
- payment_info: User asking about payments

Extract entities like:
- category: product category (laptop, phone, etc.)
- budget: price range mentioned
- brand: brand names mentioned
- orderNumber: order/tracking numbers

Return JSON format:
{
  "intent": "intent_name",
  "confidence": 0.0-1.0,
  "entities": {
    "category": "value or null",
    "budget": number or null,
    "brand": "value or null",
    "orderNumber": "value or null"
  },
  "response": "helpful response message"
}`;
  }

  parseIntentResponse(aiResponse) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          intent: parsed.intent || 'support',
          confidence: parsed.confidence || 0.7,
          entities: parsed.entities || {},
          response: parsed.response || ''
        };
      }
    } catch (error) {
      console.error('Failed to parse SambaNova response:', error);
    }

    // Fallback parsing
    return {
      intent: 'support',
      confidence: 0.5,
      entities: {},
      response: 'I\'m here to help! What can I assist you with?'
    };
  }

  async generateResponse(intent, entities, context = {}) {
    if (!this.apiKey) {
      throw new Error('SambaNova API key not configured');
    }

    try {
      const prompt = this.buildResponsePrompt(intent, entities, context);
      
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful e-commerce customer service assistant. Be friendly, concise, and helpful. Always provide actionable suggestions.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 300,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const aiResponse = response.data.choices[0].message.content;
      
      return {
        type: 'text',
        message: aiResponse,
        quickReplies: this.generateQuickReplies(intent),
        source: 'sambanova'
      };

    } catch (error) {
      console.error('SambaNova response generation error:', error.message);
      throw error;
    }
  }

  buildResponsePrompt(intent, entities, context) {
    const { originalMessage, sessionId } = context;
    
    let prompt = `Generate a helpful response for this e-commerce customer interaction:

Intent: ${intent}
Original Message: "${originalMessage}"
`;

    if (entities && Object.keys(entities).length > 0) {
      prompt += `Entities: ${JSON.stringify(entities)}\n`;
    }

    switch (intent) {
      case 'product_search':
        prompt += `
The user is looking for products. Be enthusiastic and helpful. If they mentioned specific criteria (category, budget, brand), acknowledge it. Offer to show them products and provide helpful suggestions.`;
        break;
      
      case 'order_tracking':
        prompt += `
The user wants to track their order. Be reassuring and helpful. If they provided an order number, acknowledge it. Explain how order tracking works and offer assistance.`;
        break;
      
      case 'faq':
        prompt += `
The user has a general question. Be informative and helpful. Provide clear, accurate information about policies, procedures, or general inquiries.`;
        break;
      
      case 'greeting':
        prompt += `
The user is greeting you. Be warm and welcoming. Introduce yourself as their shopping assistant and offer to help them find products or answer questions.`;
        break;
      
      default:
        prompt += `
Provide general customer support. Be helpful and guide them toward finding products, tracking orders, or getting the information they need.`;
    }

    prompt += `\n\nKeep the response under 100 words, friendly, and actionable.`;
    
    return prompt;
  }

  generateQuickReplies(intent) {
    const quickReplies = {
      product_search: ['Show me options', 'Filter by price', 'Compare products', 'Need help choosing'],
      order_tracking: ['Track package', 'Contact delivery', 'Order details', 'Need help'],
      faq: ['More questions', 'Contact support', 'Browse products', 'Return policy'],
      greeting: ['Find products', 'Track order', 'FAQs', 'Deals'],
      support: ['Find products', 'Track order', 'Return policy', 'Contact human']
    };

    return quickReplies[intent] || ['Find products', 'Track order', 'FAQs', 'Contact support'];
  }

  async healthCheck() {
    if (!this.apiKey) {
      return {
        status: 'disabled',
        reason: 'API key not configured'
      };
    }

    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: this.model,
          messages: [
            {
              role: 'user',
              content: 'Hello, this is a health check. Please respond with "OK".'
            }
          ],
          max_tokens: 10,
          temperature: 0
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        status: 'healthy',
        model: this.model,
        response: response.data.choices[0].message.content
      };

    } catch (error) {
      return {
        status: 'error',
        reason: error.message
      };
    }
  }

  // Helper methods for backward compatibility
  extractEntities(parameters) {
    return parameters || {};
  }

  mapDialogflowIntent(intent) {
    // Map any legacy intent names to our standard format
    const intentMap = {
      'Default Welcome Intent': 'greeting',
      'Default Fallback Intent': 'support'
    };
    
    return intentMap[intent] || intent;
  }

  createFulfillmentResponse(message, quickReplies = []) {
    return {
      fulfillmentText: message,
      fulfillmentMessages: [
        {
          text: {
            text: [message]
          }
        }
      ]
    };
  }
}

module.exports = new SambaNovaService();