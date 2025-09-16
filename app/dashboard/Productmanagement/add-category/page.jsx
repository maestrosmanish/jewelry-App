'use client';
import React, { useState, useEffect, useMemo } from "react";
import { FaTrash, FaEdit, FaPlus, FaMinus } from "react-icons/fa";
import { toast } from "react-toastify";

// Centralized API call with token check
const apiCall = async (url, method, token, body = null) => {
  if (!token) throw new Error("Authentication token not found.");

  try {
    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : null,
    });

    const result = await res.json();
    return result;
  } catch (err) {
    console.error("API Error:", err);
    throw new Error("An error occurred during the API call.");
  }
};

const Addcategory = () => {
  const [formData, setFormData] = useState({ name: "" });
  const [subCategoryForm, setSubCategoryForm] = useState({ name: "", parentId: "" });
  const [subChildCategoryForm, setSubChildCategoryForm] = useState({ name: "", parentId: "" });

  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [expandedState, setExpandedState] = useState({});
  const [token, setToken] = useState(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  // Load token once
  useEffect(() => {
    setToken(localStorage.getItem("adminToken"));
  }, []);

  // Fetch categories
  useEffect(() => {
    if (token) fetchCategories();
  }, [token]);

  const fetchCategories = async () => {
    try {
      const result = await apiCall(`${baseUrl}/categories`, "GET", token);
      if (result.categories) {
        setCategories(result.categories);
      } else {
        toast.error(result.error || "Failed to fetch categories");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleInputChange = (e, setter) => {
    const { name, value } = e.target;
    setter((prev) => ({ ...prev, [name]: value }));
  };

  //  Create or update main category
  const handleMainCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = editingCategory
        ? `${baseUrl}/category/${editingCategory.id}`
        : `${baseUrl}/category/main`;

      const result = await apiCall(endpoint, editingCategory ? "PUT" : "POST", token, {
        name: formData.name
      });

      if (result.message) {
        toast.success(result.message);
        fetchCategories();
        setFormData({ name: "" });
        setEditingCategory(null);
      } else {
        toast.error(result.error || "Error saving category");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  //  Create subcategory
  const handleSubCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await apiCall(
        `${baseUrl}/category/subcategory`,
        "POST",
        token,
        {
          name: subCategoryForm.name,
          parentId: parseInt(subCategoryForm.parentId)
        }
      );
      if (result.message) {
        toast.success(result.message);
        fetchCategories();
        setSubCategoryForm({ name: "", parentId: "" });
      } else {
        toast.error(result.error || "Error saving subcategory");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  //  Create sub-child category
  const handleSubChildCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await apiCall(
        `${baseUrl}/category/subchildcategory`,
        "POST",
        token,
        {
          name: subChildCategoryForm.name,
          parentId: parseInt(subChildCategoryForm.parentId)
        }
      );
      if (result.message) {
        toast.success(result.message);
        fetchCategories();
        setSubChildCategoryForm({ name: "", parentId: "" });
      } else {
        toast.error(result.error || "Error saving sub-child category");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  //  Delete category
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category and all its subcategories?")) return;

    try {
      const result = await apiCall(`${baseUrl}/category/${id}`, "DELETE", token);
      if (result.message) {
        toast.success(result.message);
        fetchCategories();
      } else {
        toast.error(result.error || "Error deleting category");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Toggle expand
  const toggleExpansion = (id) => {
    setExpandedState((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  //  Search categories
  const filteredCategories = useMemo(() => {
    if (!search) return categories;
    const lower = search.toLowerCase();

    return categories.filter((cat) => {
      const matchMain = cat.name.toLowerCase().includes(lower);
      if (matchMain) return true;

      const matchSub = cat.subCategories?.some((sub) => {
        const subMatch = sub.name.toLowerCase().includes(lower);
        if (subMatch) return true;
        return sub.subCategories?.some((subChild) =>
          subChild.name.toLowerCase().includes(lower)
        );
      });

      return matchSub;
    });
  }, [categories, search]);

  //  Collect all subcategories for subchild form
  const getAllSubcategories = () => {
    const all = [];
    categories.forEach((cat) => {
      if (cat.subCategories && cat.subCategories.length > 0) {
        cat.subCategories.forEach((sub) => {
          all.push({ id: sub.id, name: `${cat.name} → ${sub.name}` });
        });
      }
    });
    return all;
  };

  return (
    <div className="w-full overflow-y-auto p-6 mt-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Category Management</h1>

      {/* 🔹 Main Category Form */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">
          {editingCategory ? "Edit Category" : "Add New Category"}
        </h2>
        <form onSubmit={handleMainCategorySubmit} className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={(e) => handleInputChange(e, setFormData)}
              placeholder="Enter category name"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
            >
              {editingCategory ? "Update" : "Save"}
            </button>
            {editingCategory && (
              <button
                type="button"
                onClick={() => {
                  setEditingCategory(null);
                  setFormData({ name: "" });
                }}
                className="ml-2 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* 🔹 Subcategory Form */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Add Subcategory</h2>
        <form onSubmit={handleSubCategorySubmit} className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Parent Category <span className="text-red-500">*</span>
            </label>
            <select
              name="parentId"
              value={subCategoryForm.parentId}
              onChange={(e) => handleInputChange(e, setSubCategoryForm)}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Parent Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Subcategory Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={subCategoryForm.name}
              onChange={(e) => handleInputChange(e, setSubCategoryForm)}
              placeholder="Enter subcategory name"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
            >
              Save Subcategory
            </button>
          </div>
        </form>
      </div>

      {/* 🔹 Subchild Form */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Add Sub-child Category</h2>
        <form onSubmit={handleSubChildCategorySubmit} className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Parent Subcategory <span className="text-red-500">*</span>
            </label>
            <select
              name="parentId"
              value={subChildCategoryForm.parentId}
              onChange={(e) => handleInputChange(e, setSubChildCategoryForm)}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Parent Subcategory</option>
              {getAllSubcategories().map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Sub-child Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={subChildCategoryForm.name}
              onChange={(e) => handleInputChange(e, setSubChildCategoryForm)}
              placeholder="Enter sub-child name"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
            >
              Save Sub-child
            </button>
          </div>
        </form>
      </div>

      {/* 🔹 Category List */}
      <div className="bg-white shadow-md rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            placeholder="Search categories..."
            className="border px-3 py-2 rounded-lg text-sm w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filteredCategories.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No categories found</p>
        ) : (
          <div className="space-y-2">
            {filteredCategories.map((cat) => (
              <div key={cat.id} className="border-b border-gray-200 pb-2">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center">
                    {cat.subCategories && cat.subCategories.length > 0 && (
                      <button 
                        onClick={() => toggleExpansion(cat.id)} 
                        className="mr-2 text-gray-500 hover:text-gray-700"
                      >
                        {expandedState[cat.id] ? <FaMinus /> : <FaPlus />}
                      </button>
                    )}
                    <span className="font-semibold text-gray-800">{cat.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="text-blue-500 hover:text-blue-700"
                      onClick={() => {
                        setEditingCategory(cat);
                        setFormData({ name: cat.name });
                      }}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDelete(cat.id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                {/* Subcategories */}
                {expandedState[cat.id] && cat.subCategories && cat.subCategories.map((sub) => (
                  <div key={sub.id} className="ml-8 border-l-2 border-gray-200 pl-4 mt-2">
                    <div className="flex items-center justify-between py-1">
                      <div className="flex items-center">
                        {sub.subCategories && sub.subCategories.length > 0 && (
                          <button
                            onClick={() => toggleExpansion(sub.id)}
                            className="mr-2 text-gray-500 hover:text-gray-700"
                          >
                            {expandedState[sub.id] ? <FaMinus /> : <FaPlus />}
                          </button>
                        )}
                        <span className="text-gray-700">{sub.name}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDelete(sub.id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>

                    {/* Sub-child categories */}
                    {expandedState[sub.id] && sub.subCategories && sub.subCategories.map((child) => (
                      <div key={child.id} className="ml-8 border-l-2 border-gray-200 pl-4 mt-1">
                        <div className="flex items-center justify-between py-1">
                          <span className="text-gray-600">{child.name}</span>
                          <button
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDelete(child.id)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Addcategory;