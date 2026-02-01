import { getAllVendors } from "@/app/actions/vendor-actions";
import Link from "next/link";
import Image from "next/image";

export default async function VendorsListPage() {
  const vendors = await getAllVendors();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
      <h1 className="text-3xl font-bold mb-10 text-gray-800">Choose a Vendor</h1>
      
      {/* 居中展示的网格布局 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-6xl">
        {vendors.map((vendor) => {
          // 提取 ID 用于跳转，比如 VENDOR#COSTCO -> COSTCO
          const vendorId = vendor.PK.split("#")[1];
          
          return (
            <Link 
              key={vendor.PK} 
              href={`/vendors/${vendorId}`} // 点击跳转到详情页
              className="group"
            >
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-2">
                {/* Logo 容器 */}
                <div className="w-40 h-40 relative flex items-center justify-center mb-4">
                  <Image 
                    src={vendor.logo || "/vendors/placeholder.png"} 
                    alt={vendor.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 160px"
                    className="object-contain group-hover:scale-110 transition-transform"
                    priority={true}
                  />
                </div>
                
                {/* 名称 */}
                <h2 className="text-xl font-semibold text-gray-700">{vendor.name}</h2>
                <p className="text-xs text-gray-400 mt-2 tracking-widest uppercase">{vendorId}</p>
              </div>
            </Link>
            
          );
        })}
      </div>

      {vendors.length === 0 && (
        <div className="text-gray-400 mt-20">No vendors found. Go to Admin to add some.</div>
      )}
        <div className="flex items-end justify-end mt-10">
            <Link href='/vendors/new/'>
            <button className="px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded-2xl">Add new vendor</button>
            </Link>
        </div>
    </div>
  );
}