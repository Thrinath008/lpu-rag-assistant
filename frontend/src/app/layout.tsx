import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LPU RAG Assistant",
  description: "Knowledge hub and assistant for LPU students and staff.",
};

import ErrorBoundary from "@/components/ui/ErrorBoundary";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-900 text-slate-50 min-h-screen antialiased`}>
        <Navbar />
        <Sidebar />
        <div className="p-4 sm:ml-64 pt-20">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </div>
        <Toaster theme="dark" position="top-right" richColors />
      </body>
    </html>
  );
}
