'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  ClockIcon,
  TagIcon,
  SparklesIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { useDebounce } from '@/hooks/useDebounce';

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchType, setSearchType] = useState('all'); // 'all', 'products', 'categories'
  const inputRef = useRef(null);
  const router = useRouter();

  const debouncedQuery = useDebounce(query, 200);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      loadRecentSearches();
    }
  }, [isOpen]);

  useEffect(() => {
    if (debouncedQuery.trim()) {
      performSmartSearch(debouncedQuery);
    } else {
      setResults([]);
      setSuggestions([]);
      setCategories([]);
    }
  }, [debouncedQuery]);

  const loadRecentSearches = () => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  };

  const saveRecentSearch = (searchTerm) => {
    const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const performSmartSearch = async (searchTerm) => {
    try {
      setLoading(true);
      
      // Parallel requests for better performance
      const [productsResponse, suggestionsResponse, categoriesResponse] = await Promise.allSettled([
        // Search products with typo tolerance
        axios.get(`/products/smart-search?q=${encodeURIComponent(searchTerm)}&limit=6`),
        // Get search suggestions
        axios.get(`/search/suggestions?q=${encodeURIComponent(searchTerm)}&limit=5`),
        // Search categories
        axios.get(`/categories/search?q=${encodeURIComponent(searchTerm)}&limit=3`)
      ]);

      // Handle products
      if (productsResponse.status === 'fulfilled') {
        setResults(productsResponse.value.data.data?.products || []);
      } else {
        // Fallback to regular search
        const fallbackResponse = await axios.get(`/products?search=${encodeURIComponent(searchTerm)}&limit=6`);
        setResults(fallbackResponse.data.data?.products || []);
      }

      // Handle suggestions
      if (suggestionsResponse.status === 'fulfilled') {
        setSuggestions(suggestionsResponse.value.data.data?.suggestions || []);
      }

      // Handle categories
      if (categoriesResponse.status === 'fulfilled') {
        setCategories(categoriesResponse.value.data.data?.categories || []);
      }

    } catch (error) {
      console.error('Smart search error:', error);
      // Fallback to basic search
      try {
        const response = await axios.get(`/products?search=${encodeURIComponent(searchTerm)}&limit=6`);
        setResults(response.data.data?.products || []);
      } catch (fallbackError) {
        console.error('Fallback search error:', fallbackError);
        setResults([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm) => {
    if (searchTerm.trim()) {
      saveRecentSearch(searchTerm.trim());
      router.push(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      onClose();
      setQuery('');
    }
  };

  const handleKeyDown = (e) => {
    const totalItems = suggestions.length + results.length + categories.length;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (totalItems + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev <= 0 ? totalItems : prev - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex === -1) {
        handleSearch(query);
      } else {
        // Handle selection based on index
        if (selectedIndex < suggestions.length) {
          const suggestion = suggestions[selectedIndex];
          setQuery(suggestion);
          handleSearch(suggestion);
        } else if (selectedIndex < suggestions.length + categories.length) {
          const categoryIndex = selectedIndex - suggestions.length;
          const category = categories[categoryIndex];
          router.push(`/products?category=${category.slug}`);
          onClose();
        } else {
          const productIndex = selectedIndex - suggestions.length - categories.length;
          const product = results[productIndex];
          if (product) {
            router.push(`/products/${product.slug}`);
            onClose();
          }
        }
      }
    } else if (e.key === 'Escape') {
      onClose();
    } else {
      setSelectedIndex(-1);
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl mx-4 bg-white dark:bg-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Search Input */}
            <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 mr-3" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search for products..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none"
              />
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Searching...</span>
                </div>
              ) : query.trim() && (suggestions.length > 0 || results.length > 0 || categories.length > 0) ? (
                /* Smart Search Results */
                <div className="p-4 space-y-4">
                  {/* Search Suggestions */}
                  {suggestions.length > 0 && (
                    <div>
                      <div className="flex items-center mb-3">
                        <SparklesIcon className="w-4 h-4 text-blue-500 mr-2" />
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          Suggestions
                        </h3>
                      </div>
                      <div className="space-y-1">
                        {suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setQuery(suggestion);
                              handleSearch(suggestion);
                            }}
                            className={`w-full text-left p-2 rounded-lg transition-colors ${
                              selectedIndex === index
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {suggestion}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Categories */}
                  {categories.length > 0 && (
                    <div>
                      <div className="flex items-center mb-3">
                        <TagIcon className="w-4 h-4 text-green-500 mr-2" />
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          Categories
                        </h3>
                      </div>
                      <div className="space-y-1">
                        {categories.map((category, index) => {
                          const categoryIndex = suggestions.length + index;
                          return (
                            <Link
                              key={category.id}
                              href={`/products?category=${category.slug}`}
                              onClick={onClose}
                              className={`block p-2 rounded-lg transition-colors ${
                                selectedIndex === categoryIndex
                                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                  <TagIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {category.name}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {category.productCount || 0} products
                                  </p>
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Products */}
                  {results.length > 0 && (
                    <div>
                      <div className="flex items-center mb-3">
                        <FireIcon className="w-4 h-4 text-purple-500 mr-2" />
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          Products
                        </h3>
                      </div>
                      <div className="space-y-2">
                        {results.map((product, index) => {
                          const productIndex = suggestions.length + categories.length + index;
                          return (
                            <Link
                              key={product.id}
                              href={`/products/${product.slug}`}
                              onClick={() => {
                                handleSearch(query);
                              }}
                              className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                                selectedIndex === productIndex
                                  ? 'bg-purple-50 dark:bg-purple-900/20'
                                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                              }`}
                            >
                              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-600 rounded-lg overflow-hidden flex-shrink-0">
                                {product.images?.[0] ? (
                                  <Image
                                    src={product.images[0]}
                                    alt={product.name}
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <TagIcon className="w-6 h-6 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {product.name}
                                </p>
                                <div className="flex items-center space-x-2">
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    ₹{product.price?.toLocaleString()}
                                  </p>
                                  {product.isDeal && (
                                    <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs rounded-full">
                                      Deal
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-xs text-gray-400">
                                {product.brand}
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                      
                      {results.length === 6 && (
                        <button
                          onClick={() => handleSearch(query)}
                          className="w-full mt-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        >
                          View all results for "{query}"
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : query.trim() && !loading ? (
                /* No Results */
                <div className="p-8 text-center">
                  <div className="text-gray-400 mb-4">
                    <MagnifyingGlassIcon className="w-12 h-12 mx-auto" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 mb-2">
                    No results found for "{query}"
                  </p>
                  <p className="text-sm text-gray-400 mb-4">
                    Try different keywords or check spelling
                  </p>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleSearch(query)}
                      className="block w-full text-blue-600 dark:text-blue-400 hover:underline text-sm"
                    >
                      Search anyway
                    </button>
                    <div className="text-xs text-gray-400">
                      Suggestions: Try "laptop", "phone", or "headphones"
                    </div>
                  </div>
                </div>
              ) : (
                /* Recent Searches */
                <div className="p-4">
                  {recentSearches.length > 0 && (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          Recent Searches
                        </h3>
                        <button
                          onClick={clearRecentSearches}
                          className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          Clear all
                        </button>
                      </div>
                      <div className="space-y-2">
                        {recentSearches.map((search, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setQuery(search);
                              handleSearch(search);
                            }}
                            className="flex items-center space-x-3 w-full p-2 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <ClockIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {search}
                            </span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Popular Searches */}
                  <div className="mt-6">
                    <div className="flex items-center mb-3">
                      <FireIcon className="w-4 h-4 text-orange-500 mr-2" />
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        Trending Searches
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { term: 'iPhone 15', trend: '+12%' },
                        { term: 'MacBook Pro', trend: '+8%' },
                        { term: 'Samsung Galaxy', trend: '+15%' },
                        { term: 'AirPods', trend: '+5%' },
                        { term: 'Gaming Laptop', trend: '+20%' },
                        { term: 'Smart Watch', trend: '+10%' }
                      ].map((item) => (
                        <button
                          key={item.term}
                          onClick={() => {
                            setQuery(item.term);
                            handleSearch(item.term);
                          }}
                          className="flex items-center justify-between p-2 text-sm bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        >
                          <span>{item.term}</span>
                          <span className="text-xs text-green-500 font-medium">{item.trend}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quick Categories */}
                  <div className="mt-6">
                    <div className="flex items-center mb-3">
                      <TagIcon className="w-4 h-4 text-blue-500 mr-2" />
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        Browse Categories
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { name: 'Laptops', icon: '💻', count: '120+' },
                        { name: 'Smartphones', icon: '📱', count: '85+' },
                        { name: 'Audio', icon: '🎧', count: '65+' },
                        { name: 'Accessories', icon: '⌚', count: '200+' }
                      ].map((category) => (
                        <button
                          key={category.name}
                          onClick={() => {
                            router.push(`/products?category=${category.name.toLowerCase()}`);
                            onClose();
                          }}
                          className="flex items-center space-x-2 p-2 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                        >
                          <span className="text-base">{category.icon}</span>
                          <div className="flex-1 text-left">
                            <div className="font-medium">{category.name}</div>
                            <div className="text-xs opacity-75">{category.count} items</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;