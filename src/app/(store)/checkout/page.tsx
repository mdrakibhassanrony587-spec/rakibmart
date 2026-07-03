"use client";

import { useCart } from "@/lib/cart";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createOrder } from "./actions";
import toast from "react-hot-toast";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
        <p className="text-gray-500 mb-8">Add some items to your cart to proceed with checkout.</p>
        <button onClick={() => router.push('/products')} className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700">
          Continue Shopping
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const result = await createOrder(formData, items, totalPrice());
    
    if (result.error) {
      toast.error(result.error);
      setIsSubmitting(false);
    } else if (result.success) {
      toast.success("Order placed successfully!");
      clearCart();
      router.push(`/checkout/success?orderId=${result.orderId}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6 bg-white p-6 md:p-8 rounded-xl shadow-sm border">
            <div>
              <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input type="text" name="customerName" id="customerName" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700">Email Address</label>
                  <input type="email" name="customerEmail" id="customerEmail" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input type="tel" name="customerPhone" id="customerPhone" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="customerAddress" className="block text-sm font-medium text-gray-700">Shipping Address</label>
                  <textarea name="customerAddress" id="customerAddress" rows={3} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"></textarea>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-gray-50 p-6 md:p-8 rounded-xl border">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <ul className="space-y-4 mb-6">
              {items.map((item) => (
                <li key={item.id} className="flex py-2">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 relative bg-white">
                    <Image src={item.imageUrl} alt={item.title} fill className="object-cover object-center" unoptimized />
                  </div>
                  <div className="ml-4 flex flex-1 flex-col justify-center">
                    <div className="flex justify-between text-sm font-medium text-gray-900">
                      <h3 className="line-clamp-1">{item.title}</h3>
                      <p className="ml-4">${(Number(item.price) * item.quantity).toFixed(2)}</p>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Qty {item.quantity}</p>
                  </div>
                </li>
              ))}
            </ul>
            
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <p className="text-gray-600">Subtotal</p>
                <p className="font-medium text-gray-900">${totalPrice().toFixed(2)}</p>
              </div>
              <div className="flex justify-between text-sm">
                <p className="text-gray-600">Shipping</p>
                <p className="font-medium text-gray-900">Free</p>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-4 mt-4">
                <p>Total</p>
                <p>${totalPrice().toFixed(2)}</p>
              </div>
            </div>

            <button
              type="submit"
              form="checkout-form"
              disabled={isSubmitting}
              className="mt-8 w-full bg-blue-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Processing...' : 'Place Order (Cash on Delivery)'}
            </button>
            <p className="text-center text-sm text-gray-500 mt-4">Payment will be collected upon delivery.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
