'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Eye, Edit, Calendar, User, Package, Filter, TrendingUp, DollarSign, Clock, CheckCircle } from 'lucide-react';

// Type definitions (same as user component but with admin fields)
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
  adminNotes?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderStats {
  totalOrders: number;
  confirmedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
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
  stats?: OrderStats;
}

type OrderStatus = 'all' | 'confirmed' | 'delivered' | 'cancelled';
type PaymentStatusType = 'pending' | 'paid';

export default function AdminOrders(): React.JSX.Element {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Partial<OrderStats>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<OrderStatus>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  const statusColors: Record<'confirmed' | 'delivered' | 'cancelled', string> = {
    confirmed: 'bg-blue-100 text-blue-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  const paymentStatusColors: Record<PaymentStatusType, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800'
  };

  const fetchOrders = useCallback(async (): Promise<void> => {
    try {
      const params = new URLSearchParams({
        admin: 'true',
        page: currentPage.toString(),
        limit: '10',
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      if (statusFilter !== 'all') {
        params.set('status', statusFilter);
      }

      const response = await fetch(`/api/orders?${params}`);
      const data: OrdersResponse = await response.json();

      if (data.success) {
        setOrders(data.orders);
        setTotalPages(data.pagination.totalPages);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateOrderStatus = async (orderId: string, newStatus: 'confirmed' | 'delivered' | 'cancelled'): Promise<void> => {
    try {
      const response = await fetch(`/api/orders`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, orderStatus: newStatus }),
      });

      if (response.ok) {
        fetchOrders();
        if (selectedOrder && selectedOrder.orderId === orderId) {
          setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
        }
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const updatePaymentStatus = async (orderId: string, newStatus: PaymentStatusType): Promise<void> => {
    try {
      const response = await fetch(`/api/orders`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, paymentStatus: newStatus }),
      });

      if (response.ok) {
        fetchOrders();
        if (selectedOrder && selectedOrder.orderId === orderId) {
          setSelectedOrder({ ...selectedOrder, paymentStatus: newStatus });
        }
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Orders Management</h1>
          <p className="text-gray-600">Manage customer orders and track sales</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalOrders || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.confirmedOrders || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Delivered</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.deliveredOrders || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Calendar className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cancelled</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.cancelledOrders || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.totalRevenue || 0)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter by status:</span>
              <select
                value={statusFilter}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Orders</option>
                <option value="confirmed">Confirmed</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.orderId}</div>
                      <div className="text-sm text-gray-500">{order.paymentMethod === 'cash_on_delivery' ? 'COD' : 'UPI'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{order.shippingAddress.fullName}</div>
                          <div className="text-sm text-gray-500">{order.userEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{order.items.length} item(s)</div>
                      <div className="text-sm text-gray-500">
                        {order.items[0]?.productName}
                        {order.items.length > 1 && ` +${order.items.length - 1} more`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(order.totalAmount)}</div>
                      <div className="text-sm text-gray-500">
                        {order.shippingCost > 0 ? `+${formatCurrency(order.shippingCost)} shipping` : 'Free shipping'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.paymentStatus}
                        onChange={(e) => updatePaymentStatus(order.orderId, e.target.value as PaymentStatusType)}
                        className={`text-xs font-medium px-2 py-1 rounded-full border-0 focus:ring-2 focus:ring-green-500 ${paymentStatusColors[order.paymentStatus]}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => updateOrderStatus(order.orderId, e.target.value as 'confirmed' | 'delivered' | 'cancelled')}
                        className={`text-xs font-medium px-2 py-1 rounded-full border-0 focus:ring-2 focus:ring-green-500 ${statusColors[order.orderStatus]}`}
                      >
                        <option value="confirmed">Confirmed</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => viewOrderDetails(order)}
                        className="text-green-600 hover:text-green-900 flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">Page {currentPage} of {totalPages}</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        {showModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-gray-900">Order Details - {selectedOrder.orderId}</h2>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Eye className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Order & Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Order Information</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Order ID:</span> {selectedOrder.orderId}</p>
                      <p><span className="font-medium">Date:</span> {formatDate(selectedOrder.createdAt)}</p>
                      <p><span className="font-medium">Payment Method:</span> {selectedOrder.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : 'UPI'}</p>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Status:</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[selectedOrder.orderStatus]}`}>
                          {selectedOrder.orderStatus.charAt(0).toUpperCase() + selectedOrder.orderStatus.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Payment:</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${paymentStatusColors[selectedOrder.paymentStatus]}`}>
                          {selectedOrder.paymentStatus.charAt(0).toUpperCase() + selectedOrder.paymentStatus.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Name:</span> {selectedOrder.shippingAddress.fullName}</p>
                      <p><span className="font-medium">Email:</span> {selectedOrder.userEmail}</p>
                      <p><span className="font-medium">Phone:</span> +91 {selectedOrder.shippingAddress.phone}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
                    <div className="text-sm">
                      <p>{selectedOrder.shippingAddress.addressLine1}</p>
                      {selectedOrder.shippingAddress.addressLine2 && <p>{selectedOrder.shippingAddress.addressLine2}</p>}
                      <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}</p>
                      <p>{selectedOrder.shippingAddress.pincode}</p>
                      {selectedOrder.shippingAddress.landmark && <p>Landmark: {selectedOrder.shippingAddress.landmark}</p>}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Order Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                        <img
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
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{selectedOrder.subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>{selectedOrder.shippingCost === 0 ? 'FREE' : `₹${selectedOrder.shippingCost}`}</span>
                    </div>
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

                {/* Notes */}
                {(selectedOrder.notes || selectedOrder.adminNotes) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedOrder.notes && (
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Customer Notes</h3>
                        <p className="text-gray-600 bg-blue-50 p-3 rounded-lg">{selectedOrder.notes}</p>
                      </div>
                    )}
                    {selectedOrder.adminNotes && (
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Admin Notes</h3>
                        <p className="text-gray-600 bg-yellow-50 p-3 rounded-lg">{selectedOrder.adminNotes}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Admin Actions */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Admin Actions</h3>
                  <div className="flex gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium">Order Status:</label>
                      <select
                        value={selectedOrder.orderStatus}
                        onChange={(e) => updateOrderStatus(selectedOrder.orderId, e.target.value as 'confirmed' | 'delivered' | 'cancelled')}
                        className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-green-500"
                      >
                        <option value="confirmed">Confirmed</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium">Payment Status:</label>
                      <select
                        value={selectedOrder.paymentStatus}
                        onChange={(e) => updatePaymentStatus(selectedOrder.orderId, e.target.value as PaymentStatusType)}
                        className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-green-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}