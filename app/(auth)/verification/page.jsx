"use client";
import { useState, useRef } from "react";

export default function OtpInput({ length = 6, onChange }) {
  const [otp, setOtp] = useState(new Array(length).fill(""));
  const inputsRef = useRef([]);

  const handleChange = (e, idx) => {
    const value = e.target.value.replace(/[^0-9]/g, ""); // only digits
    if (!value) return;
    const newOtp = [...otp];
    newOtp[idx] = value;
    setOtp(newOtp);
    onChange?.(newOtp.join(""));

    // Move to next input
    if (idx < length - 1) {
      inputsRef.current[idx + 1].focus();
    }
  };

  const handleBackspace = (e, idx) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      inputsRef.current[idx - 1].focus();
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {otp.map((val, idx) => (
        <input
          key={idx}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={val}
          ref={(el) => (inputsRef.current[idx] = el)}
          onChange={(e) => handleChange(e, idx)}
          onKeyDown={(e) => handleBackspace(e, idx)}
          className="w-10 h-10 border border-gray-300 rounded-lg text-center text-lg focus:ring-2 focus:ring-blue-500"
          placeholder="0"
        />
      ))}
    </div>
  );
}
