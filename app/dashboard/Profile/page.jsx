'use client';
import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaSave, FaTimes, FaKey, FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AdminProfile() {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [token, setToken] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const storedToken = localStorage.getItem("adminToken");
    setToken(storedToken);
  }, []);

  useEffect(() => {
    if (token) {
      fetchAdminProfile();
    }
  }, [token]);

  const fetchAdminProfile = async () => {
    try {
      // Decode the token to get user ID
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const userId = tokenData.userId;
      
      // Fetch all users and find the admin
      const response = await fetch(`${baseUrl}/users`, {
        headers: { 
          "Authorization": `Bearer ${token}`,
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }
      
      const users = await response.json();
      const adminData = users.find(u => u.id === userId);
      
      if (adminData) {
        setAdmin(adminData);
        setFormData({
          name: adminData.name || '',
          email: adminData.email || '',
          phone: adminData.phone || '',
          address: adminData.address || '',
          city: adminData.city || '',
          state: adminData.state || '',
          pincode: adminData.pincode || '',
          country: adminData.country || ''
        });
      } else {
        throw new Error("Admin profile not found");
      }
    } catch (error) {
      console.error("Error fetching admin profile:", error);
      toast.error("Failed to load admin profile!");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleUpdateProfile = async () => {
    try {
      const response = await fetch(`${baseUrl}/user/${admin.id}`, {
        method: "PUT",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error(`Update failed: ${response.status}`);
      }
      
      const updatedUser = await response.json();
      setAdmin(updatedUser.updateUser);
      setEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile!");
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match!");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long!");
      return;
    }

    try {
      // Update password
      const updateResponse = await fetch(`${baseUrl}/user/${admin.id}`, {
        method: "PUT",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          password: passwordData.newPassword
        })
      });
      
      if (!updateResponse.ok) {
        throw new Error(`Password update failed: ${updateResponse.status}`);
      }
      
      setChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      toast.success("Password changed successfully!");
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(error.message || "Failed to change password!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Admin Profile Not Found</h2>
          <p className="text-gray-600">Please contact system administrator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-xl font-bold">
                  {admin.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="ml-4">
                  <h1 className="text-2xl font-bold">{admin.name}</h1>
                  <p className="text-blue-100">Administrator</p>
                </div>
              </div>
              
              {!editing && !changingPassword && (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-md transition-colors"
                >
                  <FaEdit className="mr-2" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Profile Information */}
          <div className="p-6">
            {changingPassword ? (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <FaKey className="mr-2 text-blue-500" />
                  Change Password
                </h2>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <div className="relative">
                      <input
                        type={showPassword.new ? "text" : "password"}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword.new ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showPassword.confirm ? "text" : "password"}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword.confirm ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handleChangePassword}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    <FaSave className="inline mr-2" />
                    Save Password
                  </button>
                  <button
                    onClick={() => {
                      setChangingPassword(false);
                      setPasswordData({
                        newPassword: '',
                        confirmPassword: ''
                      });
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                  >
                    <FaTimes className="inline mr-2" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <FaUser className="mr-2 text-blue-500" />
                    Personal Information
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Full Name</label>
                      {editing ? (
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                        />
                      ) : (
                        <p className="text-gray-900 mt-1">{admin.name}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Email</label>
                      {editing ? (
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                        />
                      ) : (
                        <p className="text-gray-900 mt-1 flex items-center">
                          <FaEnvelope className="mr-2 text-gray-400" />
                          {admin.email}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Phone</label>
                      {editing ? (
                        <input
                          type="text"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                        />
                      ) : (
                        <p className="text-gray-900 mt-1 flex items-center">
                          <FaPhone className="mr-2 text-gray-400" />
                          {admin.phone || 'Not provided'}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-600">User ID</label>
                      <p className="text-gray-900 text-sm font-mono mt-1">{admin.id}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Role</label>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                        {admin.role}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-red-500" />
                    Address Information
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Address</label>
                      {editing ? (
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                        />
                      ) : (
                        <p className="text-gray-900 mt-1">{admin.address || 'Not provided'}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-600">City</label>
                      {editing ? (
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                        />
                      ) : (
                        <p className="text-gray-900 mt-1">{admin.city || 'Not provided'}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-600">State</label>
                      {editing ? (
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                        />
                      ) : (
                        <p className="text-gray-900 mt-1">{admin.state || 'Not provided'}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Pincode</label>
                      {editing ? (
                        <input
                          type="text"
                          name="pincode"
                          value={formData.pincode}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                        />
                      ) : (
                        <p className="text-gray-900 mt-1">{admin.pincode || 'Not provided'}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Country</label>
                      {editing ? (
                        <input
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                        />
                      ) : (
                        <p className="text-gray-900 mt-1">{admin.country || 'Not provided'}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {!changingPassword && (
              <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-gray-200">
                {editing ? (
                  <>
                    <button
                      onClick={handleUpdateProfile}
                      className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      <FaSave className="mr-2" />
                      Save Changes
                    </button>
                    <button
                      onClick={() => {
                        setEditing(false);
                        setFormData({
                          name: admin.name || '',
                          email: admin.email || '',
                          phone: admin.phone || '',
                          address: admin.address || '',
                          city: admin.city || '',
                          state: admin.state || '',
                          pincode: admin.pincode || '',
                          country: admin.country || ''
                        });
                      }}
                      className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                    >
                      <FaTimes className="mr-2" />
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setChangingPassword(true)}
                    className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                  >
                    <FaKey className="mr-2" />
                    Change Password
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}