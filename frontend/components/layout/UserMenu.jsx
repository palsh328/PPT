'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  UserIcon,
  ShoppingBagIcon,
  HeartIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/app/providers';

const UserMenu = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    router.push('/');
  };

  const getDashboardLink = () => {
    switch (user?.role) {
      case 'ADMIN':
        return '/admin';
      case 'SELLER':
        return '/seller';
      case 'DELIVERY':
        return '/delivery';
      default:
        return '/profile';
    }
  };

  const getDashboardLabel = () => {
    switch (user?.role) {
      case 'ADMIN':
        return 'Admin Dashboard';
      case 'SELLER':
        return 'Seller Dashboard';
      case 'DELIVERY':
        return 'Delivery Dashboard';
      default:
        return 'My Profile';
    }
  };

  const menuItems = [
    {
      icon: UserIcon,
      label: getDashboardLabel(),
      href: getDashboardLink(),
      description: user?.role === 'CUSTOMER' ? 'Manage your account' : `${user?.role} dashboard`
    },
    ...(user?.role === 'CUSTOMER' ? [
      {
        icon: ShoppingBagIcon,
        label: 'My Orders',
        href: '/orders',
        description: 'Track your orders'
      },
      {
        icon: HeartIcon,
        label: 'Wishlist',
        href: '/wishlist',
        description: 'Your saved items'
      }
    ] : []),
    {
      icon: CogIcon,
      label: 'Settings',
      href: '/settings',
      description: 'Account preferences'
    }
  ];

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* User Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
      >
        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
          {getInitials(user?.firstName, user?.lastName)}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {user?.role || 'Customer'}
          </p>
        </div>
        <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.1 }}
            className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50"
          >
            {/* User Info Header */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                  {getInitials(user?.firstName, user?.lastName)}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.label}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.description}
                      </p>
                    </div>
                  </Link>
                );
              })}

              {/* Admin Dashboard Link */}
              {user?.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 border-t border-gray-200 dark:border-gray-700"
                >
                  <CogIcon className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                      Admin Dashboard
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Manage store
                    </p>
                  </div>
                </Link>
              )}
            </div>

            {/* Logout */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 w-full px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 text-red-600 dark:text-red-400"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                <div className="text-left">
                  <p className="text-sm font-medium">Sign Out</p>
                  <p className="text-xs opacity-75">Log out of your account</p>
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu;