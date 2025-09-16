"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Loader Component
const Loader = () => (
  <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
    <div className="flex flex-col items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      <p className="mt-3 text-gray-600">Loading...</p>
    </div>
  </div>
);

export default function ClientLayout({ children }) {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setLoading(true);

    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      {loading && <Loader />}
      <ToastContainer position="top-right" autoClose={3000} theme="light" />
      {children}
    </>
  );
}
