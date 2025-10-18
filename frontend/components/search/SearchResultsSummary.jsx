'use client';

import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  SparklesIcon, 
  ClockIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';

const SearchResultsSummary = ({ 
  searchTerm, 
  totalResults, 
  searchTime, 
  suggestions = [], 
  onClearSearch,
  onSearchSuggestion 
}) => {
  if (!searchTerm) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <MagnifyingGlassIcon className="w-5 h-5 text-blue-500" />
          <h3 className="font-medium text-gray-900 dark:text-white">
            Search Results for "{searchTerm}"
          </h3>
        </div>
        <button
          onClick={onClearSearch}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-label="Clear search"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
        <span>
          <strong className="text-gray-900 dark:text-white">{totalResults.toLocaleString()}</strong> products found
        </span>
        {searchTime && (
          <span>
            in <strong>{searchTime}ms</strong>
          </span>
        )}
      </div>

      {/* Smart Suggestions */}
      {suggestions.length > 0 && (
        <div>
          <div className="flex items-center space-x-1 mb-2">
            <SparklesIcon className="w-4 h-4 text-purple-500" />
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Did you mean?
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.slice(0, 3).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => onSearchSuggestion(suggestion)}
                className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Tips */}
      {totalResults === 0 && (
        <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
            No results found. Try:
          </h4>
          <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
            <li>• Check your spelling</li>
            <li>• Use more general terms</li>
            <li>• Try different keywords</li>
            <li>• Browse categories instead</li>
          </ul>
        </div>
      )}
    </motion.div>
  );
};

export default SearchResultsSummary;