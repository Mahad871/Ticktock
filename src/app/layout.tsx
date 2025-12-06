import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { auth } from "@/auth";
import { Providers } from "@/components/providers";
import { cn } from "@/lib/utils";
import "./globals.css";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ticktock",
  description: "Timesheet Management application",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans text-foreground antialiased",
          fontSans.variable,
        )}
      >
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}
