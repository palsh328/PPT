'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import {
  ClockIcon,
  FireIcon,
  TagIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const DealsPage = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({});

  // Mock deals data - replace with API call
  const mockDeals = [
    {
      id: 1,
      title: "MacBook Pro M3 - Limited Time Offer",
      originalPrice: 2499,
      salePrice: 1999,
      discount: 20,
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop&crop=center",
      rating: 4.8,
      reviews: 156,
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      category: "Laptops",
      slug: "macbook-pro-m3"
    },
    {
      id: 2,
      title: "iPhone 15 Pro - Flash Sale",
      originalPrice: 1199,
      salePrice: 999,
      discount: 17,
      image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop&crop=center",
      rating: 4.9,
      reviews: 89,
      endTime: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
      category: "Smartphones",
      slug: "iphone-15-pro"
    },
    {
      id: 3,
      title: "Samsung 4K Smart TV - Weekend Deal",
      originalPrice: 899,
      salePrice: 649,
      discount: 28,
      image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=300&fit=crop&crop=center",
      rating: 4.6,
      reviews: 234,
      endTime: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours from now
      category: "TVs",
      slug: "samsung-4k-smart-tv"
    },
    {
      id: 4,
      title: "AirPods Pro 2 - Special Offer",
      originalPrice: 249,
      salePrice: 199,
      discount: 20,
      image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=300&fit=crop&crop=center",
      rating: 4.7,
      reviews: 445,
      endTime: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
      category: "Audio",
      slug: "airpods-pro-2"
    },
    {
      id: 5,
      title: "Gaming Laptop RTX 4070 - Flash Deal",
      originalPrice: 1899,
      salePrice: 1499,
      discount: 21,
      image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&h=300&fit=crop&crop=center",
      rating: 4.5,
      reviews: 78,
      endTime: new Date(Date.now() + 18 * 60 * 60 * 1000), // 18 hours from now
      category: "Gaming",
      slug: "gaming-laptop-rtx-4070"
    },
    {
      id: 6,
      title: "Wireless Headphones - Best Price",
      originalPrice: 299,
      salePrice: 199,
      discount: 33,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop&crop=center",
      rating: 4.4,
      reviews: 312,
      endTime: new Date(Date.now() + 36 * 60 * 60 * 1000), // 36 hours from now
      category: "Audio",
      slug: "wireless-headphones"
    },
    {
      id: 7,
      title: "Smart Watch Series 9 - Limited Stock",
      originalPrice: 399,
      salePrice: 299,
      discount: 25,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop&crop=center",
      rating: 4.6,
      reviews: 189,
      endTime: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now
      category: "Wearables",
      slug: "smart-watch-series-9"
    },
    {
      id: 8,
      title: "4K Webcam Pro - Work From Home",
      originalPrice: 199,
      salePrice: 149,
      discount: 25,
      image: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&h=300&fit=crop&crop=center",
      rating: 4.3,
      reviews: 156,
      endTime: new Date(Date.now() + 72 * 60 * 60 * 1000), // 72 hours from now
      category: "Accessories",
      slug: "4k-webcam-pro"
    }
  ];

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/products/deals');
      
      if (response.data.success) {
        // If no real deals, show mock deals for demo
        setDeals(response.data.data.length > 0 ? response.data.data : mockDeals);
      } else {
        setDeals(mockDeals);
      }
    } catch (error) {
      console.error('Failed to fetch deals:', error);
      setDeals(mockDeals);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = {};
      deals.forEach(deal => {
        const now = new Date().getTime();
        const endTime = new Date(deal.endTime).getTime();
        const difference = endTime - now;

        if (difference > 0) {
          newTimeLeft[deal.id] = {
            hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((difference % (1000 * 60)) / 1000)
          };
        }
      });
      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(timer);
  }, [deals]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <StarIconSolid key={i} className="w-4 h-4 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <StarIcon className="w-4 h-4 text-yellow-400" />
          <StarIconSolid className="w-4 h-4 text-yellow-400 absolute top-0 left-0" style={{ clipPath: 'inset(0 50% 0 0)' }} />
        </div>
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <StarIcon key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
      );
    }

    return stars;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <div className="h-48 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center mb-4"
          >
            <FireIcon className="w-8 h-8 text-red-500 mr-2" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Hot Deals
            </h1>
            <FireIcon className="w-8 h-8 text-red-500 ml-2" />
          </motion.div>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Limited time offers on your favorite tech products
          </p>
        </div>

        {/* Deals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {deals.map((deal, index) => (
            <motion.div
              key={deal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full"
            >
              {/* Deal Badge */}
              <div className="relative">
                <div className="absolute top-2 left-2 z-10">
                  <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm font-bold">
                    -{deal.discount}%
                  </span>
                </div>
                <div className="absolute top-2 right-2 z-10">
                  <span className="bg-black/50 text-white px-2 py-1 rounded text-xs">
                    {deal.category}
                  </span>
                </div>
                
                {/* Product Image */}
                <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-700">
                  <Image
                    src={deal.image || deal.images?.[0] || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgMTI1SDIyNVYxNzVIMTc1VjEyNVoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+'}
                    alt={deal.title || deal.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgMTI1SDIyNVYxNzVIMTc1VjEyNVoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                    }}
                  />
                </div>
              </div>

              <div className="p-4 flex flex-col flex-grow">
                {/* Timer */}
                {timeLeft[deal.id] && (
                  <div className="flex items-center justify-center mb-3 p-2 bg-red-50 dark:bg-red-900/20 rounded">
                    <ClockIcon className="w-4 h-4 text-red-500 mr-1" />
                    <span className="text-red-600 dark:text-red-400 text-sm font-medium">
                      {timeLeft[deal.id].hours}h {timeLeft[deal.id].minutes}m {timeLeft[deal.id].seconds}s left
                    </span>
                  </div>
                )}

                {/* Product Title */}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 overflow-hidden" style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}>
                  {deal.title || deal.name}
                </h3>

                {/* Rating */}
                <div className="flex items-center mb-3">
                  <div className="flex items-center">
                    {renderStars(deal.rating || deal.avgRating || 0)}
                  </div>
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    ({deal.reviews || deal.reviewCount || 0})
                  </span>
                </div>

                {/* Pricing */}
                <div className="mb-4 flex-grow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex flex-col">
                      <span className="text-xl font-bold text-green-600 dark:text-green-400">
                        {formatPrice(deal.salePrice || deal.dealPrice)}
                      </span>
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(deal.originalPrice || deal.price)}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-green-600 dark:text-green-400">
                        <TagIcon className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">
                          Save {formatPrice((deal.originalPrice || deal.price) - (deal.salePrice || deal.dealPrice))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Button - Always at bottom */}
                <div className="mt-auto">
                  <Link
                    href={`/products/${deal.slug}`}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 text-center block"
                  >
                    View Deal
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>


      </div>
      <Footer />
    </div>
  );
};

export default DealsPage;