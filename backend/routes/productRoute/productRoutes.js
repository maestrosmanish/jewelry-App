import express from 'express';
import { Router } from 'express';
import { PrismaClient } from '../../generated/prisma/index.js';
import { authMiddleware } from '../../middlewares/authMiddleware/authMiddleware.js';
import { format } from 'date-fns';
import { isAdmin } from '../../middlewares/adminMiddleware/isAdmin.js';
import upload from '../../utils/multer.js';

const productRoute = Router();
const prisma = new PrismaClient();

productRoute.post(
  "/product/post",
  upload.array("images", 5),
  authMiddleware,
  isAdmin,
  async (req, res) => {
    try {
      const {
        name,
        description,
        overview,
        price,
        discount,
        quantity,
        status,
        metalType,
        purity,
        weight,
        stoneDetails,
        size,
        gender,
        occasion,
        category,
      } = req.body;

      const categoryIdNum = Number(category);
      if (isNaN(categoryIdNum)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }

      const uploadedFiles = req.files ? req.files.map(file => file.path) : [];

      const existingProduct = await prisma.product.findFirst({
        where: { name: name },
      });

      if (existingProduct) {
        return res
          .status(400)
          .json({ message: "Product with this name already exists" });
      }

      const product = await prisma.product.create({
        data: {
          name,
          description,
          overview,
          price: Number(price),
          discount: Number(discount),
          quantity: Number(quantity),
          status,
          images: uploadedFiles,
          metalType,
          purity,
          weight: Number(weight),
          stoneDetails: stoneDetails ? JSON.parse(stoneDetails) : undefined,
          size,
          gender,
          occasion,
          userId: req.user.userId,
          categoryId: categoryIdNum,
        },
      });

      console.log("created product --->", product);
      res
        .status(201)
        .json({ message: "Product created successfully", product });
    } catch (error) {
      console.log(error);
      res
        .status(400)
        .json({ message: "Error creating product", error: error.message });
    }
  }
);


productRoute.get("/products", authMiddleware, async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { status: "in-stock" },
      select: {
        id: true,
        name: true,
        description: true,
        overview: true,
        price: true,
        discount: true,
        quantity: true,
        images: true,
        purity: true,
        weight: true,
        occasion: true,
        category: { select: { id: true, name: true } },
      },
    });

    const formattedProducts = products.map(product => {
      const discountedPrice =
        product.price - product.price * (product.discount / 100);
      return {
        ...product,
        discountedPrice: discountedPrice.toFixed(2),
        itemsLeft: product.quantity < 10 ? product.quantity : undefined,
      };
    });

    res.status(200).json(formattedProducts);
  } catch (error) {
    res
      .status(500)
      .json({ mesage: "Products fetching error", error: error.message });
  }
});


productRoute.get(
  "/admin/products",
  authMiddleware,
  isAdmin,
  async (req, res) => {
    try {
      const products = await prisma.product.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          discount: true,
          quantity: true,
          status: true,
          images: true,
          user: { select: { id: true, name: true, email: true } },
          category: { select: { id: true, name: true } },
          createdAt: true,
          updatedAt: true,
        },
      });

      const formattedProducts = products.map(product => ({
        ...product,
        createdAt: format(new Date(product.createdAt), 'dd MMM yyyy, hh:mm a'),
        updatedAt: format(new Date(product.updatedAt), 'dd MMM yyyy, hh:mm a'),
      }));

      res.status(200).json(formattedProducts);
    } catch (error) {
      res
        .status(500)
        .json({ mesage: "Products fetching error", error: error.message });
    }
  }
);


productRoute.put(
  "/admin/product/:id",
  upload.array("images", 5),
  authMiddleware,
  isAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        name,
        description,
        overview,
        price,
        discount,
        quantity,
        status,
        metalType,
        purity,
        weight,
        stoneDetails,
        size,
        gender,
        occasion,
        category,
      } = req.body;

      const uploadedFiles = req.files ? req.files.map(file => file.path) : [];

      const product = await prisma.product.update({
        where: { id: Number(id) },
        data: {
          name,
          description,
          overview,
          price: price ? Number(price) : undefined,
          discount: discount ? Number(discount) : undefined,
          quantity: quantity ? Number(quantity) : undefined,
          status,
          images: uploadedFiles.length > 0 ? uploadedFiles : undefined,
          metalType,
          purity,
          weight: weight ? Number(weight) : undefined,
          stoneDetails: stoneDetails ? JSON.parse(stoneDetails) : undefined,
          size,
          gender,
          occasion,
          categoryId: category ? Number(category) : undefined,
        },
      });

      res
        .status(200)
        .json({ message: "Product updated successfully", product });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error updating product", error: error.message });
    }
  }
);


productRoute.delete(
  "/admin/product/:id",
  authMiddleware,
  isAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
 
    
      if (isNaN(Number(id))) {
        return res.status(400).json({ message: "Invalid product ID" });
      }

     
      const product = await prisma.product.findUnique({
        where: { id: Number(id) },
      });
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      console.log(product);
      const deletedProduct = await prisma.product.delete({
        where: { id: Number(id) },
      });

      console.log("deleted product --->", deletedProduct);
      res
        .status(200)
        .json({ message: "Product deleted successfully", deletedProduct });
    } catch (error) {
      res.status(500).json({
        message: "Error deleting product",
        error: error.message,
      });
    }
  }
);


export default productRoute;
