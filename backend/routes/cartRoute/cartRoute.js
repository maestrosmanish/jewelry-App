import express from "express";
import { authMiddleware } from "../../middlewares/authMiddleware/authMiddleware.js";
import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import upload from "../../utils/multer.js";
const cartRoute = Router();
const prisma = new PrismaClient();


cartRoute.post("/cart/add",upload.none(), authMiddleware, async (req, res) => {
console.log(req.body)
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.userId;

    const product = await prisma.product.findUnique({ where: { id: Number(productId) }});
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (product.quantity < quantity) return res.status(400).json({ message: "Insufficient stock" });

    const existingCartItem = await prisma.cartItem.findFirst({
      where: { userId, productId: Number(productId) }
    });

    if (existingCartItem) {
   
      const updatedItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + Number(quantity) }
      });
      return res.json({ message: "Cart updated", item: updatedItem });
    }

 
    const cartItem = await prisma.cartItem.create({
      data: {
        userId,
        productId: Number(productId),
        quantity: Number(quantity)
      }
    });

    res.status(201).json({ message: "Added to cart", item: cartItem });
  } catch (error) {
    res.status(500).json({ message: "Error adding to cart", error: error.message });
  }
});

cartRoute.delete("/cart/delete/:id", authMiddleware, async (req, res) => {
  try {
    
    const userId = req.user.userId;

    const cartItem = await prisma.cartItem.findFirst({
      where: { id: Number(req.params.id), userId }, 
      include: { product: true }
    });

    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
  } 

    await prisma.cartItem.delete({ where: { id: cartItem.id } });
    res.json({ message: "Cart item deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting cart item", error: error.message });
  }
}) 


cartRoute.patch("/cart/update/:id", upload.none(), authMiddleware, async (req, res) => {
  try {
    const { quantity } = req.body;
    const cartItemId  =Number(req.params.id)
    const userId = req.user.userId;

    const cartItem = await prisma.cartItem.findFirst({
      where: { id: Number(cartItemId), userId },
    });

    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    } 

      if (Number(quantity) > cartItem.product.quantity) {
        return res.status(400).json({ message: "Insufficient stock" });
      }

    const updatedCartItem = await prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity: Number(quantity) },
    }); 
    res.json({ message: "Cart item updated", item: updatedCartItem });
  }catch (error) {
    res.status(500).json({ message: "Error updating cart item", error: error.message });
  } }); 

 cartRoute.get("/cart/get" , authMiddleware, async (req,res)=>{
    try {
      const userId = req.user.userId;
      const cartItems = await prisma.cartItem.findMany({
        where: { userId },
        include: { product: true },
      });

      const total = cartItems.reduce((acc, item) => {
          const discountedPrice = item.product.price - (item.product.price * (item.product.discount / 100));
          return acc + discountedPrice * item.quantity;
        }, 0);

      res.status(200).json({cartItems,total});
  }catch(error){
    res.status(500).json({message:"Error fetcting product !!!",error:error})
  }
  }
  )  



export default cartRoute;