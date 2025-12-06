"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

import { Input } from "@/components/ui/input";

const defaultEmail =
  process.env.NODE_ENV === "development" ? "demo@example.com" : "";
const defaultPassword =
  process.env.NODE_ENV === "development" ? "password" : "";

export default function Home() {
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState(defaultPassword);
  const [rememberMe, setRememberMe] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    const result = await signIn("credentials", {
      email,
      password,
      rememberMe,
      redirect: false,
    });
    if (result?.error) {
      alert(result.error);
    }
    setSubmitting(false);
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="flex items-center justify-center bg-white px-6 py-12 lg:px-16">
        <div className="w-full max-w-xl space-y-8">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-[#0f1729]">
              Welcome back
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-[#0f1729]"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-11 rounded-md border border-[#d7dce5] bg-white text-[15px] text-[#0f1729] shadow-none placeholder:text-[#9aa3b5] focus:border-[#1f63f0] focus:ring-[#1f63f0]"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-[#0f1729]"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="h-11 rounded-md border border-[#d7dce5] bg-white text-[15px] text-[#0f1729] shadow-none placeholder:text-[#9aa3b5] focus:border-[#1f63f0] focus:ring-[#1f63f0]"
              />
            </div>

            {process.env.NODE_ENV === "development" && (
              <p className="text-sm text-[#6b7280]">
                Demo:{" "}
                <span className="font-semibold text-[#0f1729]">
                  demo@example.com
                </span>{" "}
                / <span className="font-semibold text-[#0f1729]">password</span>
              </p>
            )}

            <div className="flex items-center gap-3">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-[#cbd5e1] text-[#1f63f0] focus:ring-1 focus:ring-[#1f63f0]"
              />
              <label
                htmlFor="rememberMe"
                className="text-sm font-medium text-[#0f1729]"
              >
                Remember me
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex h-12 w-full items-center justify-center rounded-md bg-[#1f63f0] text-[15px] font-semibold text-white transition hover:bg-[#1955cf] disabled:opacity-70"
            >
              {submitting ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>

      <div className="flex items-center justify-center bg-[#1f63f0] px-8 py-16 text-white">
        <div className="max-w-md space-y-4">
          <h2 className="text-[34px] font-semibold leading-tight">ticktock</h2>
          <p className="text-base leading-7 text-white/90">
            Introducing ticktock, our cutting-edge timesheet web application
            designed to revolutionize how you manage employee work hours. With
            ticktock, you can effortlessly track and monitor employee attendance
            and productivity from anywhere, anytime, using any
            internet-connected device.
          </p>
        </div>
      </div>
    </div>
  );
}
