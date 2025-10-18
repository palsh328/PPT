'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { TrashIcon, PlusIcon, MinusIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuth, useCart } from '@/app/providers';
import toast from 'react-hot-toast';

export default function CartPage() {
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const { cartItems, updateCartItem, removeFromCart, clearCart, getCartSummary } = useCart();

  const cartSummary = getCartSummary();

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setLoading(true);
    const result = await updateCartItem(itemId, newQuantity);
    if (!result.success) {
      toast.error(result.message);
    }
    setLoading(false);
  };

  const handleRemoveItem = async (itemId) => {
    setLoading(true);
    const result = await removeFromCart(itemId);
    if (result.success) {
      toast.success('Item removed from cart');
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      setLoading(true);
      const result = await clearCart();
      if (result.success) {
        toast.success('Cart cleared');
      } else {
        toast.error(result.message);
      }
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <ShoppingBagIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Please Login
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              You need to be logged in to view your cart
            </p>
            <Link
              href="/auth/login"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Login to Continue
            </Link>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Shopping Cart
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {cartSummary.itemCount} {cartSummary.itemCount === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBagIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Your cart is empty
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Looks like you haven't added any items to your cart yet
            </p>
            <Link
              href="/products"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Clear Cart Button */}
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Cart Items
                </h2>
                <button
                  onClick={handleClearCart}
                  disabled={loading}
                  className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium disabled:opacity-50"
                >
                  Clear Cart
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center space-x-4">
                      {/* Product Image */}
                      <Link href={`/products/${item.product.slug}`}>
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                          {item.product.images?.[0] && (
                            <Image
                              src={item.product.images[0]}
                              alt={item.product.name}
                              width={80}
                              height={80}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                            />
                          )}
                        </div>
                      </Link>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/products/${item.product.slug}`}
                          className="text-lg font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          {item.product.name}
                        </Link>
                        
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                            ₹{item.product.price.toLocaleString()}
                          </span>
                          {item.product.mrp > item.product.price && (
                            <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                              ₹{item.product.mrp.toLocaleString()}
                            </span>
                          )}
                        </div>

                        {/* Stock Status */}
                        <div className="flex items-center space-x-2 mt-1">
                          <div className={`w-2 h-2 rounded-full ${
                            item.product.stock > 10 
                              ? 'bg-green-500' 
                              : item.product.stock > 0 
                              ? 'bg-yellow-500' 
                              : 'bg-red-500'
                          }`}></div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {item.product.stock > 10 
                              ? 'In Stock' 
                              : item.product.stock > 0 
                              ? `Only ${item.product.stock} left` 
                              : 'Out of Stock'
                            }
                          </span>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={loading || item.quantity <= 1}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <MinusIcon className="w-4 h-4" />
                          </button>
                          
                          <span className="px-4 py-2 border-x border-gray-300 dark:border-gray-600 min-w-[3rem] text-center">
                            {item.quantity}
                          </span>
                          
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            disabled={loading || item.quantity >= item.product.stock}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <PlusIcon className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={loading}
                          className="p-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Item Total:
                      </span>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        ₹{(item.product.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 sticky top-8">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Order Summary
                </h2>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Subtotal ({cartSummary.totalQuantity} items)
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ₹{cartSummary.subtotal.toLocaleString()}
                    </span>
                  </div>

                  {cartSummary.savings > 0 && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>You Save</span>
                      <span>-₹{cartSummary.savings.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {cartSummary.subtotal >= 500 ? (
                        <span className="text-green-600 dark:text-green-400">FREE</span>
                      ) : (
                        '₹50'
                      )}
                    </span>
                  </div>

                  <hr className="border-gray-200 dark:border-gray-700" />

                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-gray-900 dark:text-white">Total</span>
                    <span className="text-gray-900 dark:text-white">
                      ₹{(cartSummary.subtotal + (cartSummary.subtotal >= 500 ? 0 : 50)).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Shipping Info */}
                {cartSummary.subtotal < 500 && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Add ₹{(500 - cartSummary.subtotal).toLocaleString()} more for FREE shipping!
                    </p>
                  </div>
                )}

                {/* Checkout Button */}
                <Link
                  href="/checkout"
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors mt-6 block text-center"
                >
                  Proceed to Checkout
                </Link>

                {/* Continue Shopping */}
                <Link
                  href="/products"
                  className="w-full text-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 py-3 block mt-2"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <LoadingSpinner size="md" />
              <p className="text-gray-600 dark:text-gray-400 mt-2">Updating cart...</p>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}