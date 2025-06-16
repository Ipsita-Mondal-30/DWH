'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Package, Eye,  Truck, CheckCircle, XCircle, Clock,  } from 'lucide-react';
import Image from 'next/image';

// Type definitions
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

type OrderStatus = 'all' | 'confirmed' | 'delivered' | 'cancelled';

export default function MyOrders(): React.JSX.Element {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<OrderStatus>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  const statusConfig = {
    confirmed: { color: 'bg-blue-100 text-blue-800', icon: Clock },
    delivered: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle }
  };

  const paymentStatusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
    paid: { color: 'bg-green-100 text-green-800', text: 'Paid' }
  };

  // Function to calculate shipping cost based on subtotal
  const calculateShippingCost = (subtotal: number): number => {
    return subtotal >= 1000 ? 0 : 59;
  };

  const fetchOrders = useCallback(async (): Promise<void> => {
    if (!session?.user) {
      console.log('No user found in session:', session);
      return;
    }

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      });

      if (statusFilter !== 'all') {
        params.set('status', statusFilter);
      }

      console.log('Fetching orders with params:', params.toString());

      const response = await fetch(`/api/orders?${params}`);
      const data: OrdersResponse = await response.json();

      console.log('Orders API response:', data);

      if (data.success) {
        setOrders(data.orders);
        setTotalPages(data.pagination.totalPages);
      } else {
        console.error('Failed to fetch orders:', data);
        if (response.status === 401) {
          alert('Please sign in again to view your orders.');
          window.location.href = '/auth/signin';
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, session]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      console.log('User authenticated, fetching orders for user:', session.user.email);
      fetchOrders();
    } else if (status === 'authenticated' && !session?.user) {
      console.error('User authenticated but no user found in session');
      setLoading(false);
    }
  }, [fetchOrders, status, session?.user]);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleFilterChange = (newFilter: string): void => {
    setStatusFilter(newFilter as OrderStatus);
    setCurrentPage(1);
  };

  const viewOrderDetails = (order: Order): void => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const closeModal = (): void => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const cancelOrder = async (orderId: string): Promise<void> => {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    if (!session?.user) {
      alert('User session not found. Please sign in again.');
      return;
    }

    try {
      const response = await fetch(`/api/orders?orderId=${orderId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancellationReason: 'Cancelled by customer' }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        fetchOrders();
        closeModal();
        alert('Order cancelled successfully');
      } else {
        alert(result.error || 'Failed to cancel order. Please try again.');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Error cancelling order. Please try again.');
    }
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
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Please Sign In</h2>
          <p className="text-gray-600 mb-4">You need to be signed in to view your orders.</p>
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

  // Check if user session is missing
  if (status === 'authenticated' && !session?.user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Session Error</h2>
          <p className="text-gray-600 mb-4">Your session is missing user information. Please sign in again.</p>
          <button
            onClick={() => window.location.href = '/auth/signin'}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Sign In Again
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Track and manage your orders</p>
          {/* Debug info - remove in production */}
          <p className="text-xs text-gray-400 mt-2">User: {session?.user?.email}</p>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter by status:</span>
              <select
                value={statusFilter}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Orders</option>
                <option value="confirmed">Confirmed</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600 mb-6">
              {statusFilter === 'all' 
                ? "You haven't placed any orders yet." 
                : `No ${statusFilter} orders found.`
              }
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const StatusIcon = statusConfig[order.orderStatus].icon;
              return (
                <div key={order._id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
                    <div className="flex items-center gap-4 mb-4 lg:mb-0">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{order.orderId}</h3>
                        <p className="text-sm text-gray-600">
                          Placed on {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">₹{order.totalAmount}</p>
                        <p className="text-sm text-gray-600">{order.items.length} item(s)</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusConfig[order.orderStatus].color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Payment Method</p>
                      <p className="text-sm font-medium">
                        {order.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : 'UPI'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Payment Status</p>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${paymentStatusConfig[order.paymentStatus].color}`}>
                        {paymentStatusConfig[order.paymentStatus].text}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Delivery Address</p>
                      <p className="text-sm font-medium">{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        {order.orderStatus === 'delivered' ? 'Delivered On' : 'Estimated Delivery'}
                      </p>
                      <p className="text-sm font-medium">
                        {order.deliveredAt 
                          ? formatDate(order.deliveredAt)
                          : order.estimatedDelivery 
                            ? formatDate(order.estimatedDelivery)
                            : 'TBD'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {order.orderStatus === 'confirmed' && 'Order confirmed, preparing for shipment'}
                        {order.orderStatus === 'delivered' && 'Order delivered successfully'}
                        {order.orderStatus === 'cancelled' && `Cancelled: ${order.cancellationReason || 'Order cancelled'}`}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => viewOrderDetails(order)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                      {order.orderStatus === 'confirmed' && (
                        <button
                          onClick={() => cancelOrder(order.orderId)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
                        >
                          <XCircle className="w-4 h-4" />
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">Page {currentPage} of {totalPages}</div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Order Details Modal */}
        {showModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-gray-900">Order Details</h2>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Order Information</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Order ID:</span> {selectedOrder.orderId}</p>
                      <p><span className="font-medium">Date:</span> {formatDate(selectedOrder.createdAt)}</p>
                      <p><span className="font-medium">Status:</span> 
                        <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${statusConfig[selectedOrder.orderStatus].color}`}>
                          {selectedOrder.orderStatus.charAt(0).toUpperCase() + selectedOrder.orderStatus.slice(1)}
                        </span>
                      </p>
                      <p><span className="font-medium">Payment Method:</span> {selectedOrder.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : 'UPI'}</p>
                      <p><span className="font-medium">Payment Status:</span> 
                        <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${paymentStatusConfig[selectedOrder.paymentStatus].color}`}>
                          {paymentStatusConfig[selectedOrder.paymentStatus].text}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
                    <div className="text-sm">
                      <p className="font-medium">{selectedOrder.shippingAddress.fullName}</p>
                      <p>{selectedOrder.shippingAddress.addressLine1}</p>
                      {selectedOrder.shippingAddress.addressLine2 && <p>{selectedOrder.shippingAddress.addressLine2}</p>}
                      <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.pincode}</p>
                      <p>Phone: +91 {selectedOrder.shippingAddress.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Order Items</h3>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                        <Image
                        width={100}
                        height={100}
                          src={item.productImage || '/placeholder-image.jpg'}
                          alt={item.productName}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{item.productName}</h4>
                          <p className="text-sm text-gray-600">
                            {item.selectedPricing.quantity}{item.selectedPricing.unit} × {item.quantity}
                          </p>
                          <p className="text-sm font-medium">₹{item.selectedPricing.price} each</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">₹{item.itemTotal}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{selectedOrder.subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span className={calculateShippingCost(selectedOrder.subtotal) === 0 ? 'text-green-600' : ''}>
                        {calculateShippingCost(selectedOrder.subtotal) === 0 ? 'FREE' : `₹${calculateShippingCost(selectedOrder.subtotal)}`}
                      </span>
                    </div>
                    {calculateShippingCost(selectedOrder.subtotal) === 0 && (
                      <div className="text-xs text-green-600">
                        🎉 You saved ₹59 on shipping!
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Tax (GST):</span>
                      <span>₹{selectedOrder.tax}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total:</span>
                        <span>₹{selectedOrder.totalAmount}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Special Instructions</h3>
                    <p className="text-gray-600">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}