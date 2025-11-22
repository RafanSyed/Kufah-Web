"use client";

export const dynamic = "force-dynamic";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const TeacherLogin: React.FC = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const correctUsername = process.env.NEXT_PUBLIC_TEACHER_USERNAME;
    const correctPassword = process.env.NEXT_PUBLIC_TEACHER_PASSWORD;

    if (username === correctUsername && password === correctPassword) {
      setError("");
      router.push("/pages/dashboard");
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#f3f6ff] to-[#dfe7ff] px-4">
      <div className="w-full max-w-5xl grid gap-10 md:grid-cols-[1.1fr,1fr] items-center">

        {/* Right: Login card */}
        <section className="bg-white/90 backdrop-blur-xl shadow-xl rounded-3xl border border-slate-100 px-6 py-7 md:px-8 md:py-9 w-full max-w-md mx-auto">
          <div className="mb-6 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-kufahBlue">
              Admin Login
            </h2>
            <p className="mt-2 text-xs md:text-sm text-slate-500">
              Use your Admin username and password to access Kufah information.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label
                htmlFor="username"
                className="block text-xs md:text-sm font-medium text-kufahBlue"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-11 md:h-12 rounded-xl border border-slate-200 bg-white px-3 md:px-4 text-sm md:text-base text-slate-900 outline-none transition focus:border-kufahBlue focus:ring-2 focus:ring-kufahBlue/30"
                autoComplete="username"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs md:text-sm font-medium text-kufahBlue"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 md:h-12 rounded-xl border border-slate-200 bg-white px-3 md:px-4 text-sm md:text-base text-slate-900 outline-none transition focus:border-kufahBlue focus:ring-2 focus:ring-kufahBlue/30"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="text-xs md:text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full h-11 md:h-12 rounded-xl bg-kufahBlue text-white text-sm md:text-base font-semibold shadow-md shadow-kufahBlue/20 transition hover:bg-[#141458] hover:shadow-lg hover:shadow-kufahBlue/30 active:scale-[0.99]"
            >
              Log in to Dashboard
            </button>

            <p className="text-[11px] md:text-xs text-center text-slate-500 mt-1">
              Need help? Contact your Kufah administrator.
            </p>
          </form>
        </section>
      </div>
    </div>
  );
};

export default TeacherLogin;
