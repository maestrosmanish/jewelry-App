import express, { Router } from "express";
import { PrismaClient } from "../../generated/prisma/index.js";
import { authMiddleware } from "../../middlewares/authMiddleware/authMiddleware.js";
import { isAdmin } from "../../middlewares/adminMiddleware/isAdmin.js";

const orderRoute = Router();
const prisma = new PrismaClient();



//  Create new order from cart
orderRoute.post("/order/create", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId, quantity, address, city, state, pincode, country } = req.body;

    let orderItems = [];
    let total = 0;

    // User info 
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const finalAddress = address || user.address;
    const finalCity = city || user.city;
    const finalState = state || user.state;
    const finalPincode = pincode || user.pincode;
    const finalCountry = country || user.country;

    //  Case 1: Single product order 
    if (productId && quantity) {
      const product = await prisma.product.findUnique({
        where: { id: Number(productId) },
      });

      if (!product) return res.status(404).json({ message: "Product not found" });
      if (product.quantity < quantity)
        return res.status(400).json({ message: "Insufficient stock" });

      const discountedPrice =
        product.price - product.price * (product.discount / 100 || 0);

      total = discountedPrice * quantity;

      orderItems.push({
        productId: product.id,
        quantity,
        price: discountedPrice,
      });

      // Update stock
      await prisma.product.update({
        where: { id: product.id },
        data: { quantity: { decrement: quantity } },
      });

    } else {
      // Case 2: Full cart order
      const cartItems = await prisma.cartItem.findMany({
        where: { userId },
        include: { product: true },
      });

      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      orderItems = cartItems.map((item) => {
        const discountedPrice =
          item.product.price - item.product.price * (item.product.discount / 100 || 0);
        total += discountedPrice * item.quantity;
        return {
          productId: item.productId,
          quantity: item.quantity,
          price: discountedPrice,
        };
      });

      // Empty cart after order
      await prisma.cartItem.deleteMany({ where: { userId } });
    }


    const order = await prisma.order.create({
      data: {
        userId,
        total,
        address: finalAddress,
        city: finalCity,
        state: finalState,
        pincode: finalPincode,
        country: finalCountry,
        orderItems: { create: orderItems },
      },
      include: { orderItems: { include: { product: true } } },
    });

    res.json({ message: "Order created successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Error creating order", error: error.message });
  }
});


//  Get all orders of logged-in user
orderRoute.get("/my-orders", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const orders = await prisma.order.findMany({
      where: { userId },
      include: { orderItems: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    });

    res.json(orders);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching orders", error: error.message });
  }
});

//  Get single order detail
orderRoute.get("/order/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const order = await prisma.order.findFirst({
      where: { id: Number(id), userId },
      include: { orderItems: { include: { product: true } } },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching order", error: error.message });
  }
});

//  Refund / Cancel order
orderRoute.post("/order/refund/:id", authMiddleware, async (req, res) => {
  try {
    const orderId = Number(req.params.id);

    // Update order
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: "REFUNDED", status: "CANCELLED" },
    });

    // Restore product stock
    const items = await prisma.orderItem.findMany({ where: { orderId } });
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { quantity: { increment: item.quantity } },
      });
    }

    res.json({ message: "Order refunded and cancelled", order });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error processing refund", error: error.message });
  }
});

orderRoute.get("/history", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    // 1. Orders with items
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: { include: { product: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // 2. Count summary
    const totalOrders = await prisma.order.count({ where: { userId } });
    const completed = await prisma.order.count({
      where: { userId, status: "COMPLETED" },
    });
    const cancelled = await prisma.order.count({
      where: { userId, status: "CANCELLED" },
    });
    const refunded = await prisma.order.count({
      where: { userId, paymentStatus: "REFUNDED" },
    });

    res.json({
      summary: {
        totalOrders,
        completed,
        cancelled,
        refunded,
      },
      orders,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching order history",
      error: error.message,
    });
  }
});


//  Get all orders for admin
orderRoute.get("/all-orders", authMiddleware, isAdmin, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: true,
        orderItems: { include: { product: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(orders);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching orders", error: error.message });
  }
});

//  Update order status
orderRoute.patch("/order/status/:id", authMiddleware, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await prisma.order.update({
      where: { id: Number(id) },
      data: { status },
    });

    res.json({ message: "Order status updated", order });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating order", error: error.message });
  }
});

//  Update payment status
orderRoute.patch("/order/payment/:id", authMiddleware, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    const order = await prisma.order.update({
      where: { id: Number(id) },
      data: { paymentStatus },
    });

    res.json({ message: "Payment status updated", order });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating payment", error: error.message });
  }
});

export default orderRoute;
