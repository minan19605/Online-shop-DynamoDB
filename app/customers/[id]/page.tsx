"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";


// app/customer/page.tsx
import { CustomerOrder, customerSchema, getCustomerDashboard } from "@/app/actions/customer-action";
import React from "react";
import Link from "next/link";

// export default function CustomerPage({ searchParams }: { searchParams: { id: string } }) {
export default function CustomerPage() {

    const params = useParams();
    const customerId = Array.isArray(params.id) ? params.id[0] : params.id;
    
    const [profile, setProfile] = useState<customerSchema | null>(null)
    const [orders, setOrders] = useState<CustomerOrder[]>([])
    const [loading, setLoading] = useState(true)

    const fetchCustomerAllData = async (PK:string) => {
        try {
                setLoading(true);
                const data = await getCustomerDashboard(PK);
                setProfile(data.profile);
                setOrders(data.orders);
            } catch (error) {
                console.error("Failed to fetch customer data:", error);
            } finally {
                setLoading(false);
            }
    }
//   const { profile, orders } = await getCustomerDashboard(searchParams.id);

    useEffect(() => {
        if (customerId) {
            const PK = `USER#${decodeURIComponent(customerId).toUpperCase()}`
            console.log("Customer ID: ", PK)
            fetchCustomerAllData(PK);
        }
    }, [customerId]);
    console.log('Profile ', profile)
    console.log('order: ', orders)

    if (loading) return <div className="p-10 text-center animate-pulse">Loading dashboard...</div>;
  if (!profile) return <div className="p-10 text-center">Customer not found.</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* 1. 用户基本信息卡片 */}
      <section className="bg-white shadow-md rounded-xl p-6 border border-gray-100">
        <div className="flex row justify-between align-middle">
            <h2 className="text-2xl font-bold mb-4 border-b pb-2">Customer History orders</h2>
            <Link href='/shop'>
                <button className="px-4 py-2 bg-blue-500 hover:bg-blue-700 cursor-pointer text-white font-bold rounded-xl">Shop</button>
            </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-gray-500">Username</label>
            <p className="font-semibold text-lg">{profile.username}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Email</label>
            <p className="font-semibold text-lg">{profile.email}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Phone</label>
            <p className="font-semibold text-lg">{profile.phone}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Address</label>
            <p className="font-semibold text-lg">{profile.address}</p>
          </div>
        </div>
      </section>

      {/* 2. 历史订购记录列表 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Order History (Last 20)</h2>
        <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-600 uppercase text-sm">
              <tr>
                <th className="py-4 px-4">Product</th>
                <th className="py-4 px-4">Vendor</th>
                <th className="py-4 px-4">Unit</th>
                <th className="py-4 px-4">Price</th>
                <th className="py-4 px-4">Qty</th>
                <th className="py-4 px-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.length === 0 ? (
                <tr><td colSpan={6} className="py-10 text-center text-gray-400">No orders yet.</td></tr>
              ) : (
                orders.map((order: any) => (
                  // 注意：如果一条订单里有多个商品，这里需要进一步处理
                  // 假设你的 items 存放在 order.items 数组里
                  order.items.map((item: any, idx: number) => (
                    <tr key={`${order.SK}-${idx}`} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4 flex items-center space-x-3">
                        <img 
                          src={item.productImgUrl} 
                          alt={item.name} 
                          className="w-12 h-12 object-cover rounded shadow-sm" 
                        />
                        <span className="font-medium">{item.name}</span>
                      </td>
                      <td className="py-4 px-4 text-gray-600">{item.vendorName || 'N/A'}</td>
                      <td className="py-4 px-4 text-gray-500">{item.unit}</td>
                      <td className="py-4 px-4">${Number(item.price).toFixed(2)}</td>
                      <td className="py-4 px-4">x {item.qty}</td>
                      <td className="py-4 px-4 text-right font-bold text-blue-600">
                        ${(Number(item.price) * item.qty).toFixed(2)}
                      </td>
                    </tr>
                  ))
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}