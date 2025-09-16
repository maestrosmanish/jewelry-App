'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaTrash, FaPlus, FaCamera } from 'react-icons/fa';

// Custom hook to handle category fetching logic (no changes here)
const useFetchCategories = (baseUrl, token) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!token) return;

      try {
        setLoading(true);
        const response = await fetch(`${baseUrl}/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }

        const result = await response.json(); 
     
        setCategories(result.categories);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err.message);
        toast.error('Categories Fetching Failed');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [baseUrl, token]);

  return { categories, loading, error };
};

// Main component with UI improvements
export default function AddProduct({ userId, onSubmitProduct }) {


  const [form, setForm] = useState({
    name: '',
    description: '',
    overview: '',
    price: '',
    discount: 0,
    quantity: 0,
    status: 'in-stock',
    images: [null],
    category: '',
    subCategory: '',
    subChildCategory: '',
    metalType: '',
    purity: '',
    weight: '',
    stoneDetails: [{ stoneType: '', carat: '', color: '', clarity: '' }],
    size: '',
    gender: 'Unisex',
    occasion: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const [token, setToken] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(); 

  useEffect(() => {
    setCurrentUserId(localStorage.getItem("userId"));
      setToken(localStorage.getItem('adminToken'));
  },[])

const { categories, loading: categoriesLoading, error: categoriesError } = useFetchCategories(baseUrl, token);

// SubCategories
const subCategories = useMemo(() => {
  if (!categories?.length || !form.category) return [];
  const category = categories.find(cat => cat.id === Number(form.category));
  return category?.subCategories?.filter(subCat => !subCat.isDeleted) || [];
}, [categories, form.category]);

// SubChild Categories 
const subChildCategories = useMemo(() => {
  if (!categories?.length || !form.category || !form.subCategory) return [];
  const category = categories.find(cat => cat.id === Number(form.category));
  const subCategory = category?.subCategories?.find(subCat => subCat.id === Number(form.subCategory));
  return subCategory?.subCategories?.filter(childCat => !childCat.isDeleted) || [];
}, [categories, form.category, form.subCategory]);

// Discounted Price
const discountedPrice = useMemo(() => {
  const priceNum = Number(form.price) || 0;
  const discNum = Number(form.discount) || 0;
  return Math.max(0, priceNum - (priceNum * discNum) / 100);
}, [form.price, form.discount]);


  const stockMessage = useMemo(() => {
    const q = Number(form.quantity) || 0;
    if (q <= 0) return 'Out of stock';
    if (q < 10) return `${q} left in stock`;
    return 'In stock';
  }, [form.quantity]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
   

    
  const handleNumChange = (e) => {
    const { name, value } = e.target;
    const cleanedValue = value === '' ? '' : Number(value);
    setForm((prev) => ({ ...prev, [name]: cleanedValue }));
  };

  const handleImageChange = (idx, file) => {
    setForm((prev) => {
      const newImages = [...prev.images];
      newImages[idx] = file;
      return { ...prev, images: newImages };
    });
  };

  const handleStoneDetailChange = (idx, field, value) => {
    setForm((prev) => {
      const newStoneDetails = [...prev.stoneDetails];
      newStoneDetails[idx] = { ...newStoneDetails[idx], [field]: value };
      return { ...prev, stoneDetails: newStoneDetails };
    });
  };

  const addImage = () => setForm((prev) => ({ ...prev, images: [...prev.images, null] }));
  const removeImage = (idx) =>
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));

  const addStoneDetail = () =>
    setForm((prev) => ({
      ...prev,
      stoneDetails: [...prev.stoneDetails, { stoneType: '', carat: '', color: '', clarity: '' }],
    }));

  const removeStoneDetail = (idx) =>
    setForm((prev) => ({
      ...prev,
      stoneDetails: prev.stoneDetails.filter((_, i) => i !== idx),
    }));

  const validate = () => {
    const e = {};
    if (!form.name?.trim()) e.name = 'Product name is required';
    if (!form.description?.trim()) e.description = 'Description is required';
    if (form.price === '' || Number(form.price) < 0) e.price = 'Valid price is required';
    if (Number(form.discount) < 0 || Number(form.discount) > 100) e.discount = 'Discount must be 0-100';
    if (Number(form.quantity) < 0) e.quantity = 'Quantity cannot be negative';
    if (!currentUserId) e.user = 'User (seller) id missing';
    if (!form.category) e.category = 'Category is required';
    if (!form.metalType) e.metalType = 'Metal type is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fill all required fields correctly!');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (key === 'images') {
          value.forEach((file) => file && formData.append('images', file));
        } else if (key === 'stoneDetails') {
          const validStones = value.filter(
            (stone) => stone.stoneType || stone.carat || stone.color || stone.clarity
          );
          formData.append('stoneDetails', JSON.stringify(validStones));
        } else {
          formData.append(key, value);
        }
      });


      const res = await fetch(`${baseUrl}/product/post`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json(); 

      if (!res.ok) {
        throw new Error(data?.message || 'Product creation failed');
      }

      toast.success('Product successfully created!');
      setForm({
        name: '', description: '', overview: '', price: '', discount: 0, quantity: 0, status: 'in-stock',
        images: [null], category: '', subCategory: '', subChildCategory: '', metalType: '', purity: '', weight: '',
        stoneDetails: [{ stoneType: '', carat: '', color: '', clarity: '' }],
        size: '', gender: 'Unisex', occasion: '',
      });

      if (onSubmitProduct) {
        onSubmitProduct(data);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Something went wrong!');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-8">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden p-6 sm:p-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Add New Product 💎</h2>
        </div>
        <form onSubmit={handleSubmit}>
          {/* General Information Section */}
          <div className="space-y-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-800">General Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name <span className="text-red-500">*</span></label>
                <input name="name" value={form.name} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 h-11 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" placeholder="e.g., Diamond Solitaire Ring" />
                {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) <span className="text-red-500">*</span></label>
                <input type="number" name="price" value={form.price} onChange={handleNumChange} className="w-full border border-gray-300 rounded-lg px-4 h-11 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" placeholder="0.00" min="0" step="0.01" />
                {errors.price && <p className="text-xs text-red-600 mt-1">{errors.price}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                <input type="number" name="discount" value={form.discount} onChange={handleNumChange} className="w-full border border-gray-300 rounded-lg px-4 h-11 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" placeholder="0" min="0" max="100" />
                {errors.discount && <p className="text-xs text-red-600 mt-1">{errors.discount}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input type="number" name="quantity" value={form.quantity} onChange={handleNumChange} className="w-full border border-gray-300 rounded-lg px-4 h-11 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" placeholder="0" min="0" />
                {errors.quantity && <p className="text-xs text-red-600 mt-1">{errors.quantity}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
                <textarea name="description" value={form.description} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-3 min-h-[120px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-y" placeholder="Full product description..." />
                {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Overview</label>
                <textarea name="overview" value={form.overview} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-3 min-h-[120px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-y" placeholder="Short product summary..." />
              </div>
            </div>
          </div>
          <hr className="border-gray-200 mb-8" />
          
          {/* Categorization & Details Section */}
          <div className="space-y-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-800">Categorization & Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>


             <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 h-11 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white appearance-none pr-8"
              >
                <option value="">Select Category</option>
                {categoriesLoading ? (
                  <option disabled>Loading...</option>
                ) : (
                  (categories || []) // safe fallback
                    .filter((cat) => !cat.isDeleted)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))
                )}
              </select>

                {errors.category && <p className="text-xs text-red-600 mt-1">{errors.category}</p>}


              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
              <select
                  name="subCategory"
                  value={form.subCategory}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 h-11 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white appearance-none pr-8"
                  disabled={!form.category}
                >
                  <option value="">Select Subcategory</option>
                  {subCategories.map((subCat) => (
                    <option key={subCat.id} value={subCat.id}>
                      {subCat.name}
                    </option>
                  ))}
                </select>


              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sub-child Category</label>
                <select name="subChildCategory" value={form.subChildCategory} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 h-11 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white appearance-none pr-8" disabled={!form.subCategory}>
                  <option value="">Select Sub-child Category</option>
                  {subChildCategories.map((childCat, index) => (
                    <option key={index} value={index}>
                      {childCat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Metal Type <span className="text-red-500">*</span></label>
                <select name="metalType" value={form.metalType} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 h-11 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white appearance-none pr-8">
                  <option value="">Select Metal Type</option>
                  <option value="Gold">Gold</option>
                  <option value="Silver">Silver</option>
                  <option value="Platinum">Platinum</option>
                  <option value="Diamond">Diamond</option>
                  <option value="Other">Other</option>
                </select>
                {errors.metalType && <p className="text-xs text-red-600 mt-1">{errors.metalType}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purity</label>
                <input name="purity" value={form.purity} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 h-11 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" placeholder="e.g., 24K, Sterling" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight (grams)</label>
                <input type="number" name="weight" value={form.weight} onChange={handleNumChange} className="w-full border border-gray-300 rounded-lg px-4 h-11 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" placeholder="0.00" min="0" step="0.01" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                <input name="size" value={form.size} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 h-11 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" placeholder="e.g., US 7, 18, Medium" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select name="gender" value={form.gender} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 h-11 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white appearance-none pr-8">
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Unisex">Unisex</option>
                  <option value="Kids">Kids</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Occasion</label>
                <select name="occasion" value={form.occasion} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 h-11 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white appearance-none pr-8">
                  <option value="">Select Occasion</option>
                  <option value="wedding">Wedding</option>
                  <option value="anniversary">Anniversary</option>
                  <option value="birthday">Birthday</option>
                  <option value="dailywear">Daily Wear</option>
                </select>
              </div>
            </div>
          </div>
          <hr className="border-gray-200 mb-8" />
          
          {/* Stone Details Section */}
          <div className="space-y-4 mb-8">
            <h3 className="text-xl font-semibold text-gray-800">Stone Details</h3>
            {form.stoneDetails.map((stone, idx) => (
              <div key={idx} className="bg-gray-50 p-4 rounded-xl shadow-inner border border-gray-200">
                <div className="flex items-center justify-end mb-2">
                  {form.stoneDetails.length > 1 && (
                    <button type="button" onClick={() => removeStoneDetail(idx)} className="text-red-500 hover:text-red-700 transition-colors" title="Remove Stone">
                      <FaTrash size={16} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Stone Type</label>
                    <input value={stone.stoneType} onChange={(e) => handleStoneDetailChange(idx, 'stoneType', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-2 text-sm focus:ring-1 focus:ring-blue-500 transition-colors" placeholder="e.g., Diamond, Ruby" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Carat</label>
                    <input type="number" value={stone.carat} onChange={(e) => handleStoneDetailChange(idx, 'carat', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-2 text-sm focus:ring-1 focus:ring-blue-500 transition-colors" placeholder="0.00" min="0" step="0.01" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Color</label>
                    <input value={stone.color} onChange={(e) => handleStoneDetailChange(idx, 'color', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-2 text-sm focus:ring-1 focus:ring-blue-500 transition-colors" placeholder="e.g., G, H" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Clarity</label>
                    <input value={stone.clarity} onChange={(e) => handleStoneDetailChange(idx, 'clarity', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-2 text-sm focus:ring-1 focus:ring-blue-500 transition-colors" placeholder="e.g., VVS1, VS2" />
                  </div>
                </div>
              </div>
            ))}
            <button type="button" onClick={addStoneDetail} className="flex items-center gap-2 text-blue-600 font-medium hover:text-blue-800 transition-colors">
              <FaPlus size={12} /> Add Stone Details
            </button>
          </div>
          <hr className="border-gray-200 mb-8" />
          
          {/* Images Section */}
          <div className="space-y-4 mb-8">
            <h3 className="text-xl font-semibold text-gray-800">Product Images</h3>
            <p className="text-sm text-gray-600">You can upload up to 5 images.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {form.images.map((file, idx) => (
                <div key={idx} className="relative group border border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
                  <input id={`image-upload-${idx}`} type="file" accept="image/*" onChange={(e) => handleImageChange(idx, e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  <FaCamera size={24} className="text-gray-400 group-hover:text-blue-500" />
                  {file ? (
                    <div className="mt-2 text-center">
                      <p className="text-sm font-medium text-gray-800 truncate w-32">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-gray-500">Click to upload</p>
                  )}
                  {form.images.length > 1 && (
                    <button type="button" onClick={() => removeImage(idx)} className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity" title="Remove Image">
                      <FaTrash size={12} />
                    </button>
                  )}
                </div>
              ))}
              {form.images.length < 5 && (
                <button type="button" onClick={addImage} className="border border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors">
                  <FaPlus size={20} />
                  <span className="mt-2 text-sm">Add Image</span>
                </button>
              )}
            </div>
          </div>
          <hr className="border-gray-200 mb-8" />
          
          {/* Summary & Actions Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-4 rounded-xl shadow-md border bg-blue-50 text-blue-900">
              <div className="text-sm font-medium">Discounted Price</div>
              <div className="text-2xl font-bold">₹ {discountedPrice.toFixed(2)}</div>
            </div>
            <div className="p-4 rounded-xl shadow-md border bg-green-50 text-green-900">
              <div className="text-sm font-medium">Stock Status</div>
              <div className="text-lg font-semibold">{stockMessage}</div>
            </div>
            <div className="p-4 rounded-xl shadow-md border bg-gray-50 text-gray-900">
              <div className="text-sm font-medium">Seller ID</div>
              <div className="text-sm break-all font-mono">{currentUserId}</div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <button type="submit" disabled={submitting} className="flex-1 sm:flex-none px-6 h-12 rounded-xl font-semibold bg-blue-600 text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {submitting ? 'Saving...' : 'Save Product'}
            </button>
            <button
              type="button"
              onClick={() =>
                setForm({
                  name: '', description: '', overview: '', price: '', discount: 0, quantity: 0, status: 'in-stock',
                  images: [null], category: '', subCategory: '', subChildCategory: '', metalType: '', purity: '', weight: '',
                  stoneDetails: [{ stoneType: '', carat: '', color: '', clarity: '' }],
                  size: '', gender: 'Unisex', occasion: '',
                })
              }
              className="flex-1 sm:flex-none px-6 h-12 rounded-xl font-semibold border border-gray-300 text-gray-800 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}