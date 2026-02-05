"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getAllProductsForCustomer, FetchedProduct } from "@/app/actions/product-actions";
import { VENDOR_OPTIONS, Vendor } from "@/lib/constants";
import { fetchCustomer, customerSchema } from '@/app/actions/customer-action'
import Link from "next/link";
import {useRouter} from "next/navigation";

export interface CustomerProfile {
    PK: string;
    username: string;  
    address: string;
    phone: string;
    email: string;
}

export interface CartItem {
    vendor: Vendor;
    product: FetchedProduct;
    orderCount: number;
}

export default function CustomerProductPage() {
  const [products, setProducts] = useState<FetchedProduct[]>([]);
  const [cart, setCart] = useState<Record<string, CartItem>>({}); 
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);

  const router = useRouter();

  useEffect(() => {
    getAllProductsForCustomer().then(res => {
      if (res.success) setProducts(res.data as FetchedProduct[]);
    });

    const getCustomerProfile = async () => {

        const res = await fetchCustomer()
        if(res.success) {
            const data = res.data as customerSchema
            const profile: CustomerProfile = {
                PK: data.PK,
                username: data.username,
                address: data.address,
                phone: data.phone,
                email: data.email,
             }
             setCustomer(profile)
             console.log("customer: ", profile)
        }else {
            console.error('fetch customer error: ', res.error)
        }
    }

    getCustomerProfile()

  }, []);

  console.log("customer: ", customer)

  // 处理数量增减
  const updateCount = (uniqueKey:string, vendor:Vendor, product:FetchedProduct, delta: number) => {

    // Get current ordered product number
    const currentOrderCount = cart[uniqueKey]?.orderCount || 0;
    const newOrderCount = currentOrderCount + delta
    if(newOrderCount > Number(product.count)) {
        alert('Reached to max number')
        return
    }

    setCart(prev => {
        
        if (newOrderCount <= 0) {
            // const { [uniqueKey]:_unused, ...rest} = prev;
            const rest = { ...prev };
            // 直接删除属性，不产生新变量
            delete rest[uniqueKey];
            return rest
        }
        
        return {
            ...prev,
            [uniqueKey]: {
                vendor: vendor,
                product: product,
                orderCount: newOrderCount,
                }
            }
        }
    );
  };

  // 根据 PK (VENDOR#ID) 查找 Vendor 信息
  const getVendorInfo = (pk: string) => {
    const id = pk.replace("VENDOR#", "");
    return VENDOR_OPTIONS.find(v => v.id === id);
  };

  console.log("Products: ", products)

    const handleGoToCart = () => {
        // 1. 将当前的购物车对象存入 localStorage
        localStorage.setItem("shop_cart", JSON.stringify(cart));
        // console.log('Cart: ', cart)

        localStorage.setItem("customer_info", JSON.stringify(customer));
        
        // 2. 跳转到购物车页面
        router.push("/cart"); 
    };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex row justify-between">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Fresh Grocery</h1>
            <Link href={`/customers/${encodeURIComponent(customer?.email || '')}`}>
            <h2 className="text-xl front-bold text-blue-600 mr-4 mt-4 hover:text-blue-700">{customer?.username}</h2>
            </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            const uniqueKey = `${product.PK}-${product.SK}`;
            const vendor = getVendorInfo(product.PK) as Vendor;
            const count = cart[uniqueKey]?.orderCount || 0;
            
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
                        onClick={() => updateCount(uniqueKey,vendor, product, -1)}
                        className="w-8 h-8 flex items-center justify-center font-bold text-gray-600 hover:text-red-600"
                      >
                        -
                      </button>
                      <span className="font-mono font-bold w-4 text-center">{count}</span>
                      <button 
                        onClick={() => updateCount(uniqueKey,vendor,product, 1)}
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
      {Object.keys(cart).length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-cyan-600 text-white px-8 py-4 rounded-full shadow-2xl flex gap-8 items-center">
           <span className="font-bold">
                Items: {Object.values(cart).reduce((total, item) => total + item.orderCount, 0)}
            </span>
           <button className="bg-white text-blue-600 px-4 py-1 rounded-full font-bold"
            onClick={handleGoToCart}
           >Checkout</button>
        </div>
      )}
    </div>
  );
}