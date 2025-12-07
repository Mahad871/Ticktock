"use client";

import { signOut, useSession } from "next-auth/react";
import { useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type AppShellProps = {
  children: ReactNode;
  navLabel?: string;
  contentClassName?: string;
};

export function AppShell({
  children,
  navLabel = "Timesheets",
  contentClassName,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="bg-surface border-b border-border">
        <div className="mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <span className="text-2xl font-semibold tracking-tight text-foreground">
              ticktock
            </span>
            <nav className="text-sm font-medium text-foreground">
              {navLabel}
            </nav>
          </div>
          <UserMenu />
        </div>
      </header>

      <main
        className={cn("mx-auto max-w-6xl px-6 py-10 sm:px-0", contentClassName)}
      >
        {children}
      </main>

      <footer className="bg-surface mx-6 mb-6 max-w-6xl rounded-lg border border-border px-6 py-6 text-center text-sm text-muted-foreground shadow-sm sm:mx-auto sm:px-0">
        © 2024 tentwenty. All rights reserved.
      </footer>
    </div>
  );
}

function UserMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  const label =
    status === "loading"
      ? "Loading..."
      : session?.user?.name || session?.user?.email || "User";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-sm font-medium text-muted-foreground hover:text-primary"
      >
        {label} ▾
      </button>
      {open && (
        <div className="bg-surface absolute right-0 mt-2 w-40 rounded-md border border-border shadow-lg">
          <button
            className="hover:bg-surface-muted flex w-full items-center px-3 py-2 text-left text-sm"
            onClick={async () => {
              setOpen(false);
              await signOut({ callbackUrl: "/", redirect: true });
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
