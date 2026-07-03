"use client";

import { useCart } from "@/lib/cart";
import { ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";

export function AddToCartButton({ product }: { product: any }) {
  const addItem = useCart((state) => state.addItem);

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      imageUrl: product.imageUrl,
    });
    toast.success("Added to cart");
  };

  return (
    <button 
      onClick={handleAddToCart}
      className="w-full bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
    >
      <ShoppingCart className="w-5 h-5" />
      Add to Cart
    </button>
  );
}
