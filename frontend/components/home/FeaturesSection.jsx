'use client';

import { motion } from 'framer-motion';
import {
  TruckIcon,
  ShieldCheckIcon,
  CurrencyRupeeIcon,
  ChatBubbleLeftRightIcon,
  GiftIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const FeaturesSection = () => {
  const features = [
    {
      icon: TruckIcon,
      title: 'Free Shipping',
      description: 'Free delivery on orders above ₹500',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Secure Payments',
      description: '100% secure payment processing',
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      icon: CurrencyRupeeIcon,
      title: 'Best Prices',
      description: 'Competitive prices guaranteed',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: '24/7 Support',
      description: 'Round the clock customer support',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    },
    {
      icon: GiftIcon,
      title: 'Easy Returns',
      description: '7-day hassle-free returns',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50 dark:bg-pink-900/20'
    },
    {
      icon: ClockIcon,
      title: 'Quick Delivery',
      description: 'Same day delivery in select cities',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20'
    }
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Why Choose PulsePixelTech?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            We're committed to providing you with the best shopping experience for all your tech needs
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
              >
                <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                50K+
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Happy Customers
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                1000+
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Products
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                99.9%
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Uptime
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                24/7
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Support
              </div>
            </div>
          </div>
        </motion.div>

        {/* Brand Logos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <h3 className="text-center text-lg font-semibold text-gray-900 dark:text-white mb-8">
            Trusted by leading brands
          </h3>
          
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60 dark:opacity-40">
            {['Apple', 'Samsung', 'Dell', 'HP', 'Sony', 'Lenovo', 'Asus', 'OnePlus'].map((brand) => (
              <div
                key={brand}
                className="text-2xl font-bold text-gray-600 dark:text-gray-400 hover:opacity-100 transition-opacity duration-200"
              >
                {brand}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;