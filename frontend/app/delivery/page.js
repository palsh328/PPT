'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import { 
  TruckIcon, 
  ClockIcon,
  CheckCircleIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/app/providers';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function DeliveryDashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({});
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return; // Wait for auth to load
    
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (user && user.role !== 'DELIVERY') {
      router.push('/');
      return;
    }

    fetchDashboardData();
    fetchOrders();
  }, [isAuthenticated, user, router, authLoading]);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/delivery/dashboard');
      setDashboardData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const response = await axios.get('/delivery/orders?limit=5');
      setOrders(response.data.data.orders || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleOrderStatusUpdate = async (orderId, status) => {
    try {
      await axios.put(`/delivery/orders/${orderId}/status`, { status });
      toast.success(`Order marked as ${status.toLowerCase().replace('_', ' ')} successfully`);
      fetchOrders();
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update order status');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SHIPPED':
        return <TruckIcon className="w-4 h-4 text-blue-500" />;
      case 'OUT_FOR_DELIVERY':
        return <ClockIcon className="w-4 h-4 text-yellow-500" />;
      case 'DELIVERED':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      default:
        return <ClockIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SHIPPED':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
      case 'OUT_FOR_DELIVERY':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'DELIVERED':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const handleUpdateLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser');
      return;
    }

    setLocationLoading(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Update location on server
          console.log('Sending location update:', { latitude, longitude });
          const response = await axios.put('/delivery/location', {
            latitude,
            longitude,
            timestamp: new Date().toISOString()
          });
          
          console.log('Location update response:', response.data);
          setCurrentLocation({ latitude, longitude });
          toast.success('Location updated successfully!');
        } catch (error) {
          console.error('Location update error:', error);
          console.error('Error response:', error.response?.data);
          toast.error(error.response?.data?.message || 'Failed to update location');
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        setLocationLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error('Location access denied. Please enable location permissions.');
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            toast.error('Location request timed out.');
            break;
          default:
            toast.error('An unknown error occurred while retrieving location.');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const handleViewRouteMap = () => {
    if (orders.length === 0) {
      toast.error('No orders available to show routes');
      return;
    }

    // Get all delivery addresses
    const addresses = orders
      .filter(order => order.orderStatus === 'SHIPPED' || order.orderStatus === 'OUT_FOR_DELIVERY')
      .map(order => ({
        orderId: order.id,
        orderNumber: order.orderNumber,
        address: `${order.address.address}, ${order.address.city}, ${order.address.state} ${order.address.pincode}`,
        customerName: `${order.user.firstName} ${order.user.lastName}`,
        phone: order.address.phone
      }));

    if (addresses.length === 0) {
      toast.error('No active deliveries to show on map');
      return;
    }

    // Create Google Maps URL with multiple destinations
    const baseUrl = 'https://www.google.com/maps/dir/';
    const destinations = addresses.map(addr => encodeURIComponent(addr.address)).join('/');
    const mapUrl = `${baseUrl}${destinations}`;
    
    // Open in new tab
    window.open(mapUrl, '_blank');
    
    toast.success(`Opening route map with ${addresses.length} delivery locations`);
  };

  if (authLoading || loading) {
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

  // Don't render if not authenticated or wrong role
  if (!isAuthenticated || (user && user.role !== 'DELIVERY')) {
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
            Delivery Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Welcome back, {user?.firstName}! Manage your deliveries.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <TruckIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Orders
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {dashboardData.totalOrders || 0}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <ClockIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Pending Deliveries
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {dashboardData.pendingOrders || 0}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Delivered
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {dashboardData.deliveredOrders || 0}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <MapPinIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Today's Deliveries
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {dashboardData.todayDeliveries || 0}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Delivery Performance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-xl font-bold">
                  {dashboardData.totalOrders > 0 ? Math.round((dashboardData.deliveredOrders / dashboardData.totalOrders) * 100) : 0}%
                </span>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Success Rate</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Delivered orders</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-xl font-bold">
                  {dashboardData.averageDeliveryTime || '2.5'}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Avg Delivery Time</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Hours per delivery</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-lg font-bold">
                  {dashboardData.customerRating ? dashboardData.customerRating.toFixed(1) : '4.8'}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Customer Rating</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Delivery feedback</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-lg font-bold">
                  {dashboardData.todayDeliveries || 0}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Today's Goal</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Deliveries completed</p>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Assigned Orders
              </h2>
              <Link
                href="/delivery/orders"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
              >
                View All
              </Link>
            </div>

            {ordersLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <TruckIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No orders assigned yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Order #{order.orderNumber}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {order.user.firstName} {order.user.lastName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {order.address.address}, {order.address.city}
                        </p>
                      </div>
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                        {getStatusIcon(order.orderStatus)}
                        <span>{order.orderStatus.replace('_', ' ')}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 mb-3">
                      {order.items[0]?.product.images?.[0] && (
                        <Image
                          src={order.items[0].product.images[0]}
                          alt={order.items[0].product.name}
                          width={40}
                          height={40}
                          className="w-10 h-10 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {order.items[0]?.product.name}
                        </p>
                        {order.items.length > 1 && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            +{order.items.length - 1} more items
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        ₹{order.finalAmount.toLocaleString()}
                      </span>
                      
                      {order.orderStatus === 'SHIPPED' && (
                        <button
                          onClick={() => handleOrderStatusUpdate(order.id, 'OUT_FOR_DELIVERY')}
                          className="bg-yellow-600 text-white px-3 py-1 rounded text-xs hover:bg-yellow-700 transition-colors"
                        >
                          Out for Delivery
                        </button>
                      )}
                      
                      {order.orderStatus === 'OUT_FOR_DELIVERY' && (
                        <button
                          onClick={() => handleOrderStatusUpdate(order.id, 'DELIVERED')}
                          className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors"
                        >
                          Mark Delivered
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Link
                href="/delivery/orders"
                className="block w-full text-left p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <div className="font-medium text-blue-900 dark:text-blue-100">
                  View All Orders
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  Check all assigned deliveries
                </div>
              </Link>
              
              <button 
                onClick={handleUpdateLocation}
                disabled={locationLoading}
                className="w-full text-left p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-green-900 dark:text-green-100">
                      Update Location
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400">
                      {locationLoading ? 'Getting location...' : 'Share your current location'}
                    </div>
                  </div>
                  {locationLoading && (
                    <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
                {currentLocation && (
                  <div className="text-xs text-green-500 dark:text-green-400 mt-1">
                    Last updated: {new Date().toLocaleTimeString()}
                  </div>
                )}
              </button>
              
              <button 
                onClick={handleViewRouteMap}
                className="w-full text-left p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
              >
                <div className="font-medium text-yellow-900 dark:text-yellow-100">
                  View Route Map
                </div>
                <div className="text-sm text-yellow-600 dark:text-yellow-400">
                  Optimize delivery routes ({orders.filter(o => o.orderStatus === 'SHIPPED' || o.orderStatus === 'OUT_FOR_DELIVERY').length} active)
                </div>
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Delivery Hub Section */}
      <div className="bg-gradient-to-r from-gray-900 to-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Delivery Command Center</h2>
            <p className="text-gray-300">Your tools for efficient delivery management</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center hover:bg-white/20 transition-colors cursor-pointer"
                 onClick={handleUpdateLocation}>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Update Location</h3>
              <p className="text-sm text-gray-300">Keep customers informed of your position</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center hover:bg-white/20 transition-colors cursor-pointer"
                 onClick={handleViewRouteMap}>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Optimize Routes</h3>
              <p className="text-sm text-gray-300">Find the fastest delivery paths</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center hover:bg-white/20 transition-colors cursor-pointer"
                 onClick={() => router.push('/delivery/orders')}>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Manage Orders</h3>
              <p className="text-sm text-gray-300">Track and update delivery status</p>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">{dashboardData.deliveredOrders || 0}</div>
                <div className="text-gray-300 text-sm">Deliveries Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">{dashboardData.customerRating || '4.8'}⭐</div>
                <div className="text-gray-300 text-sm">Customer Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">{dashboardData.todayDeliveries || 0}</div>
                <div className="text-gray-300 text-sm">Today's Target</div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <p className="text-gray-400 text-sm">
              © 2024 PulsePixelTech Delivery Network • Fast • Reliable • Trusted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}