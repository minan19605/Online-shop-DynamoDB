
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <h1 className="text-4xl font-bold mb-12 text-gray-800">Online Shop Demo System</h1>
      
      <div className="flex gap-8">
        {/* Customer 按钮 - 目前指向根目录或预留路径 */}
        <Link href="/shop">
          <button className="px-8 py-4 bg-green-600 text-white rounded-lg text-xl font-semibold hover:bg-green-700 transition-colors shadow-lg">
            I&apos;m Customer
          </button>
        </Link>

        {/* Admin 按钮 - 跳转到供应商管理页面 */}
        <Link href="/vendors">
          <button className="px-8 py-4 bg-blue-600 text-white rounded-lg text-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg">
            Admin
          </button>
        </Link>
      </div>
      
      <p className="mt-8 text-gray-500">Click Admin to manage your vendors and inventory.</p>
    </main>
  );
}
