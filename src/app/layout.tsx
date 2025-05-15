// "use client";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionProviderWrapper from "@/components/SessionWarpper";

export const metadata = {
  title: "Samar University Registration",
  description: "A Registration system for Samara university",
  icons: {
    icon: "/favicon.ico"
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
        <SessionProviderWrapper>{children}</SessionProviderWrapper> 
      </body>
    </html>
  );
}
