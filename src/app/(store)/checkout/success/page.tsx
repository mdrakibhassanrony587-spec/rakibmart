import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: Promise<{ orderId?: string }> }) {
  const resolvedSearchParams = await searchParams;
  return (
    <div className="container mx-auto px-4 py-24 text-center max-w-2xl">
      <div className="flex justify-center mb-6">
        <CheckCircle className="w-20 h-20 text-green-500" />
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Order Confirmed!</h1>
      <p className="text-xl text-gray-600 mb-8">
        Thank you for your purchase. Your order {resolvedSearchParams.orderId ? `(#${resolvedSearchParams.orderId}) ` : ''}has been received and is being processed.
      </p>
      <div className="bg-gray-50 p-6 rounded-xl mb-8">
        <p className="text-gray-700 mb-2">We will contact you shortly to confirm the delivery details.</p>
        <p className="text-sm text-gray-500">Payment method: Cash on Delivery</p>
      </div>
      <Link href="/" className="inline-flex items-center justify-center rounded-xl border border-transparent bg-blue-600 px-8 py-4 text-base font-medium text-white hover:bg-blue-700 md:py-4 md:px-10 md:text-lg">
        Continue Shopping
      </Link>
    </div>
  );
}
