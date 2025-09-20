"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { FaEye, FaLock, FaUnlock, FaSearch, FaTimes, FaUserShield, FaUser, FaEdit, FaTrash, FaSignOutAlt, FaEnvelope } from "react-icons/fa";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [token, setToken] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [otpData, setOtpData] = useState({ userId: "", otp: "" });
  const [showLogin, setShowLogin] = useState(true);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  // Check if user is logged in on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem("adminToken");
    if (storedToken) {
      setToken(storedToken);
      setIsLoggedIn(true);
      fetchUsers(storedToken);
    }
  }, []);

  // Memoized filtered users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = searchQuery 
        ? user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.phone?.includes(searchQuery)
        : true;
      
      const matchesStatus = statusFilter !== "all" 
        ? (statusFilter === "active" ? user.isActive : !user.isActive)
        : true;
      
      const matchesRole = roleFilter !== "all" 
        ? user.role === roleFilter
        : true;
      
      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [users, searchQuery, statusFilter, roleFilter]);

  // Memoized pagination data
  const paginationData = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    
    return { currentUsers, totalPages, indexOfFirstItem, indexOfLastItem };
  }, [filteredUsers, currentPage, itemsPerPage]);

  const fetchUsers = useCallback(async (authToken) => {
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/users`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch users');

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
     // user login 
    try {
      const response = await fetch(`${baseUrl}/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setOtpData({ ...otpData, userId: data.userId });
      setShowLogin(false);
      toast.info("OTP sent to your email");
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    //otp verification 
    try {
      const response = await fetch(`${baseUrl}/user/verifyotp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(otpData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'OTP verification failed');
      }

      localStorage.setItem("adminToken", data.token);
      setToken(data.token);
      setIsLoggedIn(true);
      fetchUsers(data.token);
      toast.success("Login successful!");
    } catch (error) {
      console.error("OTP error:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = useCallback(async (userId, currentStatus) => {
    //update user status
    try {
      const newStatus = !currentStatus; 
      console.log(userId, newStatus);
      const response = await fetch(`${baseUrl}/admin/users/${userId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: newStatus })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Status update failed");
      }

      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, isActive: newStatus } : user
        )
      );
      toast.success(`User ${newStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.message);
    }
  }, [baseUrl, token]);

  const handleRoleChange = useCallback(async (userId, newRole) => { 

    //update user role
    try {
      const response = await fetch(`${baseUrl}/admin/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Role update failed");
      }

      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
      toast.success("Role updated successfully");
    } catch (error) {
      console.error("Role update error:", error);
      toast.error(error.message);
    }
  }, [baseUrl, token]);
