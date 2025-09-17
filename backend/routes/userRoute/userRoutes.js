import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import express from 'express'; 
import dotenv from 'dotenv';

import { Router } from 'express';
import { sendOTPEmail } from '../../utils/sendOTPEmail.js';
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from '../../middlewares/authMiddleware/authMiddleware.js';
import { isAdmin } from '../../middlewares/adminMiddleware/isAdmin.js';
import upload from '../../utils/multer.js';
 
const userRoute = Router();
const prisma = new PrismaClient();

   // register users
userRoute.post('/user/register', upload.none(), async (req, res) => {
  try {
    const { name, email, password, phone, role, status, address, city, state, pincode, country } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const createUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role: role || "user",
        status: status === "true" || status === true,  // convert to boolean
        address: address || "",
        city: city || "",
        state: state || "",
        pincode: pincode || "",
        country: country || "India",
      },
    });

    res.status(201).json({
      message: "Registration successful",
      data: createUser,
    });

  } catch (error) {
    console.error(error);
    if (error.code === "P2002") {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
});


   //user login
userRoute.post('/user/login', upload.none() ,async (req,res)=>{
   
    const { email,password} = req.body; 
    console.log(req.body);
    const finduser = await prisma.user.findUnique({ where : {email:email}});
    if(!finduser)  return res.status(400).json({error:'user not found'}); 

         const isMatch = await bcrypt.compare(password, finduser.password);
 
          if(!isMatch) return res.status(400).json({error:'invalid credentials'}); 

           const otp =  await sendOTPEmail(email);

           await prisma.user.update({
                where: { id: finduser.id },
                data: { otp, otpExpires: new Date(Date.now() + 10 * 60 * 1000).toISOString() },
            });

           res.json({ message: "OTP sent to email", userId: finduser.id });

 }) 
 
 //otp verification
userRoute.post('/user/verifyotp' ,async (req,res)=>{
  console.log(req.body)
  try {   const { userId ,otp } = req.body;

    const user = await prisma.user.findUnique({ where: { id:userId } });
    if (!user) return res.status(400).json({ error: "User not found" });
    if (user.otp !== otp) return res.status(400).json({ error: "Invalid OTP" });
    if (user.otpExpires < new Date()) return res.status(400).json({ error: "OTP expired" }); 
    console.log("user verification--->",user)
    await prisma.user.update({ where: { id:userId }, data: { otp: null, otpExpires: null }});

    const token = jwt.sign({ userId: user.id,role:user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.status(200).json({ message: "OTP verified successfully", token });
    }catch(error){
        res.status(500).json({error:'Internal Server Error',error});
    }
 }) 
  

  // Update your registration endpoint to include address fields

userRoute.post("/admin/user/register", upload.none(), async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role,
      isActive,
      address,

    } = req.body;

    // Parse address if it comes as JSON string
    let parsedAddress = {};
    if (address) {
      try {
        parsedAddress = JSON.parse(address);
      } catch (e) {
        return res.status(400).json({ error: "Invalid address format" });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const createUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role: role || "user",
        status: isActive === "true", // ensure boolean
        address: parsedAddress.street || "",
        city: parsedAddress.city || "",
        state: parsedAddress.state || "",
        pincode: parsedAddress.pincode || "",
        country: parsedAddress.country || "India",
      },
    });

    res.status(201).json({
      message: "User registered successfully",
      data: createUser,
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (error.code === "P2002") {
      return res.status(400).json({ error: "Email already exists" });
    }

    res.status(500).json({ error: "Internal Server Error" });
  }
});

 // delete user
userRoute.delete('/user/:id',authMiddleware,async (req,res)=>{

        try { const deleteUser = await prisma.user.delete({
            where:{id: Number(req.params.id)}
            });
            res.status(200).json({ message: "User deleted successfully", deleteUser });         }

        catch(error){
                res.status(500).json({error:'Internal Server Error',error});
            }
        }) 

//udadte user
userRoute.put('/user/:id', upload.none(), authMiddleware, async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;  

   
    const dataToUpdate = {};
    if (name) dataToUpdate.name = name;
    if (email) dataToUpdate.email = email;
    if (phone) dataToUpdate.phone = phone;
    if (password) dataToUpdate.password = await bcrypt.hash(password, 10);

    const updateUser = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: dataToUpdate,
    });

    res.status(200).json({ message: "User updated successfully", updateUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});


//fetch all the users
 userRoute.get('/users',authMiddleware,isAdmin,async (req,res) =>{
    try{
       const getalluser = await prisma.user.findMany();
        res.status(200).json(getalluser); 
        // console.log(getalluser);
  
     } catch(error)
        {
            res.status(500).json({error:'users fecthing failed',error});
        } 
}) 

// Update user role 
userRoute.put('/admin/users/:id/role', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    const updatedUser = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: { role }
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: "Role update failed", details: error.message });
  }
});

// Toggle user status
userRoute.put('/admin/users/:id/status', authMiddleware, isAdmin, async (req, res) => { 
    console.log({status: req.body.isActive});
  try {
    const { isActive } = req.body.isActive;
    const updatedUser = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: { status:isActive }
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: "Status update failed", details: error.message });
  }
});


 
 export default userRoute;