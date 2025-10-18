'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  UserIcon,
  BuildingStorefrontIcon,
  CalendarIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import AdminLayout from '@/components/admin/AdminLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Pagination from '@/components/ui/Pagination';
import { useAuth } from '@/app/providers';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    page: 1
  });

  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchProducts();
      fetchCategories();
    }
  }, [user, filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await axios.get(`/admin/products?${params.toString()}`);
      setProducts(response.data.data.products || []);
      setPagination(response.data.data.pagination || {});
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/categories');
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleViewProduct = async (productId) => {
    try {
      const response = await axios.get(`/admin/products/${productId}`);
      setSelectedProduct(response.data.data);
      setShowProductModal(true);
    } catch (error) {
      toast.error('Failed to fetch product details');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await axios.delete(`/admin/products/${productId}`);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handlePageChange = (page) => {
    setFilters({ ...filters, page });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Products
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your product catalog
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>

            {/* Category Filter */}
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => setFilters({ search: '', category: '', page: 1 })}
              className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="md" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <CubeIcon className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No products found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Get started by adding your first product
              </p>
              <Link
                href="/admin/products/new"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Product
              </Link>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {products.map((product) => (
                      <motion.tr
                        key={product.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-600 rounded-lg overflow-hidden flex-shrink-0">
                              {product.images?.[0] && (
                                <Image
                                  src={product.images[0]}
                                  alt={product.name}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {product.name}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {product.brand}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {product.category?.name || 'No Category'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {formatCurrency(product.price)}
                            </p>
                            {product.mrp > product.price && (
                              <p className="text-sm text-gray-500 line-through">
                                {formatCurrency(product.mrp)}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            product.stock > 10
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : product.stock > 0
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {product.stock} units
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            product.isActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {product.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewProduct(product.id)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 p-1"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </button>
                            <Link
                              href={`/admin/products/${product.id}/edit`}
                              className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 p-1"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-1"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4 p-4">
                {products.map((product) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-600 rounded-lg overflow-hidden flex-shrink-0">
                        {product.images?.[0] && (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 dark:text-white truncate">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {product.brand} • {product.category.name}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {formatCurrency(product.price)}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Stock: {product.stock}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between mt-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            product.isActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {product.isActive ? 'Active' : 'Inactive'}
                          </span>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewProduct(product.id)}
                              className="text-blue-600 dark:text-blue-400 p-1"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </button>
                            <Link
                              href={`/admin/products/${product.id}/edit`}
                              className="text-green-600 dark:text-green-400 p-1"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-600 dark:text-red-400 p-1"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.pages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Product Details Modal */}
        {showProductModal && selectedProduct && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowProductModal(false)} />
              
              <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Product Details
                  </h3>
                  <button
                    onClick={() => setShowProductModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Product Images */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Product Images</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedProduct.images?.map((image, index) => (
                        <div key={index} className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                          <Image
                            src={image}
                            alt={`${selectedProduct.name} ${index + 1}`}
                            width={200}
                            height={200}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Product Information */}
                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Basic Information</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm text-gray-600 dark:text-gray-400">Product Name</label>
                          <p className="font-medium text-gray-900 dark:text-white">{selectedProduct.name}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600 dark:text-gray-400">Brand</label>
                          <p className="font-medium text-gray-900 dark:text-white">{selectedProduct.brand}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600 dark:text-gray-400">Category</label>
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {selectedProduct.category?.name}
                          </span>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600 dark:text-gray-400">Description</label>
                          <p className="text-gray-900 dark:text-white">{selectedProduct.description}</p>
                        </div>
                      </div>
                    </div>

                    {/* Seller Information */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                        <UserIcon className="w-4 h-4 mr-2" />
                        Seller Information
                      </h4>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                        <div>
                          <label className="text-sm text-gray-600 dark:text-gray-400">Seller Name</label>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {selectedProduct.seller?.firstName} {selectedProduct.seller?.lastName}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600 dark:text-gray-400">Email</label>
                          <p className="text-gray-900 dark:text-white">{selectedProduct.seller?.email}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600 dark:text-gray-400">Phone</label>
                          <p className="text-gray-900 dark:text-white">{selectedProduct.seller?.phone || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600 dark:text-gray-400">Seller Since</label>
                          <p className="text-gray-900 dark:text-white flex items-center">
                            <CalendarIcon className="w-4 h-4 mr-1" />
                            {new Date(selectedProduct.seller?.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Pricing & Stock */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                        <TagIcon className="w-4 h-4 mr-2" />
                        Pricing & Stock
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-600 dark:text-gray-400">MRP</label>
                          <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(selectedProduct.mrp)}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600 dark:text-gray-400">Selling Price</label>
                          <p className="font-medium text-green-600 dark:text-green-400">{formatCurrency(selectedProduct.price)}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600 dark:text-gray-400">Stock</label>
                          <p className="font-medium text-gray-900 dark:text-white">{selectedProduct.stock} units</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600 dark:text-gray-400">Status</label>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            selectedProduct.isActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {selectedProduct.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Specifications */}
                    {selectedProduct.specifications && Object.keys(selectedProduct.specifications).length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Specifications</h4>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                          <div className="space-y-2">
                            {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{key}:</span>
                                <span className="text-sm text-gray-900 dark:text-white">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Timestamps */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Timeline</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Created:</span>
                          <span className="text-sm text-gray-900 dark:text-white">
                            {new Date(selectedProduct.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Last Updated:</span>
                          <span className="text-sm text-gray-900 dark:text-white">
                            {new Date(selectedProduct.updatedAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
                  <Link
                    href={`/admin/products/${selectedProduct.id}/edit`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <PencilIcon className="w-4 h-4" />
                    <span>Edit Product</span>
                  </Link>
                  <button
                    onClick={() => setShowProductModal(false)}
                    className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}