// src/app/layout.tsx
import './globals.css';
import { Prompt } from 'next/font/google'; 
import Link from 'next/link';
import { auth, signOut } from '@/auth'; 

const prompt = Prompt({
  weight: ['300', '400', '500', '700'],
  subsets: ['thai', 'latin'],
  display: 'swap',
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const user = session?.user;
  const role = user?.role; 

  const isStore = role === 'operator' || role === 'store_officer' || role === 'store';
  
  const isAdmin = role === 'admin' || role === 'viewer' || role === 'manager' || role === 'Boss' || role === 'Admin' || role === 'Manager';

  return (
    <html lang="en">
      <body className={`${prompt.className} bg-slate-50 flex h-screen overflow-hidden text-slate-800`}>

        {/* --- SIDEBAR --- */}
        {/* ✅ เพิ่ม print:hidden เพื่อซ่อนเมนูตอนสั่งพิมพ์ */}
        <aside className="w-72 bg-slate-800 text-white flex flex-col shadow-2xl z-10 print:hidden">
          
          <div className="p-8 bg-slate-900/50 backdrop-blur-sm">
            <h1 className="text-2xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              📦 Warehouse
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-light">
              {user ? `Welcome, ${user.nickname || user.name}` : 'System v2.0'}
            </p>
          </div>

          <nav className="flex-1 p-4 space-y-3 overflow-y-auto">
            {(isStore || isAdmin) && (
              <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all group">
                <span className="text-2xl group-hover:scale-110 transition">📦</span> {/* เปลี่ยนไอคอนนิดนึงให้สื่อความหมาย */}
                <span className="font-medium">รายการสินค้า</span>
              </Link>
            )}

            {isAdmin && (
              <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all group">
                <span className="text-2xl group-hover:scale-110 transition">📊</span>
                <span className="font-medium">Dashboard</span>
              </Link>
            )}

            {/* 🛠️ เมนู 2: Operations (เฉพาะ Store เท่านั้น!) */}
            {isStore && (
              <>
                <div className="pt-4 pb-2 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Operations</div>

                <Link href="/operations/receive" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-emerald-500/20 text-emerald-300 hover:text-emerald-200 transition-all border border-transparent hover:border-emerald-500/30">
                  <span className="text-2xl">📥</span>
                  <span className="font-medium">รับสินค้าเข้า (In)</span>
                </Link>

                <Link href="/operations/issue" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 transition-all border border-transparent hover:border-rose-500/30">
                  <span className="text-2xl">📤</span>
                  <span className="font-medium">เบิกสินค้าออก (Out)</span>
                </Link>
              </>
            )}

            {/* 🧠 เมนู 3: Planning (เฉพาะ Admin เท่านั้น!) */}
            {isAdmin && (
              <>
                <div className="pt-4 pb-2 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Management</div>
                
                <Link href="/planning" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 transition-all border border-transparent hover:border-amber-500/30">
                  <span className="text-2xl">📑</span>
                  <span className="font-medium">วางแผนสั่งซื้อ</span>
                </Link>
              </>
            )}

            {/* 📜 เมนู 4: Reports (ดูได้ทุกคน) */}
            <div className="pt-4 pb-2 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Reports</div>

            <Link href="/history" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all group">
              <span className="text-2xl group-hover:scale-110 transition">📜</span>
              <span className="font-medium">ประวัติรายการ</span>
            </Link>

          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-slate-700 bg-slate-900/20">
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button 
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-700 hover:bg-rose-600 text-slate-300 hover:text-white transition-all font-medium"
              >
                <span>🚪</span> ออกจากระบบ
              </button>
            </form>
          </div>

        </aside>

        {/* --- MAIN CONTENT --- */}
        {/* ✅ เพิ่ม Class สำหรับ Print ให้เนื้อหาขยายเต็ม */}
        <main className="flex-1 overflow-auto p-8 bg-slate-50 print:w-full print:p-0 print:overflow-visible">
          {children}
        </main>
      </body>
    </html>
  );
}