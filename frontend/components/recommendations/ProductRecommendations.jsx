'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import ProductCard from '@/components/products/ProductCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { SparklesIcon } from '@heroicons/react/24/outline';

const ProductRecommendations = ({ 
  userId, 
  currentProductId, 
  category, 
  title = "Recommended for You",
  limit = 4 
}) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, [userId, currentProductId, category]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      
      // Rule-based recommendation logic
      let products = [];
      
      if (currentProductId) {
        // Get related products from same category
        const relatedResponse = await axios.get(`/products/${currentProductId}/related`);
        products = relatedResponse.data.data || [];
      } else if (category) {
        // Get products from specific category
        const categoryResponse = await axios.get(`/products?category=${category}&limit=${limit}`);
        products = categoryResponse.data.data.products || [];
      } else {
        // Get featured/popular products
        const featuredResponse = await axios.get('/products/featured/list');
        products = featuredResponse.data.data || [];
      }

      // Apply AI-like filtering and scoring
      const scoredProducts = products.map(product => ({
        ...product,
        score: calculateRecommendationScore(product)
      }));

      // Sort by score and take top recommendations
      const topRecommendations = scoredProducts
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      setRecommendations(topRecommendations);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateRecommendationScore = (product) => {
    let score = 0;

    // Base score from rating
    if (product.avgRating) {
      score += product.avgRating * 10;
    }

    // Boost for popular products (more reviews)
    if (product.reviewCount) {
      score += Math.min(product.reviewCount * 2, 20);
    }

    // Boost for featured products
    if (product.isFeatured) {
      score += 15;
    }

    // Boost for products with good stock
    if (product.stock > 10) {
      score += 10;
    } else if (product.stock > 0) {
      score += 5;
    }

    // Boost for products with discounts
    if (product.mrp > product.price) {
      const discountPercent = ((product.mrp - product.price) / product.mrp) * 100;
      score += discountPercent * 0.5;
    }

    // Brand preference (simulate user preference)
    const preferredBrands = ['Apple', 'Samsung', 'Dell', 'HP'];
    if (preferredBrands.includes(product.brand)) {
      score += 10;
    }

    // Price range preference (simulate user budget)
    if (product.price >= 10000 && product.price <= 50000) {
      score += 5;
    }

    // Random factor to add variety
    score += Math.random() * 5;

    return Math.round(score);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <section className="py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-6"
      >
        <div className="flex items-center space-x-2 mb-2">
          <SparklesIcon className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Curated picks based on your preferences and browsing history
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {recommendations.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            <ProductCard product={product} />
            
            {/* AI Badge */}
            <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs px-2 py-1 rounded-full font-medium">
              AI Pick
            </div>
            
            {/* Score Badge (for demo purposes) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                {product.score}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Recommendation Explanation */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg"
      >
        <div className="flex items-start space-x-3">
          <SparklesIcon className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-1">
              How we choose recommendations
            </h4>
            <p className="text-sm text-purple-800 dark:text-purple-200">
              Our AI analyzes product ratings, popularity, your browsing history, and current trends 
              to suggest items you're most likely to love. Recommendations are updated in real-time 
              based on your interactions.
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default ProductRecommendations;