import nodemailer from "nodemailer";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,            
  port: Number(process.env.SMTP_PORT),    
  auth: {
    user: "apikey",          
    pass: process.env.SMTP_PASS,          
  },
});



// Function to generate OTP
function generateOTP(length = 6) {
  return crypto.randomInt(0, 10 ** length).toString().padStart(length, "0");
}

// Function to send OTP email
export async function sendOTPEmail(to) {
  const otp = generateOTP();  // Generate OTP
   console.log("Sending OTP to:", to);
  try {
    const info = await transporter.sendMail({ 
     
      from: `"My App" <${process.env.SMTP_USER}>`,
      to,
      subject: `Your OTP Code ${to}`,
      html: `
        <h2>OTP Verification</h2>
        <p>Your OTP is: <b>${otp}</b></p>
        <p>This OTP is valid for 10 minutes only.</p>
      `,
    });

    console.log("OTP sent successfully! Message ID:", info.messageId);
    return otp; // return OTP to store in DB or session
  } catch (error) {
    console.error("Failed to send OTP:", error.message);
    throw new Error("Unable to send OTP email");
  }
}

