import React from "react";

export function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
    />
  );
}
