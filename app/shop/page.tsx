"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getAllProductsForCustomer, FetchedProduct } from "@/app/actions/product-actions";
import { VENDOR_OPTIONS } from "@/lib/constants";

export default function CustomerProductPage() {
  const [products, setProducts] = useState<FetchedProduct[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({}); // 记录 SK: count

  useEffect(() => {
    getAllProductsForCustomer().then(res => {
      if (res.success) setProducts(res.data as FetchedProduct[]);
    });
  }, []);

  // 处理数量增减
  const updateCount = (sk: string, delta: number) => {
    setCart(prev => ({
      ...prev,
      [sk]: Math.max(0, (prev[sk] || 0) + delta)
    }));
  };

  // 根据 PK (VENDOR#ID) 查找 Vendor 信息
  const getVendorInfo = (pk: string) => {
    const id = pk.replace("VENDOR#", "");
    return VENDOR_OPTIONS.find(v => v.id === id);
  };

  console.log("Products: ", products)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Fresh Grocery</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            const vendor = getVendorInfo(product.PK);
            const count = cart[product.count] || 0;
            const uniqueKey = `${product.PK}-${product.SK}`;

            return (
              <div key={uniqueKey} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                {/* 图片区域 */}
                <div className="relative h-48 w-full bg-gray-100">
                  <Image 
                    src={product.imageUrl} 
                    alt={product.name} 
                    fill 
                    className="object-cover"
                  />
                  {/* Vendor Logo 悬浮小标 */}
                  {vendor && (
                    <div className="absolute top-2 left-2 bg-white/90 p-1 rounded-md shadow-sm">
                      <img src={vendor.logo} alt={vendor.name} className="h-6 w-auto object-contain" />
                    </div>
                  )}
                </div>

                {/* 内容区域 */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <span className="text-[10px] font-bold text-blue-600 tracking-wider uppercase">
                        {product.category}
                      </span>
                      <h3 className="text-lg font-bold text-gray-800 capitalize">
                        {product.name.toLowerCase()}
                      </h3>
                    </div>
                  </div>
                  
                  <p className="text-gray-500 text-sm mb-4">{product.unit}</p>

                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-gray-900">
                      ${Number(product.price).toFixed(2)}
                    </span>

                    {/* 数量控制组件 */}
                    <div className="flex items-center gap-3 bg-gray-100 rounded-full px-3 py-1">
                      <button 
                        onClick={() => updateCount(product.count, -1)}
                        className="w-8 h-8 flex items-center justify-center font-bold text-gray-600 hover:text-red-600"
                      >
                        -
                      </button>
                      <span className="font-mono font-bold w-4 text-center">{count}</span>
                      <button 
                        onClick={() => updateCount(product.count, 1)}
                        className="w-8 h-8 flex items-center justify-center font-bold text-gray-600 hover:text-blue-600"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* 底部悬浮购物车栏 (可选) */}
      {Object.values(cart).some(c => c > 0) && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-cyan-600 text-white px-8 py-4 rounded-full shadow-2xl flex gap-8 items-center">
           <span className="font-bold">Items: {Object.values(cart).reduce((a, b) => a + b, 0)}</span>
           <button className="bg-white text-blue-600 px-4 py-1 rounded-full font-bold">Checkout</button>
        </div>
      )}
    </div>
  );
}