'use client';

import { useState } from 'react';
import axios from 'axios';

const SearchTest = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testEndpoints = async () => {
    setLoading(true);
    const results = {};

    try {
      // Test search suggestions
      const suggestionsRes = await axios.get('/api/search/suggestions?q=iphone');
      results.suggestions = {
        status: suggestionsRes.status === 200 ? 'SUCCESS' : 'FAILED',
        data: suggestionsRes.data
      };
    } catch (error) {
      results.suggestions = {
        status: 'FAILED',
        error: error.message
      };
    }

    try {
      // Test popular searches
      const popularRes = await axios.get('/api/search/popular');
      results.popular = {
        status: popularRes.status === 200 ? 'SUCCESS' : 'FAILED',
        data: popularRes.data
      };
    } catch (error) {
      results.popular = {
        status: 'FAILED',
        error: error.message
      };
    }

    try {
      // Test smart search
      const smartSearchRes = await axios.get('/api/products/smart-search?q=laptop');
      results.smartSearch = {
        status: smartSearchRes.status === 200 ? 'SUCCESS' : 'FAILED',
        data: smartSearchRes.data
      };
    } catch (error) {
      results.smartSearch = {
        status: 'FAILED',
        error: error.message
      };
    }

    setTestResults(results);
    setLoading(false);
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Smart Search API Test
      </h3>
      
      <button
        onClick={testEndpoints}
        disabled={loading}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Endpoints'}
      </button>

      {Object.keys(testResults).length > 0 && (
        <div className="space-y-4">
          {Object.entries(testResults).map(([endpoint, result]) => (
            <div key={endpoint} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {endpoint.charAt(0).toUpperCase() + endpoint.slice(1)}
                </h4>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  result.status === 'SUCCESS' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  {result.status}
                </span>
              </div>
              <pre className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-auto">
                {JSON.stringify(result.data || result.error, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchTest;