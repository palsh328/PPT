class SentimentService {
  constructor() {
    this.sentimentKeywords = {
      positive: {
        high: ['amazing', 'excellent', 'fantastic', 'perfect', 'love', 'awesome', 'brilliant', 'outstanding'],
        medium: ['good', 'nice', 'great', 'fine', 'okay', 'decent', 'satisfied', 'happy'],
        low: ['alright', 'acceptable', 'fair']
      },
      negative: {
        high: ['terrible', 'awful', 'horrible', 'hate', 'disgusting', 'worst', 'furious', 'angry'],
        medium: ['bad', 'poor', 'disappointing', 'frustrated', 'annoyed', 'upset', 'dissatisfied'],
        low: ['not great', 'could be better', 'meh', 'disappointed']
      },
      neutral: ['okay', 'fine', 'normal', 'standard', 'regular'],
      urgency: ['urgent', 'asap', 'immediately', 'quickly', 'fast', 'rush', 'emergency'],
      confusion: ['confused', 'lost', 'help', 'don\'t understand', 'unclear', 'what', 'how'],
      excitement: ['excited', 'can\'t wait', 'thrilled', 'eager', 'looking forward']
    };

    this.emoticons = {
      positive: ['😊', '😄', '😃', '🙂', '👍', '❤️', '💖', '🎉', '✨'],
      negative: ['😞', '😢', '😠', '😡', '👎', '💔', '😤', '😣'],
      neutral: ['😐', '🤔', '😑'],
      confusion: ['😕', '🤷', '❓', '😵'],
      excitement: ['🤩', '😍', '🔥', '💯', '🚀']
    };
  }

  analyzeSentiment(message) {
    const text = message.toLowerCase();
    const analysis = {
      sentiment: 'neutral',
      intensity: 0,
      emotions: [],
      confidence: 0,
      keywords: []
    };

    let positiveScore = 0;
    let negativeScore = 0;
    let emotionScores = {};

    // Analyze keywords
    Object.entries(this.sentimentKeywords).forEach(([emotion, levels]) => {
      if (typeof levels === 'object' && levels.high) {
        // Sentiment categories (positive/negative)
        Object.entries(levels).forEach(([intensity, keywords]) => {
          keywords.forEach(keyword => {
            if (text.includes(keyword)) {
              const score = intensity === 'high' ? 3 : intensity === 'medium' ? 2 : 1;
              
              if (emotion === 'positive') {
                positiveScore += score;
              } else if (emotion === 'negative') {
                negativeScore += score;
              }
              
              analysis.keywords.push({ keyword, emotion, intensity, score });
            }
          });
        });
      } else if (Array.isArray(levels)) {
        // Emotion categories
        levels.forEach(keyword => {
          if (text.includes(keyword)) {
            emotionScores[emotion] = (emotionScores[emotion] || 0) + 1;
            analysis.keywords.push({ keyword, emotion, score: 1 });
          }
        });
      }
    });

    // Analyze emoticons
    Object.entries(this.emoticons).forEach(([emotion, emojis]) => {
      emojis.forEach(emoji => {
        if (message.includes(emoji)) {
          emotionScores[emotion] = (emotionScores[emotion] || 0) + 2;
          analysis.keywords.push({ keyword: emoji, emotion, score: 2 });
        }
      });
    });

    // Determine overall sentiment
    const totalScore = positiveScore + negativeScore;
    if (totalScore > 0) {
      if (positiveScore > negativeScore) {
        analysis.sentiment = 'positive';
        analysis.intensity = positiveScore / totalScore;
      } else {
        analysis.sentiment = 'negative';
        analysis.intensity = negativeScore / totalScore;
      }
      analysis.confidence = Math.min(totalScore / 5, 1); // Normalize confidence
    }

    // Add detected emotions
    analysis.emotions = Object.entries(emotionScores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([emotion, score]) => ({ emotion, score }));

    return analysis;
  }

  generateEmpatheticResponse(sentiment, emotions = []) {
    const responses = {
      positive: {
        high: [
          "That's fantastic! I'm so glad you're excited! 🎉",
          "Wonderful! Your enthusiasm is contagious! ✨",
          "Amazing! I love your positive energy! 😄"
        ],
        medium: [
          "Great to hear! I'm happy to help! 😊",
          "That's good news! Let's keep this momentum going! 👍",
          "Nice! I'm glad things are going well! 🙂"
        ],
        low: [
          "Good to know! I'm here to help make it even better! 😊",
          "That's a good start! Let's see what we can do! 👍"
        ]
      },
      negative: {
        high: [
          "I'm really sorry you're feeling this way. Let me help make this better! 💙",
          "I understand your frustration. I'm here to help resolve this! 🤝",
          "That sounds really tough. Let's work together to fix this! 💪"
        ],
        medium: [
          "I hear you, and I want to help improve this situation! 😔",
          "I understand this is disappointing. Let me see what I can do! 🤝",
          "Sorry this isn't going as expected. I'm here to help! 💙"
        ],
        low: [
          "I understand this could be better. Let me help! 🤝",
          "No worries, let's see how we can improve this! 😊"
        ]
      },
      confusion: [
        "I can see this might be confusing! Let me break it down for you! 🤔",
        "No worries, I'm here to help clarify things! 😊",
        "Let me explain this step by step! 📝"
      ],
      urgency: [
        "I understand this is urgent! Let me help you quickly! ⚡",
        "Got it - let's get this sorted out fast! 🚀",
        "I'll prioritize this for you right away! ⏰"
      ],
      excitement: [
        "I love your excitement! Let's find something amazing! 🤩",
        "Your enthusiasm is awesome! I'm excited to help! 🔥",
        "This is going to be great! Let's dive in! ✨"
      ]
    };

    // Check for specific emotions first
    for (const emotion of emotions) {
      if (responses[emotion.emotion]) {
        const emotionResponses = responses[emotion.emotion];
        return emotionResponses[Math.floor(Math.random() * emotionResponses.length)];
      }
    }

    // Fall back to sentiment-based responses
    if (sentiment.sentiment !== 'neutral') {
      const intensityLevel = sentiment.intensity > 0.7 ? 'high' : 
                           sentiment.intensity > 0.4 ? 'medium' : 'low';
      
      const sentimentResponses = responses[sentiment.sentiment][intensityLevel];
      if (sentimentResponses) {
        return sentimentResponses[Math.floor(Math.random() * sentimentResponses.length)];
      }
    }

    return null; // No empathetic response needed
  }

  adjustResponseTone(baseResponse, sentiment, emotions = []) {
    if (sentiment.sentiment === 'negative' && sentiment.intensity > 0.5) {
      // Make response more supportive and solution-focused
      return this.makeSupportive(baseResponse);
    }
    
    if (emotions.some(e => e.emotion === 'urgency')) {
      // Make response more direct and action-oriented
      return this.makeUrgent(baseResponse);
    }
    
    if (emotions.some(e => e.emotion === 'confusion')) {
      // Make response clearer and more explanatory
      return this.makeClearer(baseResponse);
    }
    
    if (sentiment.sentiment === 'positive' && sentiment.intensity > 0.6) {
      // Match the enthusiasm
      return this.makeEnthusiastic(baseResponse);
    }

    return baseResponse;
  }

  makeSupportive(response) {
    const supportivePrefixes = [
      "I completely understand, and I'm here to help! ",
      "No worries at all! ",
      "I've got you covered! ",
      "Let me take care of this for you! "
    ];
    
    const prefix = supportivePrefixes[Math.floor(Math.random() * supportivePrefixes.length)];
    return prefix + response;
  }

  makeUrgent(response) {
    const urgentPrefixes = [
      "Right away! ",
      "Absolutely, let's get this done quickly! ",
      "I'll help you fast! ",
      "Let's prioritize this! "
    ];
    
    const prefix = urgentPrefixes[Math.floor(Math.random() * urgentPrefixes.length)];
    return prefix + response;
  }

  makeClearer(response) {
    const clarifyingPrefixes = [
      "Let me explain this clearly: ",
      "Here's what I can help you with: ",
      "To make this simple: ",
      "Step by step: "
    ];
    
    const prefix = clarifyingPrefixes[Math.floor(Math.random() * clarifyingPrefixes.length)];
    return prefix + response;
  }

  makeEnthusiastic(response) {
    // Add more exclamation marks and positive emojis
    let enthusiastic = response.replace(/\./g, '!');
    
    const enthusiasticEmojis = ['🎉', '✨', '🚀', '💫', '🌟'];
    const randomEmoji = enthusiasticEmojis[Math.floor(Math.random() * enthusiasticEmojis.length)];
    
    return enthusiastic + ' ' + randomEmoji;
  }

  // Track sentiment over conversation
  trackConversationMood(messages) {
    const recentMessages = messages.slice(-5); // Last 5 messages
    const sentiments = recentMessages
      .filter(msg => msg.type === 'user')
      .map(msg => this.analyzeSentiment(msg.content));

    if (sentiments.length === 0) return 'neutral';

    const avgSentiment = sentiments.reduce((sum, s) => {
      const score = s.sentiment === 'positive' ? s.intensity : 
                   s.sentiment === 'negative' ? -s.intensity : 0;
      return sum + score;
    }, 0) / sentiments.length;

    if (avgSentiment > 0.3) return 'positive';
    if (avgSentiment < -0.3) return 'negative';
    return 'neutral';
  }
}

module.exports = new SentimentService();