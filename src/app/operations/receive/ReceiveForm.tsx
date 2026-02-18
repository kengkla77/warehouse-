"use client";

import { useState, useEffect } from 'react';
import { createStockIn } from '@/app/actions';
import Link from 'next/link';


type Props = {
  products: any[];
  officers: any[];
  history: any[];
};

export default function ReceiveForm({ products, officers, history }: Props) {
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [qty, setQty] = useState<number>(1);
  const [officerId, setOfficerId] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>("");


  const selectedProduct = products.find(p => p.id.toString() === selectedProductId);


  useEffect(() => {
    setCurrentTime(new Date().toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'medium' }));

    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleString('th-TH', {
        dateStyle: 'medium',
        timeStyle: 'medium'
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  async function handleSave() {
    if (!selectedProductId || !qty || !officerId) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("productId", selectedProductId);
    formData.append("quantity", qty.toString());
    formData.append("officerId", officerId);
    formData.append("remark", "รับเข้าผ่านระบบ Web");

    const result = await createStockIn(null, formData);

    setIsLoading(false);

    if (result.success) {
      setIsSuccess(true);
      setQty(1);
    } else {
      alert("เกิดข้อผิดพลาด: " + result.message);
    }
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <span className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </span>
            รับสินค้าเข้าสต็อก
          </h1>
          <p className="text-slate-500 mt-2">ลงบันทึกรายการสินค้าใหม่ หรือเติมสต็อกสินค้าเดิม</p>
        </div>

        <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          <span className="text-lg font-mono font-bold text-slate-700 min-w-[160px] text-center">
            {currentTime || "..."}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-100 border border-white">
            <div className="space-y-6">

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">เลือกสินค้า</label>
                <select
                  className="w-full px-4 py-4 rounded-xl border-2 border-slate-100 text-slate-700 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all text-lg"
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                >
                  <option value="">-- ค้นหา/เลือกสินค้า --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (คงเหลือ: {Number(p.current_stock)} {p.unit?.name})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">จำนวนที่รับ</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      className="w-full px-4 py-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all text-2xl font-bold text-emerald-600"
                      value={qty}
                      onChange={(e) => setQty(Number(e.target.value))}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                      {selectedProduct?.unit?.name || 'หน่วย'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">ผู้บันทึก</label>
                  <select
                    className="w-full px-4 py-4 text-slate-700 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
                    value={officerId}
                    onChange={(e) => setOfficerId(e.target.value)}
                  >
                    <option value="">-- เลือกเจ้าหน้าที่ --</option>
                    {officers.map((off) => (
                      <option key={off.id} value={off.id}>
                        {off.full_name} {off.nickname ? `(${off.nickname})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={isLoading}
                className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xl shadow-lg shadow-emerald-200 hover:shadow-xl hover:scale-[1.01] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "กำลังบันทึก..." : "ยืนยันรับเข้าสต็อก"}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 h-full">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
              ประวัติล่าสุด
            </h3>

            <div className="space-y-6 relative">
              <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-slate-100"></div>

              {history.map((item) => (
                <div key={item.id} className="relative pl-6">
                  <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-slate-200 border-2 border-white"></div>
                  <p className="text-xs text-slate-400 mb-1">
                    {new Date(item.created_at).toLocaleDateString('th-TH')} {new Date(item.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                  </p>
                  <p className="font-bold text-slate-800 line-clamp-1">{item.product?.name}</p>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-emerald-600 font-bold">+{Number(item.quantity)} {item.product?.unit?.name}</span>
                    <span className="text-slate-400 text-xs">โดย {item.officer?.name || '-'}</span>
                  </div>
                </div>
              ))}

              {history.length === 0 && (
                <p className="text-slate-400 text-center py-4">ยังไม่มีรายการวันนี้</p>
              )}
            </div>

            <Link href="/history" className="block mt-8 text-center text-sm text-slate-500 hover:text-emerald-600 font-medium">
              ดูรายการทั้งหมด &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* --- Success Modal (Pop-up) --- */}
      {isSuccess && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">บันทึกสำเร็จ!</h2>
            <p className="text-slate-500 mb-8">เพิ่มสินค้าเข้าสู่สต็อกเรียบร้อยแล้ว</p>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/" className="py-3 px-4 rounded-xl border-2 border-slate-100 text-slate-600 font-bold hover:bg-slate-50 transition-colors">
                กลับหน้าหลัก
              </Link>
              <button
                onClick={() => setIsSuccess(false)}
                className="py-3 px-4 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors"
              >
                ทำรายการต่อ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}