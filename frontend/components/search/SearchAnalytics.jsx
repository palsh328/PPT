'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  FireIcon, 
  ClockIcon,
  EyeIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { useSmartSearch } from '@/hooks/useSmartSearch';

const SearchAnalytics = ({ className = "" }) => {
  const [analytics, setAnalytics] = useState({
    topSearches: [],
    recentTrends: [],
    searchVolume: 0
  });
  const { searchHistory, popularSearches } = useSmartSearch();

  useEffect(() => {
    generateAnalytics();
  }, [searchHistory, popularSearches]);

  const generateAnalytics = () => {
    // Generate search frequency map
    const searchFrequency = {};
    searchHistory.forEach(search => {
      searchFrequency[search.term] = (searchFrequency[search.term] || 0) + 1;
    });

    // Get top searches
    const topSearches = Object.entries(searchFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([term, count]) => ({ term, count }));

    // Calculate trends (mock data for demo)
    const recentTrends = [
      { term: 'iPhone 15', change: '+25%', direction: 'up' },
      { term: 'Gaming Laptop', change: '+18%', direction: 'up' },
      { term: 'Smart Watch', change: '+12%', direction: 'up' },
      { term: 'Headphones', change: '-5%', direction: 'down' }
    ];

    setAnalytics({
      topSearches,
      recentTrends,
      searchVolume: searchHistory.length
    });
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <div className="flex items-center space-x-2 mb-6">
        <ChartBarIcon className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Search Analytics
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Search Volume */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Searches</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {analytics.searchVolume}
              </p>
            </div>
            <MagnifyingGlassIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        {/* Popular Searches */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <EyeIcon className="w-4 h-4 text-gray-500" />
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Most Searched
            </h4>
          </div>
          <div className="space-y-2">
            {analytics.topSearches.slice(0, 3).map((search, index) => (
              <div key={search.term} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {index + 1}. {search.term}
                </span>
                <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {search.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Trending Searches */}
        <div className="md:col-span-2">
          <div className="flex items-center space-x-2 mb-3">
            <FireIcon className="w-4 h-4 text-green-500" />
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Trending Now
            </h4>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {analytics.recentTrends.map((trend, index) => (
              <motion.div
                key={trend.term}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                  {trend.term}
                </span>
                <span className={`text-xs font-medium ${
                  trend.direction === 'up' 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {trend.change}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="md:col-span-2">
          <div className="flex items-center space-x-2 mb-3">
            <ClockIcon className="w-4 h-4 text-gray-500" />
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Recent Activity
            </h4>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {searchHistory.slice(0, 5).map((search, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400 truncate">
                  {search.term}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(search.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchAnalytics;