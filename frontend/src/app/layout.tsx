'use client';

import { useEffect } from 'react';
import { Inter } from "next/font/google";
import "./globals.css";
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for(let registration of registrations) {
                    registration.unregister();
                  }
                }).catch(function(err) {});
              }
            `,
          }}
        />
      </head>
      <body className={`${inter.className} bg-slate-900 text-slate-50 min-h-screen antialiased`}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <Toaster />
      </body>
    </html>
  );
}
