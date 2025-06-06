'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Eye, Edit, Calendar, User, Package, Filter } from 'lucide-react';

// Type definitions
interface Enquiry {
  _id: string;
  name: string;
  email: string;
  phone: string;
  product: string;
  quantity: string;
  price: string;
  message: string;
  status: 'new' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  total: number;
  new: number;
  'in-progress': number;
  completed: number;
  cancelled: number;
  today: number;
  thisWeek: number;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalEnquiries: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface EnquiriesResponse {
  success: boolean;
  data: Enquiry[];
  pagination: Pagination;
  filters: {
    status: string;
    sortBy: string;
    sortOrder: string;
  };
}

interface StatsResponse {
  success: boolean;
  data: Stats;
}

type StatusFilter = 'all' | 'new' | 'in-progress' | 'completed' | 'cancelled';
type EnquiryStatus = 'new' | 'in-progress' | 'completed' | 'cancelled';

export default function AdminEnquiriesPage(): React.JSX.Element {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [stats, setStats] = useState<Partial<Stats>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const statusColors: Record<EnquiryStatus, string> = {
    new: 'bg-blue-100 text-blue-800',
    'in-progress': 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  const fetchEnquiries = useCallback(async (): Promise<void> => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      if (statusFilter !== 'all') {
        params.set('status', statusFilter);
      }

      const response = await fetch(`/api/enquiries?${params}`);
      const data: EnquiriesResponse = await response.json();

      if (data.success) {
        setEnquiries(data.data);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching enquiries:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter]);

  const fetchStats = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch('/api/enquiries/stats');
      const data: StatsResponse = await response.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchEnquiries();
    fetchStats();
  }, [fetchEnquiries, fetchStats]);

  const updateStatus = async (id: string, newStatus: EnquiryStatus): Promise<void> => {
    try {
      const response = await fetch(`/api/enquiries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchEnquiries();
        fetchStats();
      }
    } catch (error) {
      console.error('Error updating status:', error);
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

  const handleStatusChange = (enquiryId: string, newStatus: string): void => {
    updateStatus(enquiryId, newStatus as EnquiryStatus);
  };

  const handleFilterChange = (newFilter: string): void => {
    setStatusFilter(newFilter as StatusFilter);
    setCurrentPage(1);
  };

  const viewEnquiryDetails = (enquiry: Enquiry): void => {
    alert(`Enquiry Details:\n\nName: ${enquiry.name}\nEmail: ${enquiry.email}\nPhone: +91 ${enquiry.phone}\nProduct: ${enquiry.product}\nQuantity: ${enquiry.quantity}\nBudget: ${enquiry.price}\n\nMessage:\n${enquiry.message}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading enquiries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Enquiry Management</h1>
          <p className="text-gray-600">Manage customer enquiries for Sweet Delights</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Enquiries</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Package className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">New Enquiries</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.new || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.today || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Edit className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.thisWeek || 0}</p>
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
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Enquiries Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Enquiries</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {enquiries.map((enquiry) => (
                  <tr key={enquiry._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-pink-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{enquiry.name}</div>
                          <div className="text-sm text-gray-500">{enquiry.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{enquiry.product}</div>
                      <div className="text-sm text-gray-500">Qty: {enquiry.quantity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">+91 {enquiry.phone}</div>
                      <div className="text-sm text-gray-500">Budget: {enquiry.price}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={enquiry.status}
                        onChange={(e) => handleStatusChange(enquiry._id, e.target.value)}
                        className={`text-xs font-medium px-2 py-1 rounded-full border-0 focus:ring-2 focus:ring-pink-500 ${statusColors[enquiry.status]}`}
                      >
                        <option value="new">New</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(enquiry.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => viewEnquiryDetails(enquiry)}
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
      </div>
    </div>
  );
}
