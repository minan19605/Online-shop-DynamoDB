"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { 
  VENDOR_OPTIONS, 
  PRODUCT_CATEGORIES, 
  PRODUCT_IMAGES, 
  MainCategory 
} from "@/lib/constants";

import { SavedProductRow, FetchedProduct, saveProducts, getVendorProducts } from '@/app/actions/product-actions'

export default function AddProductPage() {
  const params = useParams();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false)
  
  // 1. 获取当前 Vendor 信息
  // 强制取第一项或字符串，确保比较的是两个字符串
    const currentId = Array.isArray(params.id) ? params.id[0] : params.id;
  const vendor = VENDOR_OPTIONS.find(v => v.id === currentId) || VENDOR_OPTIONS[0];

  // 2. 状态管理：产品行数组
  const [products, setProducts] = useState<SavedProductRow[]>([
    { category: "", subCategory: "", imageUrl: "", unit: "", price: "", count:0 }
  ]);

  // 添加新行
  const addRow = () => {
    setProducts([...products, { category: "", subCategory: "", imageUrl: "", unit: "", price: "", count:0 }]);
  };

  // 删除行
  const removeRow = (index: number) => {
    if (products.length > 1) {
      setProducts(products.filter((_, i) => i !== index));
    }
  };

  // 处理输入变化
  const updateRow = (index: number, field: keyof SavedProductRow, value: any) => {
    const updated = [...products];
    const row = { ...updated[index], [field]: value };

    // 逻辑联动：如果改变了 Category，清空 SubCategory 和 Image
    if (field === "category") {
      row.subCategory = "";
      row.imageUrl = "";
    }

    // 逻辑联动：如果改变了 SubCategory，自动关联图片
    if (field === "subCategory") {
      row.imageUrl = PRODUCT_IMAGES[value] || "";
    }

    updated[index] = row;
    setProducts(updated);
  };

  const handleSaveProducts = async () => {
    setIsSaving(true)

    try {

        const result =await saveProducts(vendor.id, products)
        if (result.success) {
            alert("Success! All products have been saved.");
            router.push(`/vendors/`); // 保存后跳转
        } else {
            alert("Error: " + result.message);
        }

    }catch(e) {
        alert('An error occurred: '+ e.message)
    }finally {
        setIsSaving(false)
    }
  }

  const fetchData = async () => {
    // setLoading(true);
    const result = await getVendorProducts(vendor.id);

    if (result.success && result.data?.length) {
        console.log('Fetched: ', result.data)
        const data: SavedProductRow[] = (result.data as FetchedProduct[]).map(item => ({
            category: item.category as MainCategory,
            subCategory: item.name,      // 映射字段
            imageUrl: item.imageUrl,
            unit: item.unit,
            price: item.price,
            count: Number(item.count) || 0 // 类型修正
        }));
        setProducts(data);
    }
    // setLoading(false);
  };

  useEffect(() => {
    fetchData()
  }, [vendor])

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm border p-6">
        
        {/* Header: Vendor Logo & Name */}
        <div className="flex items-center gap-4 mb-8 border-b pb-6">
          <div className="relative w-32 h-32 border rounded-lg bg-white overflow-hidden">
            <Image src={vendor.logo} alt={vendor.name} fill className="object-contain p-2" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{vendor.name}</h1>
            <p className="text-gray-500 text-sm">Bulk Add New Products</p>
          </div>
        </div>

        {/* Table Area */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left text-gray-400 text-xs uppercase tracking-wider border-b">
                <th className="py-3 px-2 font-medium">Category</th>
                <th className="py-3 px-2 font-medium">Sub-Category</th>
                <th className="py-3 px-2 font-medium text-center">Preview</th>
                <th className="py-3 px-2 font-medium">Unit (e.g. lb)</th>
                <th className="py-3 px-2 font-medium">Price ($)</th>
                <th className="py-3 px-2 font-medium">Count</th>
                <th className="py-3 px-2 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((row, index) => (
                <tr key={index} className="group hover:bg-gray-50/50 transition-colors">
                  {/* Category Dropdown */}
                  <td className="py-4 px-2">
                    <select
                      className="w-full border rounded-lg p-2 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                      value={row.category}
                      onChange={(e) => updateRow(index, "category", e.target.value)}
                    >
                      <option value="">Select</option>
                      {Object.keys(PRODUCT_CATEGORIES).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </td>

                  {/* Sub-Category Dropdown */}
                  <td className="py-4 px-2">
                    <select
                      className="w-full border rounded-lg p-2 bg-white outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                      value={row.subCategory}
                      disabled={!row.category}
                      onChange={(e) => updateRow(index, "subCategory", e.target.value)}
                    >
                      <option value="">Select</option>
                      {row.category && PRODUCT_CATEGORIES[row.category as MainCategory].map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </td>

                  {/* Image Preview (Read Only) */}
                  <td className="py-4 px-2">
                    <div className="flex justify-center">
                      <div className="relative w-12 h-12 border rounded bg-gray-100 flex items-center justify-center overflow-hidden">
                        {row.imageUrl ? (
                          <Image src={row.imageUrl} alt="preview" fill className="object-cover" />
                        ) : (
                          <span className="text-[10px] text-gray-400 text-center px-1">No Image</span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Unit Input */}
                  <td className="py-4 px-2">
                    <input
                      type="text"
                      placeholder="e.g. 12oz bag"
                      className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
                      value={row.unit}
                      onChange={(e) => updateRow(index, "unit", e.target.value)}
                    />
                  </td>

                  {/* Price Input */}
                  <td className="py-4 px-2">
                    <input
                      type="number"
                      min= '0.00'
                      step="0.01"
                      placeholder="0.00"
                      className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                      value={row.price}
                      onChange={(e) => updateRow(index, "price", Number(e.target.value))}
                    />
                  </td>

                  {/* Count Input */}
                  <td className="py-4 px-2">
                    <input
                      type="number"
                      min='0'
                      step="1"
                      placeholder="0"
                      className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                      value={row.count}
                      onChange={(e) => updateRow(index, "count", Number(e.target.value))}
                    />
                  </td>

                  {/* Remove Button */}
                  <td className="py-4 px-2">
                    <button
                      onClick={() => removeRow(index)}
                      className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Actions */}
        <div className="mt-8 flex justify-between items-center border-t pt-6">
          <button
            onClick={addRow}
            className="flex items-center gap-2 text-blue-600 font-semibold cursor-pointer hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors"
          >
            <span className="text-xl">+</span> Add Another Line
          </button>

          <div className="flex gap-4">
            <button 
              onClick={() => router.back()}
              className="px-6 py-2.5 text-gray-600 font-medium cursor-pointer hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button 
              className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-blue-700 cursor-pointer shadow-lg shadow-blue-100 transition-all"
              disabled={isSaving}
              onClick={handleSaveProducts}
            >
              Save All Products
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}