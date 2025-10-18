'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import { 
  ArrowLeftIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  TruckIcon
} from '@heroicons/react/24/outline';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Pagination from '@/components/ui/Pagination';
import { useAuth } from '@/app/providers';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [deliveryPartners, setDeliveryPartners] = useState([]);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (user && user.role !== 'SELLER') {
      router.push('/');
      return;
    }

    fetchOrders();
    fetchDeliveryPartners();
  }, [isAuthenticated, user, router, currentPage, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      });
      
      if (statusFilter) {
        params.append('status', statusFilter);
      }
      
      const response = await axios.get(`/seller/orders?${params}`);
      setOrders(response.data.data.orders || []);
      setPagination(response.data.data.pagination || {});
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveryPartners = async () => {
    try {
      const response = await axios.get('/seller/delivery-partners');
      setDeliveryPartners(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch delivery partners:', error);
    }
  };

  const handleOrderStatusUpdate = async (orderId, status, deliveryPartnerId = null) => {
    try {
      const data = { status };
      if (deliveryPartnerId) {
        data.deliveryPartnerId = deliveryPartnerId;
      }
      
      await axios.put(`/seller/orders/${orderId}/status`, data);
      toast.success(`Order ${status.toLowerCase()} successfully`);
      fetchOrders();
      setShowDeliveryModal(false);
      setSelectedOrderId(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleShipOrder = (orderId) => {
    setSelectedOrderId(orderId);
    setShowDeliveryModal(true);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case 'CONFIRMED':
      case 'PROCESSING':
        return <ClockIcon className="w-5 h-5 text-blue-500" />;
      case 'SHIPPED':
        return <TruckIcon className="w-5 h-5 text-purple-500" />;
      case 'OUT_FOR_DELIVERY':
        return <TruckIcon className="w-5 h-5 text-orange-500" />;
      case 'DELIVERED':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'CANCELLED':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'CONFIRMED':
      case 'PROCESSING':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
      case 'SHIPPED':
        return 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300';
      case 'OUT_FOR_DELIVERY':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300';
      case 'DELIVERED':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'CANCELLED':
        return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          <Link
            href="/seller"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                My Orders
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage orders for your products
              </p>
            </div>
            
            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Orders</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <ClockIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              No orders found
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {statusFilter ? `No ${statusFilter.toLowerCase()} orders found.` : 'You haven\'t received any orders yet.'}
            </p>
          </div>
        ) : (
          <>
            {/* Orders List */}
            <div className="space-y-6">
              {orders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Order #{order.orderNumber}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400">
                            {formatDate(order.createdAt)}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Customer: {order.user.firstName} {order.user.lastName}
                          </p>
                        </div>
                        
                        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.orderStatus)}`}>
                          {getStatusIcon(order.orderStatus)}
                          <span>{order.orderStatus.replace('_', ' ')}</span>
                        </div>
                      </div>

                      <div className="mt-4 sm:mt-0 text-right">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          ₹{order.finalAmount.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Payment: {order.paymentMethod.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6">
                    <div className="space-y-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                            {item.product.images?.[0] && (
                              <Image
                                src={item.product.images[0]}
                                alt={item.product.name}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {item.product.name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Quantity: {item.quantity} × ₹{item.price.toLocaleString()} = ₹{item.total.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Actions */}
                    <div className="mt-6 flex flex-wrap gap-3">
                      {order.orderStatus === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleOrderStatusUpdate(order.id, 'CONFIRMED')}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Accept Order
                          </button>
                          <button
                            onClick={() => handleOrderStatusUpdate(order.id, 'CANCELLED')}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Reject Order
                          </button>
                        </>
                      )}
                      
                      {order.orderStatus === 'CONFIRMED' && (
                        <button
                          onClick={() => handleOrderStatusUpdate(order.id, 'PROCESSING')}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Start Processing
                        </button>
                      )}
                      
                      {order.orderStatus === 'PROCESSING' && (
                        <button
                          onClick={() => handleShipOrder(order.id)}
                          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          Assign Delivery & Ship
                        </button>
                      )}
                      
                      {order.deliveryPartner && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Delivery Partner: {order.deliveryPartner.firstName} {order.deliveryPartner.lastName}
                        </div>
                      )}
                      
                      {order.trackingNumber && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Tracking: {order.trackingNumber}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="mt-12">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.pages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>

      <Footer />

      {/* Delivery Partner Assignment Modal */}
      {showDeliveryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Assign Delivery Partner
            </h3>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Select a delivery partner to assign this order for shipping.
            </p>
            
            <div className="space-y-3 mb-6">
              {deliveryPartners.map((partner) => (
                <button
                  key={partner.id}
                  onClick={() => handleOrderStatusUpdate(selectedOrderId, 'SHIPPED', partner.id)}
                  className="w-full text-left p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="font-medium text-gray-900 dark:text-white">
                    {partner.firstName} {partner.lastName}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {partner.email} • {partner.phone}
                  </div>
                </button>
              ))}
              
              {deliveryPartners.length === 0 && (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  No delivery partners available
                </div>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeliveryModal(false);
                  setSelectedOrderId(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              
              <button
                onClick={() => handleOrderStatusUpdate(selectedOrderId, 'SHIPPED')}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Ship Without Assignment
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}