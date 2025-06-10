'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Package, Eye, Calendar, Truck, CheckCircle, XCircle, Clock, CreditCard, User, Mail, MapPin, ArrowRight } from 'lucide-react';
import Link from 'next/link';

// Type definitions (same as MyOrders.tsx)
interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  selectedPricing: {
    quantity: number;
    unit: string;
    price: number;
  };
  itemTotal: number;
}

interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
}

interface Order {
  _id: string;
  orderId: string;
  userEmail: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  orderStatus: 'confirmed' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid';
  paymentMethod: 'cash_on_delivery' | 'upi';
  subtotal: number;
  shippingCost: number;
  tax: number;
  totalAmount: number;
  notes?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrdersResponse {
  success: boolean;
  orders: Order[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalOrders: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export default function MyAccount(): React.JSX.Element {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalOrders, setTotalOrders] = useState<number>(0);

  const statusConfig = {
    confirmed: { color: 'bg-blue-100 text-blue-800', icon: Clock },
    delivered: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle }
  };

  const fetchRecentOrders = useCallback(async (): Promise<void> => {
    if (!session?.user?.email) return;

    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '3' // Only fetch recent 3 orders for account page
      });

      const response = await fetch(`/api/orders?${params}`);
      const data: OrdersResponse = await response.json();

      if (data.success) {
        setOrders(data.orders);
        setTotalOrders(data.pagination.totalOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchRecentOrders();
    }
  }, [fetchRecentOrders, status]);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Please Sign In</h2>
          <p className="text-gray-600 mb-4">You need to be signed in to view your account.</p>
          <button
            onClick={() => window.location.href = '/auth/signin'}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const userName = session?.user?.name || 'User';
  const userEmail = session?.user?.email || '';

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Account</h1>
        </div>

        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <p className="text-gray-600">
                Hello <span className="font-medium text-gray-900">{userName}</span> (not {userName}? 
                <button 
                  onClick={() => window.location.href = '/api/auth/signout'}
                  className="text-blue-600 hover:text-blue-800 ml-1 underline"
                >
                  Log out
                </button>
                )
              </p>
            </div>
          </div>
        </div>

        {/* Order History Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Order history</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="border-2 border-green-200 bg-green-50 rounded-lg p-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <Link 
                  href="/collections/sweets"
                  className="text-green-700 hover:text-green-800 underline font-medium"
                >
                  MAKE YOUR FIRST ORDER
                </Link>
              </div>
              <p className="text-green-600">You haven't placed any orders yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const StatusIcon = statusConfig[order.orderStatus].icon;
                return (
                  <div key={order._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{order.orderId}</h3>
                          <p className="text-sm text-gray-600">
                            {formatDate(order.createdAt)} • ₹{order.totalAmount} • {order.items.length} item(s)
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusConfig[order.orderStatus].color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                        </div>
                        <Link
                          href="/my-orders"
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {totalOrders > 3 && (
                <div className="text-center pt-4">
                  <Link
                    href="/my-orders"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View all orders
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Account Details Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Account details</h2>
          
          <div className="space-y-6">
            {/* Name Field */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center py-4 border-b border-gray-100">
              <label className="text-gray-700 font-medium flex items-center gap-2">
                <User className="w-4 h-4" />
                Name
              </label>
              <div className="md:col-span-3">
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded border">
                  {userName}
                </p>
              </div>
            </div>

            {/* Email Field */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center py-4 border-b border-gray-100">
              <label className="text-gray-700 font-medium flex items-center gap-2">
                <Mail className="w-4 h-4" />
                E-mail
              </label>
              <div className="md:col-span-3">
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded border">
                  {userEmail}
                </p>
              </div>
            </div>

            {/* Address Fields */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center py-4 border-b border-gray-100">
              <label className="text-gray-700 font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Address 1
              </label>
              <div className="md:col-span-3">
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your primary address"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center py-4">
              <label className="text-gray-700 font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Address 2
              </label>
              <div className="md:col-span-3">
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your secondary address (optional)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}