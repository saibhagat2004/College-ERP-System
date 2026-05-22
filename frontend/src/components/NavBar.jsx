import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import DefaultAvatar from "../../public/avatars/boy1.png";

const Navbar = ({ authUser, isGuest, setIsGuest }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // Logout Mutatio n
  const { mutate: logout } = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (!res.ok) throw new Error("Logout failed");
    },
    onSuccess: () => {
      toast.success("Logout successful");
      queryClient.setQueryData(["authUser"], null);
      setIsDropdownOpen(false);
      navigate("/login");
    },
    onError: () => {
      toast.error("Logout Failed");
    },
  });

  const handleLogout = () => {
    if (isGuest) {
      setIsGuest(false);
      navigate("/login");
    }
    logout();
  };

  return (
    <nav className="flex items-center justify-between gap-4 bg-gray-900 px-4 py-3 text-white">
      <div className="shrink-0 text-lg font-semibold">
        <Link to="/" className="inline-flex items-center">
          NavBar
        </Link>
      </div>

      <div className="hidden flex-1 items-center justify-center gap-6 md:flex">
        {authUser?.role === "admin" && (
          <>
            <Link to="/admin/users/create" className="whitespace-nowrap hover:text-orange-400">
              Create User
            </Link>
            <Link to="/admin/classes" className="whitespace-nowrap hover:text-orange-400">
              Manage Classes
            </Link>
          </>
        )}

        {authUser?.role === "teacher" && (
          <Link to="/teacher/classroom" className="whitespace-nowrap hover:text-orange-400">
            Teacher Classroom
          </Link>
        )}

        {authUser?.role === "student" && (
          <Link to="/student/classroom" className="whitespace-nowrap hover:text-orange-400">
            Class Room
          </Link>
        )}
      </div>

      <div className="relative shrink-0">
        {authUser ? (
          <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="focus:outline-none">
            <img 
              src={authUser.profilePicture || DefaultAvatar} 
              alt="Avatar" 
              className="w-10 h-10 rounded-full border border-gray-300"
            />
          </button>
        ) : (
          <Link to="/login" className="hover:text-orange-400">Login</Link>
        )}

        {isDropdownOpen && (
          <div className="absolute right-0 z-50 mt-2 w-40 rounded-md bg-white text-black shadow-lg">
            <ul className="py-2">
              <li>
                <Link to="/DashBoardPage" className="block px-4 py-2 hover:bg-gray-200">Profile</Link>
              </li>
              <li>
                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 hover:bg-gray-200">
                  Logout
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
