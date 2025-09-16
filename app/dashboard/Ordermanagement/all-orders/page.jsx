"use client"
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const OrderDetails = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [token, setToken] = useState(null);
  
  useEffect(() => {
    const storedToken = localStorage.getItem("adminToken");
    setToken(storedToken);
  }, []);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  useEffect(() => {
    filterOrders();
  }, [orders, statusFilter, searchQuery]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/all-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      const result = await response.json();
      setOrders(result);
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Orders could not be loaded!");
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter.toUpperCase());
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(order => 
        // Order ID search
        order.id?.toString().includes(query) ||
        // Customer name search
        order.user?.name?.toLowerCase().includes(query) ||
        // Product name search
        order.orderItems?.some(item => 
          item.product?.name?.toLowerCase().includes(query)
        )
      );
    }

    setFilteredOrders(filtered);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "processing": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "paid": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "failed": return "bg-red-100 text-red-800";
      case "refunded": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${baseUrl}/order/status/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus.toUpperCase() })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Order status updated to ${newStatus}`);
        fetchOrders(); // Refresh orders
      } else {
        toast.error(data.message || "Status update failed");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Status update failed");
    }
  };

  const handleUpdatePaymentStatus = async (orderId, newPaymentStatus) => {
    try {
      const response = await fetch(`${baseUrl}/order/payment/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ paymentStatus: newPaymentStatus.toUpperCase() })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Payment status updated to ${newPaymentStatus}`);
        fetchOrders(); // Refresh orders
      } else {
        toast.error(data.message || "Payment status update failed");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Payment status update failed");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleOrderExpand = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 overflow-auto">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Order Management</h1>
        
        {/* Filters and Search */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Search Bar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Orders
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Order ID, Product, Customer..."
                className="w-full border border-gray-300 rounded-md px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Search by: Order ID, Product Name, Customer Name
            </p>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-600">
            Showing {filteredOrders.length} of {orders.length} orders
          </div>
          {searchQuery && (
            <div className="text-sm text-blue-600">
              Searching for: "{searchQuery}"
            </div>
          )}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 rounded-lg shadow">
          {searchQuery || statusFilter !== "all" ? (
            <>
              <p className="text-gray-500 text-lg">No orders found matching your criteria</p>
              <p className="text-sm text-gray-400 mt-2">
                Try adjusting your search or filters
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                }}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Clear All Filters
              </button>
            </>
          ) : (
            <p className="text-gray-500 text-lg">No orders found</p>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <React.Fragment key={order.id}>
                    <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleOrderExpand(order.id)}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          #{order.id}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.user?.name || "N/A"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.user?.email || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {order.orderItems?.length || 0} item(s)
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">
                          {order.orderItems?.map(item => item.product?.name || "Unknown").join(', ')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ₹{order.total?.toFixed(2) || "0.00"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                          {order.status || "unknown"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                          {order.paymentStatus || "unknown"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleOrderExpand(order.id);
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          {expandedOrder === order.id ? 'Hide' : 'View'} Details
                        </button>
                      </td>
                    </tr>
                    
                    {/* Expanded Row with Order Details */}
                    {expandedOrder === order.id && (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 bg-gray-50">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Products */}
                            <div>
                              <h3 className="font-semibold text-lg mb-3">Products ({order.orderItems?.length || 0})</h3>
                              <div className="space-y-3">
                                {order.orderItems?.map((item, index) => (
                                  <div key={index} className="flex items-center p-3 border rounded-lg bg-white">
                                    {item.product?.images?.[0] ? (
                                      <img
                                        src={item.product.images[0]}
                                        alt={item.product.name}
                                        className="w-16 h-16 object-cover rounded-md mr-3"
                                      />
                                    ) : (
                                      <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center mr-3">
                                        <span className="text-xs text-gray-500">No Image</span>
                                      </div>
                                    )}
                                    <div className="flex-1">
                                      <h4 className="font-medium">{item.product?.name || 'Product Not Available'}</h4>
                                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                      <p className="text-sm text-gray-600">₹{item.price?.toFixed(2) || "0.00"} each</p>
                                      <p className="text-xs text-gray-400">Product ID: {item.product?.id || 'N/A'}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Order Info & Actions */}
                            <div>
                              <h3 className="font-semibold text-lg mb-3">Order Information</h3>
                              
                              {/* Shipping Address */}
                              <div className="mb-4 p-3 border rounded-lg bg-white">
                                <h4 className="font-medium mb-2">Shipping Address</h4>
                                <p className="text-sm">{order.address || "N/A"}</p>
                                <p className="text-sm">{order.city || "N/A"}, {order.state || "N/A"} - {order.pincode || "N/A"}</p>
                                <p className="text-sm">{order.country || "N/A"}</p>
                              </div>

                              {/* Status Actions */}
                              <div className="p-3 border rounded-lg bg-white mb-4">
                                <h4 className="font-medium mb-2">Update Order Status</h4>
                                <div className="flex flex-wrap gap-2">
                                  {["pending", "processing", "completed", "cancelled"].map((status) => (
                                    <button
                                      key={status}
                                      onClick={() => handleUpdateStatus(order.id, status)}
                                      className={`px-3 py-1 text-sm rounded ${
                                        order.status?.toLowerCase() === status 
                                          ? 'bg-gray-600 text-white' 
                                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                      }`}
                                    >
                                      {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Payment Status Actions */}
                              <div className="p-3 border rounded-lg bg-white">
                                <h4 className="font-medium mb-2">Update Payment Status</h4>
                                <div className="flex flex-wrap gap-2">
                                  {["pending", "paid", "refunded", "failed"].map((paymentStatus) => (
                                    <button
                                      key={paymentStatus}
                                      onClick={() => handleUpdatePaymentStatus(order.id, paymentStatus)}
                                      className={`px-3 py-1 text-sm rounded ${
                                        order.paymentStatus?.toLowerCase() === paymentStatus 
                                          ? 'bg-gray-600 text-white' 
                                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                      }`}
                                    >
                                      {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;