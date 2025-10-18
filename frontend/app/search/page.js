'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SmartSearchBar from '@/components/search/SmartSearchBar';
import SearchAnalytics from '@/components/search/SearchAnalytics';
import ProductCard from '@/components/products/ProductCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useSmartSearch } from '@/hooks/useSmartSearch';
import { 
  SparklesIcon, 
  FireIcon, 
  ClockIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

export default function SearchPage() {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentSearch, setCurrentSearch] = useState('');
  const { 
    searchHistory, 
    popularSearches, 
    smartSearch, 
    clearSearchHistory 
  } = useSmartSearch();

  const handleSearch = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setCurrentSearch('');
      return;
    }

    setLoading(true);
    setCurrentSearch(searchTerm);
    
    try {
      const results = await smartSearch(searchTerm, { limit: 12 });
      setSearchResults(results.products || []);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTrendingSearch = (term) => {
    handleSearch(term);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Smart Product Search
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Discover products with AI-powered search, typo tolerance, and intelligent suggestions
            </p>
          </motion.div>

          {/* Main Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-3xl mx-auto mb-8"
          >
            <SmartSearchBar
              placeholder="Search for anything... Try 'iphone', 'gaming laptop', or 'headphones'"
              onSearch={handleSearch}
              className="text-lg"
            />
          </motion.div>

          {/* Quick Search Suggestions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-2 mb-8"
          >
            {['iPhone 15', 'MacBook Pro', 'Gaming Laptop', 'AirPods', 'Smart Watch'].map((term, index) => (
              <button
                key={term}
                onClick={() => handleSearch(term)}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {term}
              </button>
            ))}
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search Analytics */}
            <SearchAnalytics />

            {/* Popular Searches */}
            {popularSearches.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <FireIcon className="w-5 h-5 text-orange-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Trending Searches
                  </h3>
                </div>
                <div className="space-y-3">
                  {popularSearches.slice(0, 5).map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleTrendingSearch(item.term)}
                      className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.term}
                        </span>
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                          {item.trend}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {item.count} searches
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Searches */}
            {searchHistory.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="w-5 h-5 text-gray-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Recent Searches
                    </h3>
                  </div>
                  <button
                    onClick={clearSearchHistory}
                    className="text-xs text-red-600 dark:text-red-400 hover:underline"
                  >
                    Clear
                  </button>
                </div>
                <div className="space-y-2">
                  {searchHistory.slice(0, 5).map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(search.term)}
                      className="w-full text-left p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                          {search.term}
                        </span>
                        <span className="text-xs text-gray-400">
                          {search.resultCount} results
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : currentSearch ? (
              <div>
                {/* Search Results Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Search Results for "{currentSearch}"
                  </h2>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {searchResults.length} products found
                  </span>
                </div>

                {/* Results Grid */}
                {searchResults.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {searchResults.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <ProductCard product={product} />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MagnifyingGlassIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No products found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Try adjusting your search terms or browse our categories
                    </p>
                    <button
                      onClick={() => handleSearch('')}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Clear Search
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Welcome State */
              <div className="text-center py-12">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-8"
                >
                  <SparklesIcon className="w-20 h-20 text-blue-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Start Your Smart Search
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    Use the search bar above to find products with AI-powered suggestions, 
                    typo tolerance, and instant results.
                  </p>
                </motion.div>

                {/* Feature Highlights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  <div className="text-center p-6">
                    <SparklesIcon className="w-8 h-8 text-purple-500 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Smart Suggestions
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Get intelligent autocomplete suggestions as you type
                    </p>
                  </div>
                  <div className="text-center p-6">
                    <FireIcon className="w-8 h-8 text-green-500 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Typo Tolerance
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Find what you're looking for even with spelling mistakes
                    </p>
                  </div>
                  <div className="text-center p-6">
                    <MagnifyingGlassIcon className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Instant Results
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      See product previews and quick results in real-time
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}