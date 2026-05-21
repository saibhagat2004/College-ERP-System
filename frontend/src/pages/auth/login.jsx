

import React, { useState } from "react";
import { Link } from "react-router-dom";
// Google OAuth removed
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const LoginPage = ({ onGuestLogin }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      const response = await res.json();
      if (!res.ok) throw new Error(response.error || "Login failed");
      return response;
    },
    onSuccess: () => {
      toast.success("Login successful!");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutation.mutate(formData);
  };

  // Google OAuth removed

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center mb-4">Login</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Login
          </button>
        </form>
        
       

        {/* <p className="text-center mt-4">
          Don't have an account?
          <Link to="/signup" className="text-blue-500 hover:underline"> Sign up</Link>
        </p> */}
      </div>
    </div>
  );
};

export default LoginPage;