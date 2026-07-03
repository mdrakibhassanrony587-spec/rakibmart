import { Navbar } from "@/components/Navbar";
import { CartSidebar } from "@/components/CartSidebar";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <CartSidebar />
      <footer className="bg-white border-t py-12 mt-12">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} RakibMart. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
