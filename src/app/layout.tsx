import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "RakibMart - অনলাইন শপিং | বাংলাদেশের সেরা মার্কেটপ্লেস",
  description: "RakibMart - বাংলাদেশের সেরা অনলাইন শপিং প্ল্যাটফর্ম। ইলেকট্রনিক্স, ফ্যাশন, হোম ও আরো অনেক কিছু সেরা দামে।",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="bn">
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
