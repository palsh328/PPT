import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const useSmartSearch = () => {
  const [searchHistory, setSearchHistory] = useState([]);
  const [popularSearches, setPopularSearches] = useState([]);

  useEffect(() => {
    loadSearchHistory();
    loadPopularSearches();
  }, []);

  const loadSearchHistory = () => {
    try {
      const saved = localStorage.getItem('searchHistory');
      if (saved) {
        setSearchHistory(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
  };

  const loadPopularSearches = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/search/popular`);
      if (response.data.success) {
        setPopularSearches(response.data.data.popular || []);
      }
    } catch (error) {
      console.error('Failed to load popular searches:', error);
    }
  };

  const addToSearchHistory = useCallback((searchTerm, resultCount = 0) => {
    try {
      const newSearch = {
        term: searchTerm.trim(),
        timestamp: new Date().toISOString(),
        resultCount
      };

      const updated = [
        newSearch,
        ...searchHistory.filter(s => s.term !== searchTerm.trim())
      ].slice(0, 10); // Keep last 10 searches

      setSearchHistory(updated);
      localStorage.setItem('searchHistory', JSON.stringify(updated));

      // Track search analytics
      trackSearch(searchTerm, resultCount);
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  }, [searchHistory]);

  const trackSearch = async (searchTerm, resultCount) => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/search/track`, {
        searchTerm,
        resultCount,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to track search:', error);
    }
  };

  const clearSearchHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  }, []);

  const getSearchSuggestions = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      return [];
    }

    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/search/suggestions?q=${encodeURIComponent(query)}`);
      return response.data.data?.suggestions || [];
    } catch (error) {
      console.error('Failed to get suggestions:', error);
      return [];
    }
  }, []);

  const smartSearch = useCallback(async (query, options = {}) => {
    const { 
      limit = 10, 
      category = null, 
      priceRange = null,
      sortBy = 'relevance'
    } = options;

    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL}/products/smart-search?q=${encodeURIComponent(query)}&limit=${limit}`;
      
      if (category) url += `&category=${category}`;
      if (priceRange) url += `&minPrice=${priceRange.min}&maxPrice=${priceRange.max}`;
      if (sortBy !== 'relevance') url += `&sortBy=${sortBy}`;

      const response = await axios.get(url);
      const results = response.data.data?.products || [];
      
      // Add to search history
      addToSearchHistory(query, results.length);
      
      return {
        products: results,
        totalFound: response.data.data?.totalFound || 0,
        searchTerm: query
      };
    } catch (error) {
      console.error('Smart search failed:', error);
      return {
        products: [],
        totalFound: 0,
        searchTerm: query,
        error: error.message
      };
    }
  }, [addToSearchHistory]);

  return {
    searchHistory,
    popularSearches,
    addToSearchHistory,
    clearSearchHistory,
    getSearchSuggestions,
    smartSearch,
    loadPopularSearches
  };
};