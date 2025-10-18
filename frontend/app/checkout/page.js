'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PaymentMethods from '@/components/payment/PaymentMethods';
import { CardForm, UPIForm, NetBankingForm, WalletForm } from '@/components/payment/PaymentForms';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuth, useCart } from '@/app/providers';
import toast from 'react-hot-toast';
import { 
  MapPinIcon, 
  PlusIcon, 
  CheckCircleIcon,
  CreditCardIcon 
} from '@heroicons/react/24/outline';

export default function CheckoutPage() {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [addressForm, setAddressForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    isDefault: false
  });

  const { isAuthenticated, user } = useAuth();
  const { cartItems, getCartSummary, clearCart } = useCart();
  const router = useRouter();

  const cartSummary = getCartSummary();
  const shippingFee = cartSummary.subtotal >= 500 ? 0 : 50;
  const totalAmount = cartSummary.subtotal + shippingFee;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (cartItems.length === 0) {
      router.push('/cart');
      return;
    }

    fetchAddresses();
  }, [isAuthenticated, cartItems.length, router]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/users/addresses');
      const userAddresses = response.data.data || [];
      setAddresses(userAddresses);
      
      // Auto-select default address
      const defaultAddress = userAddresses.find(addr => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress.id);
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    
    try {
      await axios.post('/users/addresses', addressForm);
      toast.success('Address added successfully');
      setShowAddressForm(false);
      setAddressForm({
        name: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        landmark: '',
        isDefault: false
      });
      fetchAddresses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add address');
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    // Simulate coupon validation
    const validCoupons = {
      'WELCOME10': { type: 'percentage', value: 10, minAmount: 1000 },
      'FLAT500': { type: 'fixed', value: 500, minAmount: 5000 }
    };

    const coupon = validCoupons[couponCode.toUpperCase()];
    if (coupon && totalAmount >= coupon.minAmount) {
      setAppliedCoupon({
        code: couponCode.toUpperCase(),
        ...coupon
      });
      toast.success('Coupon applied successfully!');
    } else {
      toast.error('Invalid coupon code or minimum amount not met');
    }
  };

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    
    if (appliedCoupon.type === 'percentage') {
      return Math.min((totalAmount * appliedCoupon.value) / 100, appliedCoupon.maxDiscount || totalAmount);
    } else {
      return appliedCoupon.value;
    }
  };

  const finalAmount = totalAmount - calculateDiscount();

  const handlePlaceOrder = async (paymentData = {}) => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      return;
    }

    if (!selectedPaymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    try {
      setProcessing(true);

      // Create order
      const orderData = {
        addressId: selectedAddress,
        paymentMethod: selectedPaymentMethod,
        notes: ''
      };

      // Only add couponCode if it exists
      if (appliedCoupon?.code) {
        orderData.couponCode = appliedCoupon.code;
      }

      console.log('🛒 Sending order data:', orderData);
      console.log('📍 Selected address:', selectedAddress);
      console.log('💳 Selected payment method:', selectedPaymentMethod);

      const orderResponse = await axios.post('/orders/create', orderData);
      const order = orderResponse.data.data;

      // Process payment if not COD
      if (selectedPaymentMethod !== 'COD') {
        const paymentResponse = await axios.post('/payments/process', {
          orderId: order.id,
          method: selectedPaymentMethod,
          amount: finalAmount,
          paymentData
        });

        if (!paymentResponse.data.success) {
          toast.error('Payment failed. Please try again.');
          return;
        }
      }

      // Clear cart and redirect
      await clearCart();
      toast.success('Order placed successfully!');
      router.push(`/orders/${order.id}`);

    } catch (error) {
      console.error('Order placement failed:', error);
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
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
            Checkout
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Review your order and complete your purchase
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Delivery Address */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <MapPinIcon className="w-5 h-5 mr-2" />
                  Delivery Address
                </h2>
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  <PlusIcon className="w-4 h-4 mr-1" />
                  Add New
                </button>
              </div>

              {/* Address List */}
              <div className="space-y-4">
                {addresses.map((address) => (
                  <label
                    key={address.id}
                    className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      selectedAddress === address.id
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      value={address.id}
                      checked={selectedAddress === address.id}
                      onChange={(e) => setSelectedAddress(e.target.value)}
                      className="sr-only"
                    />
                    
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {address.name}
                          </h3>
                          {address.isDefault && (
                            <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                          {address.address}, {address.city}, {address.state} - {address.pincode}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Phone: {address.phone}
                        </p>
                      </div>
                      
                      {selectedAddress === address.id && (
                        <CheckCircleIcon className="w-6 h-6 text-blue-600" />
                      )}
                    </div>
                  </label>
                ))}
              </div>

              {/* Add Address Form */}
              {showAddressForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-6 p-4 border border-gray-200 dark:border-gray-600 rounded-lg"
                >
                  <h3 className="font-medium text-gray-900 dark:text-white mb-4">
                    Add New Address
                  </h3>
                  
                  <form onSubmit={handleAddAddress} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={addressForm.name}
                        onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                        className="input"
                        required
                      />
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                        className="input"
                        required
                      />
                    </div>
                    
                    <textarea
                      placeholder="Address"
                      value={addressForm.address}
                      onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                      className="input"
                      rows={3}
                      required
                    />
                    
                    <div className="grid grid-cols-3 gap-4">
                      <input
                        type="text"
                        placeholder="City"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        className="input"
                        required
                      />
                      <input
                        type="text"
                        placeholder="State"
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        className="input"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Pincode"
                        value={addressForm.pincode}
                        onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                        className="input"
                        required
                      />
                    </div>
                    
                    <input
                      type="text"
                      placeholder="Landmark (Optional)"
                      value={addressForm.landmark}
                      onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                      className="input"
                    />
                    
                    <div className="flex items-center space-x-4">
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Save Address
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(false)}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <CreditCardIcon className="w-5 h-5 mr-2" />
                Payment Method
              </h2>

              <PaymentMethods
                onMethodSelect={setSelectedPaymentMethod}
                selectedMethod={selectedPaymentMethod}
              />

              {/* Payment Forms */}
              {selectedPaymentMethod && selectedPaymentMethod !== 'COD' && (
                <div className="mt-6">
                  {(selectedPaymentMethod === 'DEBIT_CARD' || selectedPaymentMethod === 'CREDIT_CARD') && (
                    <CardForm
                      onSubmit={handlePlaceOrder}
                      isProcessing={processing}
                    />
                  )}
                  
                  {selectedPaymentMethod === 'UPI' && (
                    <UPIForm
                      onSubmit={handlePlaceOrder}
                      isProcessing={processing}
                    />
                  )}
                  
                  {selectedPaymentMethod === 'NET_BANKING' && (
                    <NetBankingForm
                      onSubmit={handlePlaceOrder}
                      isProcessing={processing}
                    />
                  )}
                  
                  {selectedPaymentMethod === 'WALLET' && (
                    <WalletForm
                      onSubmit={handlePlaceOrder}
                      isProcessing={processing}
                    />
                  )}
                </div>
              )}

              {selectedPaymentMethod === 'COD' && (
                <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-green-800 dark:text-green-200 text-sm">
                    You have selected Cash on Delivery. You can pay when your order is delivered.
                  </p>
                  
                  <button
                    onClick={() => handlePlaceOrder()}
                    disabled={processing}
                    className="w-full mt-4 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {processing ? 'Placing Order...' : 'Place Order'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Order Summary
              </h2>

              {/* Items */}
              <div className="space-y-3 mb-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {item.product.name} × {item.quantity}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ₹{(item.product.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <hr className="border-gray-200 dark:border-gray-700 mb-4" />

              {/* Coupon */}
              <div className="mb-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 input text-sm"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Apply
                  </button>
                </div>
                
                {appliedCoupon && (
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-green-600 dark:text-green-400">
                      Coupon: {appliedCoupon.code}
                    </span>
                    <button
                      onClick={() => setAppliedCoupon(null)}
                      className="text-red-600 dark:text-red-400 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ₹{cartSummary.subtotal.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {shippingFee === 0 ? (
                      <span className="text-green-600 dark:text-green-400">FREE</span>
                    ) : (
                      `₹${shippingFee}`
                    )}
                  </span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Discount</span>
                    <span>-₹{calculateDiscount().toLocaleString()}</span>
                  </div>
                )}

                <hr className="border-gray-200 dark:border-gray-700" />

                <div className="flex justify-between text-lg font-bold">
                  <span className="text-gray-900 dark:text-white">Total</span>
                  <span className="text-gray-900 dark:text-white">
                    ₹{finalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}