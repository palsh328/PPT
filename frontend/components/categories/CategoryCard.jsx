'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

const CategoryCard = ({ category }) => {
  return (
    <Link href={`/products?category=${category.slug}`}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300"
      >
        {/* Category Image */}
        <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600">
          {category.image ? (
            <Image
              src={category.image}
              alt={category.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-4xl opacity-50">
                {getCategoryIcon(category.slug)}
              </div>
            </div>
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Product Count Badge */}
          {category.productCount > 0 && (
            <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-900 dark:text-white px-2 py-1 rounded-full text-xs font-medium">
              {category.productCount} items
            </div>
          )}
        </div>

        {/* Category Info */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
            {category.name}
          </h3>
          
          {category.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
              {category.description}
            </p>
          )}
          
          <div className="mt-3 flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-200">
            <span>Shop Now</span>
            <svg className="ml-1 w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

// Helper function to get category icons
const getCategoryIcon = (slug) => {
  const icons = {
    laptops: '💻',
    smartphones: '📱',
    tablets: '📱',
    audio: '🎧',
    accessories: '🔌',
    gaming: '🎮',
    cameras: '📷',
    wearables: '⌚',
    storage: '💾',
    networking: '📡'
  };
  
  return icons[slug] || '📦';
};

export default CategoryCard;