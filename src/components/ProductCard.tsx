"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";

interface ProductCardProps {
  product: {
    id: number;
    title: string;
    price: string;
    imageUrl: string;
    categoryName: string | null;
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCart((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      imageUrl: product.imageUrl,
    });
    toast.success("Added to cart");
  };

  return (
    <div className="group relative bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <Link href={`/product/${product.id}`} className="block relative aspect-square bg-gray-100 overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
            unoptimized
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-gray-400">
            No image
          </div>
        )}
      </Link>
      
      <div className="p-4">
        {product.categoryName && (
          <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">{product.categoryName}</p>
        )}
        <Link href={`/product/${product.id}`}>
          <h3 className="text-sm font-medium text-gray-900 line-clamp-1 hover:text-blue-600 transition-colors">
            {product.title}
          </h3>
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-lg font-bold text-gray-900">${Number(product.price).toFixed(2)}</p>
          <button 
            onClick={handleAddToCart}
            className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
            aria-label="Add to cart"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
