'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

import { useTheme } from 'next-themes';
import {
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  HeartIcon,
  Bars3Icon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';
import { useAuth, useCart } from '@/app/providers';
import SearchModal from './SearchModal';
import UserMenu from './UserMenu';

const Header = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, user } = useAuth();
  const { getCartSummary } = useCart();


  const cartSummary = getCartSummary();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Role-based navigation
  const getNavigation = () => {
    if (user?.role === 'SELLER') {
      return [
        { name: 'Home', href: '/seller' },
        { name: 'Orders', href: '/seller/orders' },
        { name: 'Support', href: '/support' }
      ];
    }
    
    if (user?.role === 'ADMIN') {
      return [
        { name: 'Home', href: '/admin' },
        { name: 'Orders', href: '/admin/orders' },
        { name: 'Users', href: '/admin/users' },
        { name: 'Support', href: '/support' }
      ];
    }
    
    // Default customer navigation
    return [
      { name: 'Home', href: '/' },
      { name: 'Search', href: '/search' },
      { name: 'Categories', href: '/categories' },
      { name: 'Deals', href: '/deals' },
      { name: 'Support', href: '/support' }
    ];
  };

  const navigation = getNavigation();

  const themeIcons = {
    light: SunIcon,
    dark: MoonIcon,
    system: ComputerDesktopIcon
  };

  const cycleTheme = () => {
    const themes = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const ThemeIcon = themeIcons[theme] || SunIcon;

  return (
    <>
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg' 
          : 'bg-white dark:bg-gray-900'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Role-based home link - TOP LEFT */}
            <Link 
              href={user?.role === 'SELLER' ? '/seller' : user?.role === 'ADMIN' ? '/admin' : '/'} 
              className="flex items-center space-x-3"
            >
              <div className="w-10 h-10 relative">
                <Image
                  src="/logo.svg"
                  alt="PulsePixelTech Logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xl font-bold text-[#2c5282] dark:text-white hidden sm:block">
                PulsePixelTech
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-200"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Search - Only show for customers */}
              {(!user || user?.role === 'CUSTOMER') && (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                  aria-label="Search"
                >
                  <MagnifyingGlassIcon className="w-6 h-6" />
                </button>
              )}

              {/* Theme Toggle */}
              <button
                onClick={cycleTheme}
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                aria-label="Toggle theme"
              >
                <ThemeIcon className="w-6 h-6" />
              </button>

              {isAuthenticated ? (
                <>
                  {/* Wishlist - Only show for customers */}
                  {user?.role === 'CUSTOMER' && (
                    <Link
                      href="/wishlist"
                      className="p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                      aria-label="Wishlist"
                    >
                      <HeartIcon className="w-6 h-6" />
                    </Link>
                  )}

                  {/* Cart - Only show for customers */}
                  {user?.role === 'CUSTOMER' && (
                    <Link
                      href="/cart"
                      className="relative p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                      aria-label="Shopping cart"
                    >
                      <ShoppingCartIcon className="w-6 h-6" />
                      {cartSummary.totalQuantity > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium"
                        >
                          {cartSummary.totalQuantity > 99 ? '99+' : cartSummary.totalQuantity}
                        </motion.span>
                      )}
                    </Link>
                  )}

                  {/* User Menu */}
                  <UserMenu user={user} />
                </>
              ) : (
                <div className="hidden sm:flex items-center space-x-3">
                  <Link
                    href="/auth/login"
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-200"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="px-4 py-4 space-y-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                
                {!isAuthenticated && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                    <Link
                      href="/auth/login"
                      className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/auth/register"
                      className="block bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 text-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Search Modal */}
      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </>
  );
};

export default Header;