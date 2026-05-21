import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/auth/login";
import SignUpPage from "./pages/auth/SignUpPage";
import CreateUsers from "./pages/Users/CreateUsers";
import Navbar from "./components/NavBar";
import LoadingSpinner from "./components/LoadingSpinner";

function App() {
  const { data: authUser, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/auth/me");
        // console.log(res)
        if (!res.ok) throw new Error("Failed to fetch user");
        return res.json();
      } catch (error) {
        console.error("Auth error:", error);
        return null;
      }
    },
    retry: false,
   });
  

  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      {authUser && <Navbar authUser={authUser} />}
      <Routes>
        <Route
          path="/"
          element={authUser ? <HomePage/> : <Navigate to="/login" />}
        />
        <Route
          path="/admin/users/create"
          element={authUser?.role === "admin" ? <CreateUsers /> : <Navigate to="/" />}
        />
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route
          path="/signup"
          element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
        />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
