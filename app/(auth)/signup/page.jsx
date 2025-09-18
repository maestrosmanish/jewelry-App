"use client"
import React, { useState } from 'react';
import { toast } from 'react-toastify';

const AdminForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'admin',
    address: {
      fullName: '',
      phone: '',
      street: '',
      city: '',
      state: '',
      pincode: ''
    },
    isActive: true
  }); 
  console.log(formData);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [showAddress, setShowAddress] = useState(false);
  // const token = localStorage.getItem('adminToken');
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
   console.log(baseUrl)
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Address validation (only if address fields are shown)
    if (showAddress) {
      if (!formData.address.fullName.trim()) {
        newErrors['address.fullName'] = 'Address name is required';
      }
      
      if (!formData.address.phone.trim()) {
        newErrors['address.phone'] = 'Address phone is required';
      } else if (!/^[0-9]{10}$/.test(formData.address.phone)) {
        newErrors['address.phone'] = 'Please enter a valid 10-digit phone number';
      }
      
      if (!formData.address.street.trim()) {
        newErrors['address.street'] = 'Street address is required';
      }
      
      if (!formData.address.city.trim()) {
        newErrors['address.city'] = 'City is required';
      }
      
      if (!formData.address.state.trim()) {
        newErrors['address.state'] = 'State is required';
      }
      
      if (!formData.address.pincode.trim()) {
        newErrors['address.pincode'] = 'Pincode is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleChange = (e) => {
  const { name, value, type, checked } = e.target;

  if (name.startsWith('address.')) {
    const addressField = name.split('.')[1];
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [addressField]: value.trim(), 
      }
    }));
  } else {
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value.trim(),
    }));
  }


  if (errors[name]) {
    setErrors(prev => ({ ...prev, [name]: '' }));
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  setIsSubmitting(true);
  setSubmitStatus(null);

  try {
    const { fullName, password, email, role, phone, isActive, address } = formData;

    // Flatten the payload for backend
    const payload = JSON.stringify({
      name: fullName || "",
      password: password || "",
      email: email || "",
      role: role || "admin",
      phone: phone || "",
      status: isActive,        
      address: address.street || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
      country: "India"           
    });

    console.log("Sending JSON:", payload);

    const response = await fetch(`${baseUrl}/user/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload
    });

    const data = await response.json();

    if (!response.ok) {
      toast.error(data.error || 'Registration failed');
      return;
    }

    setSubmitStatus('success');
    toast.success(data.message || 'Admin created successfully');
    console.log('Admin created successfully:', data);

    // Reset form
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      role: 'admin',
      address: {
        fullName: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        pincode: ''
      },
      isActive: true
    });
    setShowAddress(false);

  } catch (error) {
    setSubmitStatus('error');
    console.error('Registration error:', error);
  } finally {
    setIsSubmitting(false);
  }
};


  return (
    <div className='bg-[#E8EFFF] min-h-screen py-5  flex justify-center items-center '>
    <div className="max-w-3xl p-6 mx-auto space-y-6 overflow-y-auto bg-white shadow-md rounded-xl scrollbar-hide">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800">Admin Registration</h1>
        <p className="text-gray-600">Create a new admin account</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Full Name *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <i className="text-gray-400 fas fa-user"></i>
              </div>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={`pl-10 w-full p-2 border rounded-lg focus:ring-2 focus:outline-none ${
                  errors.fullName 
                    ? 'border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                }`}
                placeholder="Enter full name"
              />
            </div>
            {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>}
          </div>
          
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Email *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <i className="text-gray-400 fas fa-envelope"></i>
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`pl-10 w-full p-2 border rounded-lg focus:ring-2 focus:outline-none ${
                  errors.email 
                    ? 'border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                }`}
                placeholder="Enter email address"
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Phone *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <i className="text-gray-400 fas fa-phone"></i>
              </div>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`pl-10 w-full p-2 border rounded-lg focus:ring-2 focus:outline-none ${
                  errors.phone 
                    ? 'border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                }`}
                placeholder="Enter phone number"
              />
            </div>
            {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
          </div>
          
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Password *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <i className="text-gray-400 fas fa-lock"></i>
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`pl-10 w-full p-2 border rounded-lg focus:ring-2 focus:outline-none ${
                  errors.password 
                    ? 'border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                }`}
                placeholder="Enter password"
              />
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
          </div>
          
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Confirm Password *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <i className="text-gray-400 fas fa-lock"></i>
              </div>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`pl-10 w-full p-2 border rounded-lg focus:ring-2 focus:outline-none ${
                  errors.confirmPassword 
                    ? 'border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                }`}
                placeholder="Confirm password"
              />
            </div>
            {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
          </div>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="isActive" className="block ml-2 text-sm text-gray-700">
            Account is active
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="showAddress"
            checked={showAddress}
            onChange={() => setShowAddress(!showAddress)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="showAddress" className="block ml-2 text-sm text-gray-700">
            Add address information
          </label>
        </div>
        
        {showAddress && (
          <div className="pt-4 mt-4 border-t">
            <h3 className="mb-4 text-lg font-medium text-gray-800">Address Information</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Full Name *</label>
                <input
                  type="text"
                  name="address.fullName"
                  value={formData.address.fullName}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:outline-none ${
                    errors['address.fullName'] 
                      ? 'border-red-500 focus:ring-red-200' 
                      : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                  }`}
                  placeholder="Name for address"
                />
                {errors['address.fullName'] && <p className="mt-1 text-xs text-red-500">{errors['address.fullName']}</p>}
              </div>
              
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Phone *</label>
                <input
                  type="tel"
                  name="address.phone"
                  value={formData.address.phone}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:outline-none ${
                    errors['address.phone'] 
                      ? 'border-red-500 focus:ring-red-200' 
                      : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                  }`}
                  placeholder="Phone for address"
                />
                {errors['address.phone'] && <p className="mt-1 text-xs text-red-500">{errors['address.phone']}</p>}
              </div>
              
              <div className="md:col-span-2">
                <label className="block mb-1 text-sm font-medium text-gray-700">Street Address *</label>
                <input
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:outline-none ${
                    errors['address.street'] 
                      ? 'border-red-500 focus:ring-red-200' 
                      : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                  }`}
                  placeholder="Street address"
                />
                {errors['address.street'] && <p className="mt-1 text-xs text-red-500">{errors['address.street']}</p>}
              </div>
              
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">City *</label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:outline-none ${
                    errors['address.city'] 
                      ? 'border-red-500 focus:ring-red-200' 
                      : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                  }`}
                  placeholder="City"
                />
                {errors['address.city'] && <p className="mt-1 text-xs text-red-500">{errors['address.city']}</p>}
              </div>
              
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">State *</label>
                <input
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:outline-none ${
                    errors['address.state'] 
                      ? 'border-red-500 focus:ring-red-200' 
                      : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                  }`}
                  placeholder="State"
                />
                {errors['address.state'] && <p className="mt-1 text-xs text-red-500">{errors['address.state']}</p>}
              </div>
              
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Pincode *</label>
                <input
                  type="text"
                  name="address.pincode"
                  value={formData.address.pincode}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:outline-none ${
                    errors['address.pincode'] 
                      ? 'border-red-500 focus:ring-red-200' 
                      : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                  }`}
                  placeholder="Pincode"
                />
                {errors['address.pincode'] && <p className="mt-1 text-xs text-red-500">{errors['address.pincode']}</p>}
              </div>
            </div>
          </div>
        )}
        
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 px-4 rounded-lg font-medium flex items-center justify-center ${
            isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          } text-white transition-colors`}
        >
          {isSubmitting ? (
            <>
              <i className="mr-2 fas fa-spinner fa-spin"></i>
              Processing...
            </>
          ) : (
            <>
              <i className="mr-2 fas fa-user-plus"></i>
              Create Account
            </>
          )}
        </button>
        
        {submitStatus === 'success' && (
          <div className="flex items-center p-3 mt-4 text-green-700 bg-green-100 rounded-lg">
            <i className="mr-2 fas fa-check-circle"></i>
            Account created successfully!
          </div>
        )}
        
        {submitStatus === 'error' && (
          <div className="flex items-center p-3 mt-4 text-red-700 bg-red-100 rounded-lg">
            <i className="mr-2 fas fa-exclamation-circle"></i>
            There was an error creating the account. Please try again.
          </div>
        )}
      </form>
    </div>
    </div>
  ); 
};

export default AdminForm;