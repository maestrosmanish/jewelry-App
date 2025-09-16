'use client';
import React, { useState, useEffect } from "react";
import { FaArrowLeft, FaEnvelope, FaPhone, FaMapMarkerAlt, FaUser, FaEdit, FaTrash } from "react-icons/fa";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UserDetails = ({ userId, onBack }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const storedToken = localStorage.getItem("adminToken");
    setToken(storedToken);
  }, []);

  useEffect(() => {
    if (token && userId) {
      fetchUserDetails();
    }
  }, [token, userId]);

  const fetchUserDetails = async () => {
    setLoading(true);
    
    try {
      const response = await fetch(`${baseUrl}/users`, {
        headers: { 
          "Authorization": `Bearer ${token}`,
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }
      
      const users = await response.json(); 
      console.log(users);
      const userData = users.find(u => u.id === parseInt(userId));
      
      if (userData) {
        setUser(userData);
        setEditData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          address: userData.address || '',
          city: userData.city || '',
          state: userData.state || '',
          pincode: userData.pincode || '',
          country: userData.country || ''
        });
      } else {
        throw new Error("User not found");
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      toast.error("Failed to load user details!");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    try {
      const response = await fetch(`${baseUrl}/user/${userId}`, {
        method: "PUT",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(editData)
      });
      
      if (!response.ok) {
        throw new Error(`Update failed: ${response.status}`);
      }
      
      const updatedUser = await response.json();
      setUser(updatedUser.updateUser);
      setEditing(false);
      toast.success("User updated successfully!");
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user!");
    }
  };

  const handleDeleteUser = async () => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    
    try {
      const response = await fetch(`${baseUrl}/user/${userId}`, {
        method: "DELETE",
        headers: { 
          "Authorization": `Bearer ${token}`,
        }
      });
      
      if (!response.ok) {
        throw new Error(`Delete failed: ${response.status}`);
      }
      
      toast.success("User deleted successfully!");
      onBack(); // Go back to users list
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user!");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <ToastContainer position="top-right" autoClose={3000} />
        <button
          onClick={onBack}
          className="flex items-center text-blue-500 hover:text-blue-700 mb-6"
        >
          <FaArrowLeft className="mr-2" />
          Back to Users
        </button>
        
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 text-lg mb-4">
            User not found
          </p>
          <button
            onClick={fetchUserDetails}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-blue-500 hover:text-blue-700"
        >
          <FaArrowLeft className="mr-2" />
          Back to Users
        </button>
        
        <div className="flex space-x-2">
          {!editing ? (
            <>
              <button
                onClick={() => setEditing(true)}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                <FaEdit className="mr-2" />
                Edit
              </button>
              <button
                onClick={handleDeleteUser}
                className="flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                <FaTrash className="mr-2" />
                Delete
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleUpdateUser}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
          <div className="flex items-center">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl font-bold">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="ml-6">
              <h1 className="text-2xl font-bold">{user.name || 'Unknown User'}</h1>
              <p className="text-blue-100 capitalize">{user.role || 'user'} • {user.status ? 'Active' : 'Inactive'}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <FaUser className="mr-2 text-blue-500" />
                Personal Information
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Name</label>
                  {editing ? (
                    <input
                      type="text"
                      name="name"
                      value={editData.name}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                    />
                  ) : (
                    <p className="text-gray-900">{user.name || 'N/A'}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600">Email</label>
                  {editing ? (
                    <input
                      type="email"
                      name="email"
                      value={editData.email}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                    />
                  ) : (
                    <p className="text-gray-900 flex items-center">
                      <FaEnvelope className="mr-2 text-gray-400" />
                      {user.email || 'N/A'}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600">Phone</label>
                  {editing ? (
                    <input
                      type="text"
                      name="phone"
                      value={editData.phone}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                    />
                  ) : (
                    <p className="text-gray-900 flex items-center">
                      <FaPhone className="mr-2 text-gray-400" />
                      {user.phone || 'N/A'}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600">User ID</label>
                  <p className="text-gray-900 text-sm font-mono">{user.id}</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                Account Information
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Role</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600">Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.status 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.status ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600">Joined Date</label>
                  <p className="text-gray-900">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <FaMapMarkerAlt className="mr-2 text-red-500" />
              Address Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Address</label>
                {editing ? (
                  <input
                    type="text"
                    name="address"
                    value={editData.address}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                  />
                ) : (
                  <p className="text-gray-900">{user.address || 'N/A'}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600">City</label>
                {editing ? (
                  <input
                    type="text"
                    name="city"
                    value={editData.city}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                  />
                ) : (
                  <p className="text-gray-900">{user.city || 'N/A'}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600">State</label>
                {editing ? (
                  <input
                    type="text"
                    name="state"
                    value={editData.state}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                  />
                ) : (
                  <p className="text-gray-900">{user.state || 'N/A'}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600">Pincode</label>
                {editing ? (
                  <input
                    type="text"
                    name="pincode"
                    value={editData.pincode}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                  />
                ) : (
                  <p className="text-gray-900">{user.pincode || 'N/A'}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600">Country</label>
                {editing ? (
                  <input
                    type="text"
                    name="country"
                    value={editData.country}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                  />
                ) : (
                  <p className="text-gray-900">{user.country || 'N/A'}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;