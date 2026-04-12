'use client';

import { useEffect } from 'react';
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { Toaster } from 'react-hot-toast';
import { setupAuthInterceptor } from "@/lib/authApi";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    setupAuthInterceptor();
  }, []);

  return (
    <html lang="en" className="dark">
      <head>
        <title>LPU RAG Assistant</title>
        <meta name="description" content="Knowledge hub and assistant for LPU students and staff." />
      </head>
      <body className={`${inter.className} bg-slate-900 text-slate-50 min-h-screen antialiased`}>
        <Navbar />
        <Sidebar />
        <div className="p-4 sm:ml-64 pt-20">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
