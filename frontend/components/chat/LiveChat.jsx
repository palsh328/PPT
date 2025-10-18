'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  ShoppingBagIcon,
  TruckIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import { useChatbot } from '@/hooks/useChatbot';
import { useAuth } from '@/app/providers';

const LiveChat = () => {
  const [inputMessage, setInputMessage] = useState('');
  const inputRef = useRef(null);
  const { user } = useAuth();
  
  const {
    messages,
    isLoading,
    isOpen,
    messagesEndRef,
    sendMessage,
    sendQuickReply,
    clearChat,
    toggleChat
  } = useChatbot();

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    sendMessage(inputMessage, user?.id);
    setInputMessage('');
    inputRef.current?.focus();
  };

  const handleQuickReply = (reply) => {
    sendQuickReply(reply, user?.id);
  };

  const renderMessage = (message) => {
    const { content } = message;

    if (message.type === 'user') {
      return (
        <div className="flex justify-end mb-4">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-lg max-w-xs">
            <p className="text-sm">{content}</p>
          </div>
        </div>
      );
    }

    // Bot message
    return (
      <div className="flex justify-start mb-4">
        <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg max-w-sm">
          {content.type === 'text' && (
            <p className="text-sm text-gray-900 dark:text-white whitespace-pre-line">
              {content.message}
            </p>
          )}

          {content.type === 'products' && (
            <div>
              <p className="text-sm text-gray-900 dark:text-white mb-3">
                {content.message}
              </p>
              <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                {content.products.slice(0, 3).map((product) => (
                  <div key={product.id} className="bg-white dark:bg-gray-800 rounded-lg p-3 border">
                    <div className="flex space-x-3">
                      <img
                        src={product.images[0] || '/placeholder-product.jpg'}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {product.name}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          ₹{product.price.toLocaleString()}
                        </p>
                        <div className="flex items-center mt-1">
                          <span className="text-xs text-yellow-500">★</span>
                          <span className="text-xs text-gray-500 ml-1">
                            {product.avgRating.toFixed(1)}
                          </span>
                        </div>
                        <button className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700">
                          View Product
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {content.products.length > 3 && (
                <p className="text-xs text-gray-500 mt-2">
                  +{content.products.length - 3} more products available
                </p>
              )}
            </div>
          )}

          {content.type === 'order_status' && (
            <div>
              <p className="text-sm text-gray-900 dark:text-white mb-3">
                {content.message}
              </p>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium">Order #{content.order.orderNumber}</span>
                  <span className="text-sm text-green-600">₹{content.order.totalAmount}</span>
                </div>
                <div className="text-xs text-gray-500">
                  Status: {content.order.status.replace('_', ' ')}
                </div>
                {content.order.trackingNumber && (
                  <div className="text-xs text-gray-500 mt-1">
                    Tracking: {content.order.trackingNumber}
                  </div>
                )}
              </div>
            </div>
          )}

          {content.type === 'faq' && (
            <div>
              <p className="text-sm text-gray-900 dark:text-white">
                {content.message}
              </p>
              <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                Category: {content.category}
              </div>
            </div>
          )}

          {content.type === 'product_comparison' && (
            <div>
              <p className="text-sm text-gray-900 dark:text-white mb-3">
                {content.message}
              </p>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border max-h-64 overflow-y-auto">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Product Comparison
                </h4>
                {content.comparison?.products?.slice(0, 2).map((product, index) => (
                  <div key={product.id} className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {product.name}
                        </p>
                        <p className="text-sm text-green-600">₹{product.price.toLocaleString()}</p>
                        <div className="flex items-center mt-1">
                          <span className="text-xs text-yellow-500">★</span>
                          <span className="text-xs text-gray-500 ml-1">{product.rating}/5</span>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        index === 0 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {index === 0 ? 'Recommended' : 'Alternative'}
                      </span>
                    </div>
                    {product.pros && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          ✓ {product.pros.slice(0, 2).join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
                {content.comparison?.recommendation && (
                  <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <p className="text-xs text-blue-800 dark:text-blue-200">
                      💡 {content.comparison.recommendation.reason}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {content.type === 'recommendations' && (
            <div>
              <p className="text-sm text-gray-900 dark:text-white mb-3">
                {content.message}
              </p>
              <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                {content.recommendations?.slice(0, 3).map((product) => (
                  <div key={product.id} className="bg-white dark:bg-gray-800 rounded-lg p-3 border">
                    <div className="flex space-x-3">
                      <img
                        src={product.images?.[0] || '/placeholder-product.jpg'}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {product.name}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          ₹{product.price.toLocaleString()}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center">
                            <span className="text-xs text-yellow-500">★</span>
                            <span className="text-xs text-gray-500 ml-1">
                              {product.avgRating.toFixed(1)}
                            </span>
                          </div>
                          {product.personalizedScore > 3 && (
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                              Perfect Match
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {content.reasoning && (
                <div className="mt-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                  <p className="text-xs text-purple-800 dark:text-purple-200">
                    🎯 {content.reasoning}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Proactive Suggestions */}
          {content.proactiveSuggestions && content.proactiveSuggestions.length > 0 && (
            <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <p className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-2">
                💡 I noticed you might be interested in:
              </p>
              <div className="space-y-1">
                {content.proactiveSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickReply(suggestion.message)}
                    className="block w-full text-left text-xs bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-300 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                  >
                    {suggestion.message}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Replies */}
          {content.quickReplies && content.quickReplies.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {content.quickReplies.map((reply, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickReply(reply)}
                  className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-4 rounded-full shadow-lg transition-all duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={isOpen ? { rotate: 180 } : { rotate: 0 }}
      >
        {isOpen ? (
          <XMarkIcon className="w-6 h-6" />
        ) : (
          <ChatBubbleLeftRightIcon className="w-6 h-6" />
        )}
        
        {/* Notification dot */}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 right-6 z-40 w-96 h-[500px] bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <SparklesIcon className="w-5 h-5" />
                  <div>
                    <span className="font-medium">Shopping Assistant</span>
                    <div className="text-xs opacity-90">AI-powered support</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={clearChat}
                    className="text-white/80 hover:text-white text-xs"
                    title="Clear chat"
                  >
                    Clear
                  </button>
                  <button
                    onClick={toggleChat}
                    className="text-white hover:text-gray-200"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <SparklesIcon className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    Hi! I'm your AI shopping assistant. I can help you:
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center space-x-2 text-gray-500">
                      <ShoppingBagIcon className="w-4 h-4" />
                      <span>Find products</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-500">
                      <TruckIcon className="w-4 h-4" />
                      <span>Track orders</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-500">
                      <QuestionMarkCircleIcon className="w-4 h-4" />
                      <span>Answer FAQs</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-500">
                      <SparklesIcon className="w-4 h-4" />
                      <span>Get support</span>
                    </div>
                  </div>
                </div>
              )}
              
              {messages.map((message) => (
                <div key={message.id}>
                  {renderMessage(message)}
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start mb-4">
                  <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions (when no messages) */}
            {messages.length === 0 && (
              <div className="px-4 py-2 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "Gaming laptops under ₹70000",
                    "Track my order",
                    "Return policy",
                    "Best phones"
                  ].map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickReply(action)}
                      className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-left"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask me anything..."
                  disabled={isLoading}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
                >
                  <PaperAirplaneIcon className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LiveChat;