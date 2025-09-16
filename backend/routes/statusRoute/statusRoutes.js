import express from "express";
import { PrismaClient } from '../../generated/prisma/index.js';

const prisma = new PrismaClient();
const statusRouter = express.Router();

statusRouter.get("/stats", async (req, res) => {
  try {
    // Total counts
    const userCount = await prisma.user.count();
    const orderCount = await prisma.order.count();
    const productCount = await prisma.product.count();

    const processing = await prisma.order.count({ where: { status: "PROCESSING" } });
    const completed = await prisma.order.count({ where: { status: "COMPLETED" } });
    const cancelled = await prisma.order.count({ where: { status: "CANCELLED" } });
    const pending = await prisma.order.count({ where: { status: "PENDING" } });


    const completedOrders = await prisma.order.findMany({
      where: { status: "COMPLETED" },
      select: { total: true },
    });

    const totalRevenue = completedOrders.reduce((acc, order) => acc + order.total, 0);
    const totalSales = completedOrders.length;

    // Recent 5 Orders
    const recentOrders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        user: {
          select: { name: true, email: true },
        },
        orderItems: {
          include: {
            product: {
              select: { name: true, price: true },
            },
          },
        },
      },
    });

    res.json({
      success: true,
      userCount,
      orderCount,
      productCount,
      totalRevenue,
      totalSales,
      status: {
        processing,
        pending,
        completed,
        cancelled,
      },
      recentOrders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching stats",
      error: error.message,
    });
  }
});

export default statusRouter;
