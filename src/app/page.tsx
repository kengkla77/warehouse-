// src/app/page.tsx
import { getProducts, getSummaryStats } from './actions';
import SearchInput from '@/components/SearchInput';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';



export default async function Dashboard({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const session = await auth();
  if (!session) {
    redirect('/login'); 
  }

  const query = await searchParams;
  const q = query?.q || '';

  const products = await getProducts(q);
  const stats = await getSummaryStats();

  return (
    <div className="max-w-7xl mx-auto pb-20">
      {/* --- ส่วนหัว (Header) --- */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">📦 สต็อกสินค้า </h1>
          <div className="text-slate-500 mt-1">
            ทั้งหมด <span className="font-bold text-slate-800">{stats.totalItems}</span> รายการ
            {stats.lowStockItems > 0 && (
              <span className="ml-3 text-rose-500 font-bold bg-rose-50 px-2 py-1 rounded-lg">
                ⚠️ ใกล้หมด {stats.lowStockItems} รายการ
              </span>
            )}
          </div>
        </div>

        <div>
          <SearchInput />
        </div>
      </header>

      {/* ✅ แก้ไข: ใช้ div หรือ section ครอบ grid ได้เลย (ห้ามใช้ p หรือ span) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((p) => {
          const currentStock = Number(p.current_stock);
          const safetyStock = Number(p.safety_stock);
          const unitPrice = Number(p.unit_price);
          const isLow = currentStock <= safetyStock;

          return (
            <div
              key={p.id}
              className={`bg-white p-5 rounded-xl border transition-all hover:shadow-lg ${isLow ? 'border-rose-200 ring-2 ring-rose-50' : 'border-slate-100'}`}
            >
              <div className="flex justify-between items-start mb-3">
                {/* ✅ แก้ไข: เปลี่ยนจาก <div> เป็น <span> เพื่อให้ใส่ในบรรทัดเดียวกันได้โดยไม่ error */}
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-1 rounded">
                  {p.category?.name || 'ทั่วไป'}
                </span>

                <span className="text-sm font-semibold text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                  ฿{unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <h3 className="font-bold text-slate-700 text-lg mb-4 line-clamp-2 h-14" title={p.name}>
                {p.name}
              </h3>

              <div className="flex items-end justify-between border-t pt-3 border-slate-50">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-slate-400">คงเหลือ</p>
                    {isLow && <span className="flex w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>}
                  </div>

                  <p className={`text-2xl font-bold ${isLow ? 'text-rose-600' : 'text-slate-800'}`}>
                    {currentStock.toLocaleString()}
                  </p>

                  <p className="text-[10px] text-slate-400 mt-1">
                    (ขั้นต่ำ: {safetyStock.toLocaleString()})
                  </p>
                </div>
                <span className="text-sm font-medium text-slate-400 mb-1">
                  {p.unit?.name || 'หน่วย'}
                </span>
              </div>
            </div>
          );
        })}
      </section>

      {products.length === 0 && (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 mt-4">
          <p className="text-slate-400 text-lg">ไม่พบสินค้าที่ค้นหา</p>
          <p className="text-slate-300 text-sm mt-2">ลองพิมพ์คำค้นหาใหม่อีกครั้ง</p>
        </div>
      )}
    </div>
  );
}