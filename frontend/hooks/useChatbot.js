import { useState, useCallback, useRef, useEffect } from 'react';
import axios from 'axios';

export const useChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Initialize session
    if (!sessionId) {
      setSessionId(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    }
  }, [sessionId]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = useCallback(async (message, userId = null) => {
    if (!message.trim()) return;

    // Add user message to chat
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/chatbot/chat`, {
        message,
        sessionId,
        userId
      });
      
      if (response.data.success) {
        const botResponse = {
          id: Date.now() + 1,
          type: 'bot',
          content: response.data.data.response,
          intent: response.data.data.intent,
          confidence: response.data.data.confidence,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, botResponse]);
        
        // Update session ID if provided
        if (response.data.data.sessionId) {
          setSessionId(response.data.data.sessionId);
        }
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      
      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: {
          type: 'text',
          message: "Sorry, I'm having trouble right now. Please try again! 🤖",
          quickReplies: ["Try again", "Contact support"]
        },
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  const sendQuickReply = useCallback((reply, userId = null) => {
    sendMessage(reply, userId);
  }, [sendMessage]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setSessionId(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  }, []);

  const startConversation = useCallback(() => {
    if (messages.length === 0) {
      const welcomeMessage = {
        id: Date.now(),
        type: 'bot',
        content: {
          type: 'text',
          message: "Hi there! 👋 I'm your shopping assistant. How can I help you today?",
          quickReplies: [
            "Find products",
            "Track my order", 
            "Return policy",
            "Need help"
          ]
        },
        timestamp: new Date()
      };
      
      setMessages([welcomeMessage]);
    }
    setIsOpen(true);
  }, [messages.length]);

  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleChat = useCallback(() => {
    if (!isOpen) {
      startConversation();
    } else {
      closeChat();
    }
  }, [isOpen, startConversation, closeChat]);

  return {
    messages,
    isLoading,
    isOpen,
    sessionId,
    messagesEndRef,
    sendMessage,
    sendQuickReply,
    clearChat,
    startConversation,
    closeChat,
    toggleChat
  };
};