'use client';
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// A reusable API function to reduce code duplication and centralize error handling
const callApi = async (url, method, token, body = null) => {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = { method, headers, body: body ? JSON.stringify(body) : null };
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `API call failed with status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

const ProductPriceUpdate = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ price: "", discount: "" });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [token, setToken] = useState(null);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  // Fetch token once on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem("adminToken");
    setToken(storedToken);
  }, []);

  // Use useCallback to memoize the function and prevent unnecessary re-creations
  const fetchProducts = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const result = await callApi(`${baseUrl}/product/get`, 'GET', token);
      setProducts(result);
      toast.success("Products loaded successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to load products.");
    } finally {
      setLoading(false);
    }
  }, [baseUrl, token]);

  // Fetch products when the token becomes available
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Use useMemo for efficient filtering
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) {
      return products;
    }
    const query = searchQuery.toLowerCase().trim();
    return products.filter(product =>
      product.name?.toLowerCase().includes(query) ||
      product._id?.toLowerCase().includes(query) ||
      product.brand?.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  const handleEditClick = (product) => {
    setEditingProduct(product._id);
    setFormData({
      price: product.price ?? "",
      discount: product.discount ?? 0
    });
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setFormData({ price: "", discount: "" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (productId) => {
    if (!formData.price && !formData.discount) {
      return toast.error("Please enter either a price or a discount.");
    }

    setUpdating(true);
    const updateData = {};
    if (formData.price !== "") updateData.price = parseFloat(formData.price);
    if (formData.discount !== "") updateData.discount = parseFloat(formData.discount);

    try {
      await callApi(`${baseUrl}/product/update/${productId}`, 'PATCH', token, updateData);
      toast.success("Product updated successfully!");
      setEditingProduct(null);
      setFormData({ price: "", discount: "" });
      fetchProducts();
    } catch (error) {
      toast.error(error.message || "Update failed.");
    } finally {
      setUpdating(false);
    }
  };

  const calculateDiscountedPrice = (price, discount) => {
    const priceNum = Number(price) || 0;
    const discNum = Number(discount) || 0;
    return Math.max(0, priceNum - (priceNum * discNum) / 100);
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
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Update Product Prices & Discounts</h1>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Search Products</label>
          <div className="relative max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product name, ID, or brand..."
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
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-600">
            Showing {filteredProducts.length} of {products.length} products
          </div>
          {searchQuery && (
            <div className="text-sm text-blue-600">
              Searching for: "{searchQuery}"
            </div>
          )}
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          {searchQuery ? (
            <>
              <p className="text-gray-500 text-lg">No products found matching your search</p>
              <button
                onClick={clearSearch}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Clear Search
              </button>
            </>
          ) : (
            <p className="text-gray-500 text-lg">No products found</p>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Final Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-md mr-3"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center mr-3">
                            <span className="text-xs text-gray-500">No Image</span>
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.brand}</div>
                          <div className="text-xs text-gray-400">ID: {product?._id?.slice(-8)}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingProduct === product._id ? (
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          placeholder="New price"
                          className="w-24 border border-gray-300 rounded px-2 py-1 text-sm"
                          min="0"
                          step="0.01"
                        />
                      ) : (
                        <div className="text-sm font-medium text-gray-900">₹{product.price?.toFixed(2)}</div>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingProduct === product._id ? (
                        <input
                          type="number"
                          name="discount"
                          value={formData.discount}
                          onChange={handleInputChange}
                          placeholder="Discount %"
                          className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                          min="0"
                          max="100"
                        />
                      ) : (
                        <div className="text-sm text-gray-900">{product.discount ?? 0}%</div>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">
                        ₹{calculateDiscountedPrice(
                          editingProduct === product._id ? formData.price || product.price : product.price,
                          editingProduct === product._id ? formData.discount || product.discount : product.discount
                        ).toFixed(2)}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editingProduct === product._id ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleSubmit(product._id)}
                            disabled={updating}
                            className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 disabled:opacity-50"
                          >
                            {updating ? "Saving..." : "Save"}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-3 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEditClick(product)}
                          className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">Instructions:</h3>
        <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
          <li>You can update either price, discount, or both.</li>
          <li>Leave a field empty to keep its current value.</li>
          <li>Discount must be between 0-100%.</li>
          <li>Final price is calculated automatically.</li>
        </ul>
      </div>
    </div>
  );
};

export default ProductPriceUpdate;