//delete user
  const handleDeleteUser = useCallback(async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    
    try {
      const response = await fetch(`${baseUrl}/user/${userId}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Delete failed");
      }

      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      toast.success("User deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.message);
    }
  }, [baseUrl, token]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setToken(null);
    setIsLoggedIn(false);
    setUsers([]);
    setShowLogin(true);
    toast.info("Logged out successfully");
  };

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setStatusFilter("all");
    setRoleFilter("all");
    setCurrentPage(1);
  }, []);

  const handleItemsPerPageChange = useCallback((e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  }, []);

  // if (!isLoggedIn) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
  //       <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 space-y-6">
  //         <div className="text-center">
  //           <h1 className="text-2xl font-bold text-gray-800">
  //             {showLogin ? 'Admin Login' : 'OTP Verification'}
  //           </h1>
  //           <p className="text-gray-600">
  //             {showLogin ? 'Access your admin dashboard' : 'Enter the OTP sent to your email'}
  //           </p>
  //         </div>
          
  //         {showLogin ? (
  //           <form onSubmit={handleLogin} className="space-y-4">
  //             <div>
  //               <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
  //               <input
  //                 type="email"
  //                 value={loginData.email}
  //                 onChange={(e) => setLoginData({...loginData, email: e.target.value})}
  //                 className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
  //                 placeholder="Enter your email"
  //                 required
  //               />
  //             </div>
              
  //             <div>
  //               <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
  //               <input
  //                 type="password"
  //                 value={loginData.password}
  //                 onChange={(e) => setLoginData({...loginData, password: e.target.value})}
  //                 className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
  //                 placeholder="Enter your password"
  //                 required
  //               />
  //             </div>
              
  //             <button
  //               type="submit"
  //               disabled={loading}
  //               className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50"
  //             >
  //               {loading ? 'Signing in...' : 'Sign In'}
  //             </button>
  //           </form>
  //         ) : (
  //           <form onSubmit={handleVerifyOtp} className="space-y-4">
  //             <div>
  //               <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
  //               <input
  //                 type="text"
  //                 value={otpData.otp}
  //                 onChange={(e) => setOtpData({...otpData, otp: e.target.value})}
  //                 className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
  //                 placeholder="Enter 6-digit OTP"
  //                 required
  //               />
  //             </div>
              
  //             <button
  //               type="submit"
  //               disabled={loading}
  //               className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50"
  //             >
  //               {loading ? 'Verifying...' : 'Verify OTP'}
  //             </button>
              
  //             <button
  //               type="button"
  //               onClick={() => setShowLogin(true)}
  //               className="w-full text-blue-600 py-2 rounded-md font-medium hover:text-blue-700"
  //             >
  //               Back to login
  //             </button>
  //           </form>
  //         )}
  //       </div>
  //       <ToastContainer position="top-right" autoClose={3000} />
  //     </div>
  //   );
  // }

  // if (loading && users.length === 0) {
  //   return (
  //     <div className="flex justify-center items-center h-64">
  //       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  //     </div>
  //   );
  // }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-md hover:bg-red-200"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
        <p className="text-gray-600">Manage your users, their roles and status</p>
        
        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm mt-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search Users</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, email, phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Items Per Page</label>
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginationData.currentUsers.map((user) => (
                <UserRow 
                  key={user.id} 
                  user={user} 
                  onStatusToggle={handleStatusToggle}
                  onRoleChange={handleRoleChange}
                  onDeleteUser={handleDeleteUser}
                />
              ))}
            </tbody>
          </table>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FaUser className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2">No users found matching your criteria</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {paginationData.totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{paginationData.indexOfFirstItem + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(paginationData.indexOfLastItem, filteredUsers.length)}
              </span> of <span className="font-medium">{filteredUsers.length}</span> users
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm">
                Page {currentPage} of {paginationData.totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, paginationData.totalPages))}
                disabled={currentPage === paginationData.totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// User Row Component
const UserRow = React.memo(({ user, onStatusToggle, onRoleChange, onDeleteUser }) => {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {user.name || 'Unknown User'}
            </div>
            <div className="text-sm text-gray-500">
              ID: {user.id}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900">{user.email}</div>
        <div className="text-sm text-gray-500">{user.phone || 'No phone'}</div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900">
          {user.city && `${user.city}, `}{user.state}
        </div>
        <div className="text-sm text-gray-500">
          {user.country} {user.pincode && `(${user.pincode})`}
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          user.isActive 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {user.isActive ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="px-6 py-4">
        <select
          value={user.role}
          onChange={(e) => onRoleChange(user.id, e.target.value)}
          className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">
        {new Date(user.createdAt).toLocaleDateString('en-US')}
      </td>
      <td className="px-6 py-4">
        <div className="flex space-x-2">
          <button
            onClick={() => onStatusToggle(user.id, user.isActive)}
            className={`p-2 rounded ${
              user.isActive 
                ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                : 'bg-green-100 text-green-600 hover:bg-green-200'
            }`}
            title={user.isActive ? 'Deactivate' : 'Activate'}
          >
            {user.isActive ? <FaLock /> : <FaUnlock />}
          </button>
          <button
            onClick={() => onDeleteUser(user.id)}
            className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
            title="Delete User"
          >
            <FaTrash />
          </button>
        </div>
      </td>
    </tr>
  );
});

UserRow.displayName = 'UserRow';

export default UserTable;