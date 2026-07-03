import { db } from "@/db";
import { products, orders, categories } from "@/db/schema";
import { sql } from "drizzle-orm";
import { Package, ShoppingCart, Tags, DollarSign } from "lucide-react";

export default async function AdminDashboard() {
  const [productsCountResult] = await db.select({ count: sql<number>`count(*)` }).from(products);
  const [ordersCountResult] = await db.select({ count: sql<number>`count(*)` }).from(orders);
  const [categoriesCountResult] = await db.select({ count: sql<number>`count(*)` }).from(categories);
  const [totalRevenueResult] = await db.select({ total: sql<number>`sum(${orders.totalAmount})` }).from(orders).where(sql`${orders.status} != 'cancelled'`);

  const stats = [
    { name: 'Total Revenue', value: `$${Number(totalRevenueResult?.total || 0).toFixed(2)}`, icon: DollarSign },
    { name: 'Total Orders', value: ordersCountResult.count, icon: ShoppingCart },
    { name: 'Total Products', value: productsCountResult.count, icon: Package },
    { name: 'Total Categories', value: categoriesCountResult.count, icon: Tags },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div key={item.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <item.icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{item.name}</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{item.value}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Recent Orders could go here */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Welcome to RakibMart Admin Panel</h2>
        <p className="text-gray-500">Manage your products, categories, and orders from the sidebar menu.</p>
      </div>
    </div>
  );
}
