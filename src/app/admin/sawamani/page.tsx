'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Eye, Calendar, User, Package, Filter, Phone, MapPin, Clock } from 'lucide-react';

// Type definitions
interface SawamaniOrder {
  _id: string;
  name: string;
  phoneNumber: string;
  address: string;
  item: {
    type: string;
    variant: string;
  };
  date: string;
  packing?: string;
  packingSelections?: { [key: string]: { boxCount: number; totalWeight: number } };
  packingBreakdown?: { [key: string]: string };
  totalWeight?: number;
  createdAt: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalOrders: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface OrdersResponse {
  success: boolean;
  data: SawamaniOrder[];
  pagination: Pagination;
}

export default function SawamaniAdminPage(): React.JSX.Element {
  const [orders, setOrders] = useState<SawamaniOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  
  // Filter states
  const [phoneFilter, setPhoneFilter] = useState<string>('');
  const [itemTypeFilter, setItemTypeFilter] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Get unique item types for filter dropdown
  const [itemTypes, setItemTypes] = useState<string[]>([]);

  // Helper function to format packing selections to show WEIGHT only (not box count)
  const formatPackingDisplay = (order: SawamaniOrder): string => {
    // Use new packingBreakdown if available
    if (order.packingBreakdown && Object.keys(order.packingBreakdown).length > 0) {
      const breakdown = Object.entries(order.packingBreakdown)
        .map(([packingType, weight]) => `${packingType}: ${weight}`)
        .join(', ');
      return `${breakdown} | Total: ${order.totalWeight || 0}kg`;
    }
    
    // Fallback to old format
    if (order.packing) {
      return order.packing;
    }
    
    // Legacy format
    if (order.packingSelections && Object.keys(order.packingSelections).length > 0) {
      const PACKING_OPTIONS = [
        { id: '2piece', label: '2 Pieces' },
        { id: '4piece', label: '4 Pieces' },
        { id: '500gram', label: '500g' },
        { id: '1kg', label: '1 Kg' },
        { id: '5kg', label: '5 Kg' }
      ];
  
      const packingStrings = Object.entries(order.packingSelections)
        .filter(([, selection]) => selection.totalWeight > 0)
        .map(([packingId, selection]) => {
          const option = PACKING_OPTIONS.find(p => p.id === packingId);
          const label = option?.label || packingId;
          return `${selection.totalWeight}kg (${label})`;
        });
  
      const result = packingStrings.join(', ');
      return order.totalWeight ? `${result} | Total: ${order.totalWeight}kg` : result;
    }
    
    return 'Not specified';
  };
  const fetchOrders = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      });

      // Fix: Use 'phoneNumber' to match the actual field name in the database
      if (phoneFilter) params.set('phoneNumber', phoneFilter);
      if (itemTypeFilter) params.set('itemType', itemTypeFilter);
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);

      const response = await fetch(`/api/sawamani?${params}`);
      const data: OrdersResponse = await response.json();

      if (data.success) {
        setOrders(data.data);
        setTotalPages(data.pagination.totalPages);
        setTotalOrders(data.pagination.totalOrders);
        
        // Extract unique item types for filter
        const types = [...new Set(data.data.map(order => order.item.type))];
        setItemTypes(types);
      } else {
        console.error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, phoneFilter, itemTypeFilter, startDate, endDate]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatOrderDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const viewOrderDetails = (order: SawamaniOrder): void => {
    let packingDisplay = formatPackingDisplay(order);
    
    // Enhanced display for packingBreakdown
    if (order.packingBreakdown && Object.keys(order.packingBreakdown).length > 0) {
      const detailedBreakdown = Object.entries(order.packingBreakdown)
        .map(([packingType, weight]) => `  • ${packingType}: ${weight}`)
        .join('\n');
      packingDisplay = `Packing Breakdown:\n${detailedBreakdown}\nTotal Weight: ${order.totalWeight || 0}kg`;
    }
    
    alert(`Order Details:\n\nCustomer: ${order.name}\nPhone: ${order.phoneNumber}\nAddress: ${order.address}\n\nItem Type: ${order.item.type}\nVariant: ${order.item.variant}\n\n${packingDisplay}\n\nOrder Date: ${formatOrderDate(order.date)}\nCreated: ${formatDate(order.createdAt)}`);
  };

  const clearFilters = (): void => {
    setPhoneFilter('');
    setItemTypeFilter('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  const applyFilters = (): void => {
    setCurrentPage(1);
    fetchOrders();
  };

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sawamani Orders Management</h1>
          <p className="text-gray-600">Manage customer orders for Sawamani products</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-semibold text-gray-900">{totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <User className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Current Page</p>
                <p className="text-2xl font-semibold text-gray-900">{currentPage}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Item Types</p>
                <p className="text-2xl font-semibold text-gray-900">{itemTypes.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pages</p>
                <p className="text-2xl font-semibold text-gray-900">{totalPages}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="text-lg font-medium text-gray-700">Filters</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={phoneFilter}
                onChange={(e) => setPhoneFilter(e.target.value)}
                placeholder="Search by phone..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Item Type</label>
              <select
                value={itemTypeFilter}
                onChange={(e) => setItemTypeFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                {itemTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 text-sm font-medium"
            >
              Apply Filters
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Orders ({totalOrders})</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-pink-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{order.name}</div>
                          <div className="text-xs text-gray-500 flex items-center mt-1">
                            <MapPin className="w-3 h-3 mr-1" />
                            {order.address.length > 30 ? `${order.address.substring(0, 30)}...` : order.address}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        {order.phoneNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 font-medium">{order.item.type}</div>
                      <div className="text-sm text-gray-500">{order.item.variant}</div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {order.packing || formatPackingDisplay(order)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatOrderDate(order.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => viewOrderDetails(order)}
                        className="text-pink-600 hover:text-pink-900 flex items-center gap-1"
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

          {orders.length === 0 && !loading && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No orders found</p>
              <p className="text-sm text-gray-400">Try adjusting your filters</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages} ({totalOrders} total orders)
                </div>
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

        {loading && orders.length > 0 && (
          <div className="fixed bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg border">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-gray-600">Loading...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}