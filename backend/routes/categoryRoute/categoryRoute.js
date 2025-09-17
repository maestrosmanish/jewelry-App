import { Router } from 'express';
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from '../../middlewares/authMiddleware/authMiddleware.js';
import { isAdmin } from '../../middlewares/adminMiddleware/isAdmin.js';
import upload from '../../utils/multer.js';

const CategoryRoute = Router();
const prisma = new PrismaClient();

// Get all categories with hierarchy
CategoryRoute.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { parentId: null },
      include: {
        subCategories: {
          include: {
            subCategories: true
          }
        }
      }
    });
    
    res.status(200).json({ categories });
  } catch(error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: "Error fetching categories!" });
  }
});

// Create main category
CategoryRoute.post('/category/main', upload.none(), authMiddleware, isAdmin, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Category name is required!" });
    }

    // Check if category already exists
    const existingCategory = await prisma.category.findFirst({
      where: { 
        name,
        parentId: null
      }
    });
    
    if (existingCategory) {
      return res.status(400).json({ error: "Category already exists!" });
    }

    const category = await prisma.category.create({
      data: { 
        name
      }
    });

    res.status(201).json({ 
      message: "Category created successfully!",
      category 
    });
  } catch(error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: "Error creating category!" });
  }
});

// Create subcategory
CategoryRoute.post('/category/subcategory', upload.none(), authMiddleware, isAdmin, async (req, res) => {
  try {
    const { name, parentId } = req.body;

    if (!name || !parentId) {
      return res.status(400).json({ error: "Name and parent ID are required!" });
    }

    // Check if parent category exists
    const parentCategory = await prisma.category.findUnique({
      where: { id: parseInt(parentId) }
    });

    if (!parentCategory) {
      return res.status(404).json({ error: "Parent category not found!" });
    }

    // Check if subcategory already exists under this parent
    const existingSubcategory = await prisma.category.findFirst({
      where: {
        name,
        parentId: parseInt(parentId)
      }
    });

    if (existingSubcategory) {
      return res.status(400).json({ error: "Subcategory already exists under this parent!" });
    }

    const subCategory = await prisma.category.create({
      data: {
        name,
        parentId: parseInt(parentId)
      }
    });

    res.status(201).json({
      message: "Subcategory created successfully!",
      subCategory
    });
  } catch(error) {
    console.error('Error creating subcategory:', error);
    res.status(500).json({ error: "Error creating subcategory!" });
  }
});

// Create sub-child category
CategoryRoute.post('/category/subchildcategory', upload.none(), authMiddleware, isAdmin, async (req, res) => {
  try {
    const { name, parentId } = req.body;

    if (!name || !parentId) {
      return res.status(400).json({ error: "Name and parent ID are required!" });
    }

    // Check if parent subcategory exists
    const parentSubcategory = await prisma.category.findUnique({
      where: { id: parseInt(parentId) },
      include: { parent: true }
    });

    if (!parentSubcategory) {
      return res.status(404).json({ error: "Parent subcategory not found!" });
    }

    if (!parentSubcategory.parentId) {
      return res.status(400).json({ error: "Cannot add sub-child to a main category!" });
    }

    // Check if sub-child already exists under this parent
    const existingSubChild = await prisma.category.findFirst({
      where: {
        name,
        parentId: parseInt(parentId)
      }
    });

    if (existingSubChild) {
      return res.status(400).json({ error: "Sub-child category already exists under this parent!" });
    }

    const subChildCategory = await prisma.category.create({
      data: {
        name,
        parentId: parseInt(parentId)
      }
    });

    res.status(201).json({
      message: "Sub-child category created successfully!",
      subChildCategory
    });
  } catch(error) {
    console.error('Error creating sub-child category:', error);
    res.status(500).json({ error: "Error creating sub-child category!" });
  }
});

// Update category
CategoryRoute.put('/category/:id', upload.none(), authMiddleware, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Category name is required!" });
    }

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingCategory) {
      return res.status(404).json({ error: "Category not found!" });
    }

    // Check if name is already taken by another category at the same level
    const nameExists = await prisma.category.findFirst({
      where: {
        name,
        parentId: existingCategory.parentId,
        id: { not: parseInt(id) }
      }
    });

    if (nameExists) {
      return res.status(400).json({ error: "Category name already exists at this level!" });
    }

    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: { name }
    });

    res.status(200).json({
      message: "Category updated successfully!",
      category
    });
  } catch(error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: "Error updating category!" });
  }
});

// Delete category (with cascade deletion)
CategoryRoute.delete('/category/:id', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) },
      include: {
        subCategories: {
          include: {
            subCategories: true
          }
        }
      }
    });

    if (!category) {
      return res.status(404).json({ error: "Category not found!" });
    }

    // Check if category has products
    const products = await prisma.product.findMany({
      where: { categoryId: parseInt(id) }
    });

    if (products.length > 0) {
      return res.status(400).json({ 
        error: "Cannot delete category with associated products!",
        productCount: products.length
      });
    }

    // Recursive function to delete all child categories
    const deleteCategoryTree = async (categoryId) => {
      const childCategories = await prisma.category.findMany({
        where: { parentId: categoryId }
      });

      for (const child of childCategories) {
        await deleteCategoryTree(child.id);
      }

      await prisma.category.delete({
        where: { id: categoryId }
      });
    };

    await deleteCategoryTree(parseInt(id));

    res.status(200).json({
      message: "Category and all subcategories deleted successfully!"
    });
  } catch(error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: "Error deleting category!" });
  }
});

// Get single category with full hierarchy
CategoryRoute.get('/category/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) },
      include: {
        parent: true,
        subCategories: {
          include: {
            subCategories: true
          }
        }
      }
    });

    if (!category) {
      return res.status(404).json({ error: "Category not found!" });
    }

    res.status(200).json({ category });
  } catch(error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: "Error fetching category!" });
  }
});

export default CategoryRoute;