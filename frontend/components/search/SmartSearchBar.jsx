'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  SparklesIcon,
  ClockIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { useSmartSearch } from '@/hooks/useSmartSearch';
import { useDebounce } from '@/hooks/useDebounce';

const SmartSearchBar = ({ 
  placeholder = "Search for products...", 
  className = "",
  showSuggestions = true,
  onSearch = null 
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const router = useRouter();
  
  const { 
    searchHistory, 
    popularSearches, 
    getSearchSuggestions, 
    addToSearchHistory 
  } = useSmartSearch();
  
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.trim() && showSuggestions) {
      fetchSuggestions(debouncedQuery);
    } else {
      setSuggestions([]);
    }
  }, [debouncedQuery, showSuggestions]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (searchTerm) => {
    try {
      setLoading(true);
      const results = await getSearchSuggestions(searchTerm);
      setSuggestions(results);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm) => {
    const term = searchTerm.trim();
    if (!term) return;

    addToSearchHistory(term);
    setShowDropdown(false);
    setQuery('');
    
    if (onSearch) {
      onSearch(term);
    } else {
      router.push(`/products?search=${encodeURIComponent(term)}`);
    }
  };

  const handleKeyDown = (e) => {
    const totalItems = suggestions.length + searchHistory.slice(0, 3).length;
    
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
      } else if (selectedIndex < suggestions.length) {
        handleSearch(suggestions[selectedIndex]);
      } else {
        const historyIndex = selectedIndex - suggestions.length;
        const historyItem = searchHistory[historyIndex];
        if (historyItem) {
          handleSearch(historyItem.term);
        }
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      inputRef.current?.blur();
    } else {
      setSelectedIndex(-1);
    }
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setShowDropdown(true);
  };

  const handleFocus = () => {
    setShowDropdown(true);
  };

  const clearQuery = () => {
    setQuery('');
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={placeholder}
          className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        />
        
        {query && (
          <button
            onClick={clearQuery}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
          </button>
        )}
      </div>

      {/* Smart Suggestions Dropdown */}
      <AnimatePresence>
        {showDropdown && showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-80 overflow-y-auto"
          >
            {loading ? (
              <div className="p-4 text-center">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Searching...</p>
              </div>
            ) : (
              <div className="py-2">
                {/* Auto-complete Suggestions */}
                {suggestions.length > 0 && (
                  <div className="px-4 py-2">
                    <div className="flex items-center mb-2">
                      <SparklesIcon className="w-4 h-4 text-blue-500 mr-2" />
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Suggestions
                      </span>
                    </div>
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearch(suggestion)}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
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
                )}

                {/* Recent Searches */}
                {!query.trim() && searchHistory.length > 0 && (
                  <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center mb-2">
                      <ClockIcon className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Recent
                      </span>
                    </div>
                    {searchHistory.slice(0, 3).map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearch(search.term)}
                        className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <ClockIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {search.term}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">
                            {search.resultCount} results
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Popular/Trending Searches */}
                {!query.trim() && popularSearches.length > 0 && (
                  <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center mb-2">
                      <FireIcon className="w-4 h-4 text-orange-500 mr-2" />
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Trending
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {popularSearches.slice(0, 4).map((item, index) => (
                        <button
                          key={index}
                          onClick={() => handleSearch(item.term)}
                          className="text-left px-3 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                              {item.term}
                            </span>
                            <span className="text-xs text-green-500 font-medium ml-2">
                              {item.trend}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* No suggestions message */}
                {query.trim() && suggestions.length === 0 && !loading && (
                  <div className="px-4 py-6 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No suggestions found. Press Enter to search for "{query}"
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SmartSearchBar;