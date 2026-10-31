'use client';

import { useEffect } from 'react';
import { Bricolage_Grotesque, Instrument_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import { setupAuthInterceptor } from "@/lib/authApi";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage", display: "swap" });
const sans = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    setupAuthInterceptor();
  }, []);

  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <head>
        <title>LPU Assistant</title>
        <meta name="description" content="Ask about LPU policies and get answers cited from the official documents." />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#f5f7fa" />
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
      <body className="min-h-dvh antialiased">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <Toaster
          position="top-center"
          toastOptions={{ style: { background: '#101828', color: '#fff', fontSize: '14px', borderRadius: '12px' } }}
        />
      </body>
    </html>
  );
}
