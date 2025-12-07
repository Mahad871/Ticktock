"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";

import { Input } from "@/components/ui/input";

const defaultEmail =
  process.env.NODE_ENV === "development" ? "demo@example.com" : "";
const defaultPassword =
  process.env.NODE_ENV === "development" ? "password" : "";

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState(defaultPassword);
  const [rememberMe, setRememberMe] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await signIn("credentials", {
      email,
      password,
      rememberMe,
      redirect: false,
      callbackUrl: "/dashboard",
    });
    if (result?.error || result?.ok === false) {
      setError(result?.error ?? "Unable to sign in.");
      setSubmitting(false);
      return;
    }
    router.push("/dashboard");
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="bg-surface flex items-center justify-center px-6 py-12 lg:px-16">
        <div className="w-full max-w-xl space-y-8">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
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
                className="border-border-strong bg-surface h-11 rounded-md border text-[15px] text-foreground shadow-none placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
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
                className="border-border-strong bg-surface h-11 rounded-md border text-[15px] text-foreground shadow-none placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
              />
            </div>

            {process.env.NODE_ENV === "development" && (
              <p className="text-sm text-muted-foreground">
                Demo:{" "}
                <span className="font-semibold text-foreground">
                  demo@example.com
                </span>{" "}
                /{" "}
                <span className="font-semibold text-foreground">password</span>
              </p>
            )}

            <div className="flex items-center gap-3">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="border-border-strong h-4 w-4 rounded text-primary focus:ring-1 focus:ring-primary"
              />
              <label
                htmlFor="rememberMe"
                className="text-sm font-medium text-foreground"
              >
                Remember me
              </label>
            </div>

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex h-12 w-full items-center justify-center rounded-md bg-primary text-[15px] font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-70"
            >
              {submitting ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>

      <div className="flex items-center justify-center bg-primary px-8 py-16 text-primary-foreground">
        <div className="max-w-md space-y-4">
          <h2 className="text-[34px] font-semibold leading-tight">ticktock</h2>
          <p className="text-base leading-7 text-primary-foreground/90">
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
