

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
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(248,113,113,0.18),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.18),_transparent_28%),linear-gradient(135deg,_#020617_0%,_#0f172a_48%,_#111827_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:36px_36px] opacity-25" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl shadow-slate-950/40 backdrop-blur-xl lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative hidden flex-col justify-between border-r border-white/10 p-8 lg:flex xl:p-12">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-500/20 via-transparent to-rose-500/10" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-slate-100">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                College Management Portal
              </div>
              <h1 className="mt-8 max-w-md text-4xl font-bold leading-tight text-white xl:text-5xl">
                Manage classes, assignments, and student progress in one place.
              </h1>
              <p className="mt-5 max-w-lg text-sm leading-6 text-slate-300 xl:text-base">
                A focused workspace for administrators, teachers, and students to keep academic operations organized and easy to follow.
              </p>
            </div>

            <div className="relative z-10 grid gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-sm font-semibold text-white">Centralized access</p>
                <p className="mt-1 text-sm text-slate-300">Jump into classrooms, assignments, and submissions without switching tools.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-sm font-semibold text-white">Role-based workflow</p>
                <p className="mt-1 text-sm text-slate-300">Built for admin, teacher, and student journeys inside the same portal.</p>
              </div>
              <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/10 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/20 text-lg font-bold text-sky-200">
                  CM
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Academic dashboard</p>
                  <p className="text-sm text-slate-300">Track everything from one secure sign-in.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center p-6 sm:p-8 lg:p-10">
            <div className="w-full max-w-md rounded-[1.5rem] border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/30 sm:p-8">
              <div className="mb-8 text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
                  Secure Sign In
                </p>
                <h2 className="mt-3 text-3xl font-bold text-white">Welcome back</h2>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Sign in to access your college management workspace.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="name@college.edu"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400 focus:bg-white/10"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="password">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400 focus:bg-white/10"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="mt-2 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Signing in..." : "Login"}
                </button>
              </form>


            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;