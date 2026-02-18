// src/components/MovementAnalysis.tsx
"use client";

import { useEffect, useState } from "react";
import { getProductMovementStats } from "@/app/actions";

export default function MovementAnalysis() {
  const [data, setData] = useState<{ fastMoving: any[]; deadStock: any[] } | null>(null);

  useEffect(() => {
    getProductMovementStats().then(setData);
  }, []);

  if (!data) return <div className="p-6 text-center text-slate-400 animate-pulse">กำลังวิเคราะห์ข้อมูล...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      
      {/* 🐇 Fast Moving Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100">
        <div className="flex items-center gap-3 mb-4 border-b border-emerald-50 pb-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-xl">🔥</div>
          <div>
            <h3 className="font-bold text-slate-800">สินค้าหมุนเวียนเร็ว (Top 5)</h3>
            <p className="text-xs text-slate-500">ยอดเบิกสูงสุดใน 30 วันล่าสุด</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 text-xs">
                <th className="pb-2">สินค้า</th>
                <th className="pb-2 text-right">ยอดเบิก</th>
                <th className="pb-2 text-right">คงเหลือ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-50">
              {data.fastMoving.map((p, index) => (
                <tr key={p.id}>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 flex items-center justify-center bg-slate-100 rounded text-[10px] font-bold text-slate-500">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-slate-700 truncate max-w-[150px]" title={p.name}>{p.name}</p>
                        <p className="text-[10px] text-slate-400">{p.category?.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                      {p.movement_score.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3 text-right text-slate-500">
                    {p.current_stock.toLocaleString()}
                  </td>
                </tr>
              ))}
              {data.fastMoving.length === 0 && (
                <tr><td colSpan={3} className="text-center py-4 text-slate-400">ไม่มีรายการเคลื่อนไหว</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🐢 Dead Stock Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-rose-100">
        <div className="flex items-center gap-3 mb-4 border-b border-rose-50 pb-3">
          <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-xl">🕸️</div>
          <div>
            <h3 className="font-bold text-slate-800">สินค้าค้างสต็อก (Dead Stock)</h3>
            <p className="text-xs text-slate-500">ไม่มีการเบิกใน 30 วัน (เรียงตามมูลค่าจม)</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 text-xs">
                <th className="pb-2">สินค้า</th>
                <th className="pb-2 text-right">จำนวนที่จม</th>
                <th className="pb-2 text-right">มูลค่ารวม</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-50">
              {data.deadStock.map((p, index) => {
                const lostValue = p.current_stock * p.unit_price;
                return (
                  <tr key={p.id}>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 flex items-center justify-center bg-slate-100 rounded text-[10px] font-bold text-slate-500">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-slate-700 truncate max-w-[150px]" title={p.name}>{p.name}</p>
                          <p className="text-[10px] text-slate-400">{p.category?.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-right font-medium text-slate-600">
                       {p.current_stock.toLocaleString()} {p.unit?.name}
                    </td>
                    <td className="py-3 text-right">
                      <span className="font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded">
                        ฿{lostValue.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {data.deadStock.length === 0 && (
                <tr><td colSpan={3} className="text-center py-4 text-slate-400 text-xs">ยอดเยี่ยม! ไม่มีสินค้าค้างสต็อก</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}