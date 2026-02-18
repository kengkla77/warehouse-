"use client";

import { useState } from "react";
import Link from "next/link";

type Product = {
  id: number;
  name: string;
  category: { name: string } | null;
  unit: { name: string } | null;
  current_stock: number;
  safety_stock: number;
  unit_price: number;
};

export default function PlanningTable({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    const sortedProducts = [...products].sort((a: any, b: any) => {
      let aValue = key.includes('.') ? key.split('.').reduce((o, i) => o[i], a) : a[key];
      let bValue = key.includes('.') ? key.split('.').reduce((o, i) => o[i], b) : b[key];

      if (!isNaN(Number(aValue)) && !isNaN(Number(bValue))) {
        aValue = Number(aValue);
        bValue = Number(bValue);
      }

      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    setSortConfig({ key, direction });
    setProducts(sortedProducts);
  };

  const getSortIcon = (key: string) => {
    if (sortConfig?.key !== key) return <span className="text-slate-300 ml-1">↕</span>;
    return sortConfig.direction === 'asc' ? <span className="text-blue-500 ml-1">↑</span> : <span className="text-blue-500 ml-1">↓</span>;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
            <tr>
              {/* --- หัวตาราง (คลิกเพื่อ Sort) --- */}
              <th onClick={() => handleSort('name')} className="px-6 py-4 font-bold cursor-pointer hover:bg-slate-100 transition">
                ชื่อสินค้า {getSortIcon('name')}
              </th>
              <th onClick={() => handleSort('category.name')} className="px-6 py-4 font-bold cursor-pointer hover:bg-slate-100 transition">
                หมวดหมู่ {getSortIcon('category.name')}
              </th>
              <th onClick={() => handleSort('current_stock')} className="px-6 py-4 font-bold text-right cursor-pointer hover:bg-slate-100 transition">
                คงเหลือ {getSortIcon('current_stock')}
              </th>
              
              {/* ✨ เพิ่มช่องจุดสั่งซื้อ (Safety Stock) ตามคำขอ ✨ */}
              <th onClick={() => handleSort('safety_stock')} className="px-6 py-4 font-bold text-right cursor-pointer hover:bg-slate-100 transition bg-amber-50/50 text-amber-700">
                จุดสั่งซื้อ (Min) {getSortIcon('safety_stock')}
              </th>
              
              <th onClick={() => handleSort('unit_price')} className="px-6 py-4 font-bold text-right cursor-pointer hover:bg-slate-100 transition">
                ราคาต่อหน่วย {getSortIcon('unit_price')}
              </th>
              <th className="px-6 py-4 font-bold text-center">สถานะ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((p) => {
              // คำนวณสถานะ
              const isLowStock = p.current_stock <= p.safety_stock;
              const gap = p.safety_stock - p.current_stock; 

              return (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {p.name}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    <span className="px-2 py-1 bg-slate-100 rounded text-xs">
                      {p.category?.name || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-700">
                    {p.current_stock.toLocaleString()} <span className="text-xs font-normal text-slate-400">{p.unit?.name}</span>
                  </td>
                  
                  {/* ✨ แสดงจุดสั่งซื้อ ✨ */}
                  <td className="px-6 py-4 text-right font-medium text-amber-700 bg-amber-50/30">
                    {p.safety_stock.toLocaleString()}
                  </td>

                  <td className="px-6 py-4 text-right text-slate-600">
                    {p.unit_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  
                  <td className="px-6 py-4 text-center">
                    {isLowStock ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                        ⚠️ สั่งเพิ่มด่วน ({gap > 0 ? `+${gap}` : '0'})
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        ✅ ปกติ
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {products.length === 0 && (
        <div className="p-10 text-center text-slate-400">ไม่พบรายการสินค้า</div>
      )}
    </div>
  );
}