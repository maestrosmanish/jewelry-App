"use client";
import Link from "next/link";
import React, { useState, useRef } from "react";
import { toast } from "react-toastify";

const AdminLoginForm = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpSection, setOtpSection] = useState(false);
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const inputsRef = useRef([]);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  // OTP input change
  const handleOtpChange = (e, idx) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    const newOtp = [...otp];
    newOtp[idx] = value; // update current input
    setOtp(newOtp);

    // Move to next input if value entered
    if (value && idx < otp.length - 1) inputsRef.current[idx + 1]?.focus();
  };

  // OTP backspace
  const handleBackspace = (e, idx) => {
    if (e.key === "Backspace") {
      if (otp[idx] === "" && idx > 0) {
        inputsRef.current[idx - 1]?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[idx] = "";
        setOtp(newOtp);
      }
    }
  };

  // OTP submit
  const handleOtpSubmit = async () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length < 6) {
      toast.error("Please enter complete OTP");
      return;
    }

    try {
      const userId = localStorage.getItem("userId");
      const response = await fetch(`${baseUrl}/user/verifyotp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: Number(userId), otp: enteredOtp }),
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Invalid OTP");
        return;
      }

      toast.success("OTP Verified Successfully!");
      localStorage.setItem("adminToken", data.token);

      // Reset OTP inputs
      setOtp(new Array(6).fill(""));
      window.location.href = "/dashboard/overview";
    } catch (error) {
      toast.error("OTP verification failed");
      console.error(error);
    }
  };

  // Clear OTP manually
  const handleOtpClear = () => {
    setOtp(new Array(6).fill(""));
    inputsRef.current[0]?.focus();
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Login submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(`${baseUrl}/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.message || "Login failed");
        return;
      }

      toast.success("OTP sent to your email!");
      localStorage.setItem("userId", data.userId);
      setOtpSection(true); // show OTP screen
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12">
      {!otpSection ? (
        // LOGIN FORM
        <div className="max-w-md w-full bg-white rounded-xl shadow-md p-6 space-y-6">
          <h1 className="text-2xl font-bold text-gray-800 text-center">Admin Login</h1>
         <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>

        <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg 
                      border-gray-300 outline-none 
                      focus:border-blue-500 
                      focus:ring-2 focus:ring-blue-500/60 
                      focus:shadow-[0_0_12px_rgba(59,130,246,0.7)]"
            placeholder="Enter email"
          />

          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg 
                      border-gray-300 outline-none 
                      focus:border-blue-500 
                      focus:ring-2 focus:ring-blue-500/60 
                      focus:shadow-[0_0_12px_rgba(59,130,246,0.7)]" 
                          placeholder="Enter Password"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>

          <p className="text-sm text-center text-gray-600 mt-4">
            Don’t have an account?{" "}
            <Link href="/signup" className="text-blue-600 hover:underline">
              SignUp here
            </Link>
            </p>
  </form>
        </div>
      ) : (
        // OTP SECTION
        <div className="max-w-md w-full bg-white rounded-xl shadow-md p-6 space-y-6">
          <h1 className="text-2xl font-bold text-gray-800 text-center">OTP Verification</h1>
          <p className="text-gray-600 text-center">Enter the OTP sent to your email</p>

          <div className="flex gap-3 justify-center">
            {otp.map((val, idx) => (
              <input
                key={idx}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={val}
                ref={(el) => (inputsRef.current[idx] = el)}
                onChange={(e) => handleOtpChange(e, idx)}
                onKeyDown={(e) => handleBackspace(e, idx)}
                className="w-12 h-12 border border-gray-300 rounded-lg text-center text-xl ring-blue-500 outline-none"
              />
            ))}
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleOtpSubmit}
              className="flex-1 py-2 px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium"
            >
              Submit OTP
            </button>
            <button
              onClick={handleOtpClear}
              className="flex-1 py-2 px-4 rounded-lg bg-gray-300 text-gray-700 hover:bg-gray-400 font-medium"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLoginForm;
