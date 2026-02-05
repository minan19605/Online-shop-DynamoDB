"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
// import { VENDOR_OPTIONS, Vendor } from "@/lib/constants";
// import { fetchCustomer, customerSchema } from '@/app/actions/customer-action'
// import { getAllProductsForCustomer, FetchedProduct } from "@/app/actions/product-actions";
import { CustomerProfile, CartItem } from '@/app/shop/page'
import Link from "next/link";
import { processOrders } from "../actions/order-action";

// import { createOrder, updateProductStock } from "@/app/actions/order-actions";

export default function CartPage() {
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  // 1. 初始化读取数据
  useEffect(() => {
    const savedCart = localStorage.getItem("shop_cart");
    const savedCustomer = localStorage.getItem("customer_info");

    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedCustomer) setCustomer(JSON.parse(savedCustomer));
  }, []);

  console.log('cart: ', cart)
  const cartList = Object.values(cart);
  const totalPrice = cartList.reduce((sum, item) => sum + (item.product.price as number * item.orderCount), 0);

  // 2. 点击 Finished 按钮的处理逻辑
  const handleFinished = async () => {
    if (!customer || cartList.length === 0) return;
    
    setIsProcessing(true);
    try {

        await processOrders(customer, cartList, totalPrice)
        localStorage.removeItem('shop_cart')
        alert("Order successful!")
        router.push('/shop')

    } catch (e) {

      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred";
      alert('An error occurred: ' + errorMessage);
      
    } finally {
      setIsProcessing(false);
    }
  };

  if (cartList.length === 0) {
    return <div className="p-10 text-center">Your cart is empty.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-cyan-800">Checkout Confirmation</h1>

      {/* 用户信息展示 */}
      <div className="bg-gray-50 p-4 rounded-lg mb-8 border border-gray-200">
        <p className="text-gray-600 text-sm">Customer Name</p>
        <p className="text-lg font-semibold">{customer?.username || "Guest"}</p>
      </div>

      {/* 产品列表 */}
      <div className="space-y-4 mb-8">
        {Object.entries(cartList).map(([key,item]) => (
          <div key={key} className="flex items-center gap-4 border-b pb-4">
            <div className="relative w-20 h-20">
              <Image 
                src={item.product.imageUrl || '/placeholder.png'} 
                alt={item.product.name} 
                fill 
                className="object-cover rounded"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-bold">{item.product.name}</h3>
              <p className="text-sm text-gray-500">Unit: {item.product.unit}</p>
              <p className="text-xs text-cyan-600">Vendor: {item.vendor.name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">${item.product.price} x {item.orderCount}</p>
              <p className="font-bold text-lg">${(item.product.price as number * item.orderCount).toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 总价与按钮 */}
      <div className="flex justify-between items-center border-t pt-6">
        <div>
          <p className="text-gray-500">Total Amount</p>
          <p className="text-3xl font-bold text-cyan-700">${totalPrice.toFixed(2)}</p>
        </div>
        <Link href='/shop'>
        <button className="px-4 py-4 rounded-2xl text-white font-bold bg-blue-500 hover:bg-blue-700 shadow-1g">Back to Shop</button>
        </Link>
        <button
          onClick={handleFinished}
          disabled={isProcessing}
          className={`px-12 py-4 rounded-full text-white font-bold text-xl transition-all ${
            isProcessing ? "bg-gray-400" : "bg-cyan-600 hover:bg-cyan-700 shadow-lg"
          }`}
        >
          {isProcessing ? "Processing..." : "Finished"}
        </button>
      </div>
    </div>
  );
}