
"use client";

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // 👈 1. Import ตัวนี้

type Transaction = {
  id: string;
  type: string;
  name: string;
  qty: number;
  unit: string;
  officer: string;
  department: string;
  timestamp: string;
  requester?: string;
};

type Props = {
  transactions: Transaction[];
};

export default function HistoryList({ transactions }: Props) {
  const router = useRouter(); 
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL'); 
  const [deptFilter, setDeptFilter] = useState('ALL'); 

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 5000);

    return () => clearInterval(interval); 
  }, [router]);

  const departments = useMemo(() => {
    const depts = new Set(transactions.map(t => t.department).filter(d => d && d !== 'ไม่ระบุ' && d !== '-'));
    return Array.from(depts);
  }, [transactions]);

  const filteredList = transactions.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.officer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.requester && item.requester.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = typeFilter === 'ALL' || item.type === typeFilter;
    
    const matchesDept = deptFilter === 'ALL' 
      || (deptFilter === 'รับสินค้าเข้า' && item.type === 'IN')
      || item.department === deptFilter;

    return matchesSearch && matchesType && matchesDept;
  });

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="mb-8 text-center">
         <h1 className="text-3xl font-bold text-slate-800 flex justify-center items-center gap-3">
           📜 ประวัติการทำรายการ
           <span className="relative flex h-3 w-3" title="Real-time Update">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
           </span>
         </h1>
         <p className="text-slate-500 mt-2">
           ตรวจสอบความเคลื่อนไหวสินค้าในคลัง (อัปเดตอัตโนมัติ)
         </p>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 mb-6 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between gap-4">
         <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="🔍 ค้นหาชื่อสินค้า, ผู้เบิก..." 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 text-slate-700 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
         </div>

         <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0">
            
            <select 
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-slate-100 transition-all"
            >
              <option value="ALL">🏢 ทุกแผนก</option>
              <option value="รับสินค้าเข้า">📥 รับสินค้าเข้า</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
                {['ALL', 'IN', 'OUT'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setTypeFilter(type)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                      typeFilter === type 
                      ? 'bg-white text-slate-800 shadow-sm' 
                      : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {type === 'ALL' ? 'ทั้งหมด' : type === 'IN' ? 'เข้า' : 'ออก'}
                  </button>
                ))}
            </div>
         </div>
      </div>

      <div className="space-y-3">
        {filteredList.map((item) => {
           const dateObj = new Date(item.timestamp);
           const timeStr = dateObj.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
           const dateStr = dateObj.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
           const isStockIn = item.type === 'IN';

           return (
             <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-100 hover:shadow-md transition-all flex items-center justify-between group">
                <div className="flex items-center gap-4">
                   <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isStockIn ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                      {isStockIn 
                        ? <span className="text-xl">📥</span>
                        : <span className="text-xl">📤</span>
                      }
                   </div>
                   
                   <div>
                      <p className="font-bold text-slate-800 text-lg line-clamp-1">{item.name}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500 mt-1">
                         <span className="flex items-center gap-1">
                           🕒 {dateStr} {timeStr} น.
                         </span>

                         {item.department && item.department !== '-' && (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${isStockIn ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                {item.department}
                            </span>
                         )}
                      </div>
                   </div>
                </div>

                <div className="text-right shrink-0 pl-4">
                   <p className={`text-xl font-bold ${isStockIn ? 'text-emerald-600' : 'text-rose-600'}`}>
                     {isStockIn ? '+' : '-'}{item.qty.toLocaleString()} <span className="text-sm font-normal text-slate-500">{item.unit}</span>
                   </p>
                   {!isStockIn && (
                     <p className="text-xs text-slate-500 mt-1">
                       ผู้เบิก: {item.requester || '-'}
                     </p>
                   )}
                </div>
             </div>
           );
        })}

        {filteredList.length === 0 && (
           <div className="text-center py-20 text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              ไม่พบรายการที่ค้นหา
           </div>
        )}
      </div>
    </div>
  );
}