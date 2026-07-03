import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import DatabaseSetup from "@/components/DatabaseSetup";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RakibMart - Your Ultimate Shopping Destination",
  description: "Professional E-commerce website with Admin Panel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <DatabaseSetup />
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
