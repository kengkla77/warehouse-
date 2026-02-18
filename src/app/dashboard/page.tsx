"use client";

import { useEffect, useState } from 'react';
import { getDashboardStats } from '@/app/actions';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [days, setDays] = useState<number>(7);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    const fetchData = async (isFirstLoad = false) => {
      if (isFirstLoad) setLoading(true); 
      try {
        const data = await getDashboardStats(days);
        setStats(data);
      } catch (error) {
        console.error("Fetch Error:", error);
      } finally {
        if (isFirstLoad) setLoading(false);
      }
    };

 
    fetchData(true);
    const intervalId = setInterval(() => {
      fetchData(false); 
    }, 5000);
    return () => clearInterval(intervalId);
  }, [days]); 

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center text-slate-400 animate-pulse">
          <div className="text-4xl mb-2">📦</div>
          กำลังโหลดข้อมูล...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            📊 ภาพรวมคลังสินค้า
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </h1>
          <p className="text-slate-500">สำหรับผู้บริหาร (Update Real-time)</p>
        </div>
        <div className="text-right">
           <div className="text-sm text-slate-400">ข้อมูล ณ วันที่</div>
           <div className="font-bold text-slate-700">
             {new Date().toLocaleDateString('th-TH', { dateStyle: 'long' })}
           </div>
           <div className="text-xs text-slate-400 mt-1">
             อัปเดตอัตโนมัติทุก 5 วินาที
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 transition-transform hover:scale-105">
           <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl">📦</div>
           <div>
              <p className="text-slate-500 text-sm">สินค้าทั้งหมด</p>
              <h3 className="text-3xl font-bold text-slate-800">
                {stats.totalProducts} <span className="text-sm font-normal text-slate-400">รายการ</span>
              </h3>
           </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 transition-transform hover:scale-105">
           <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 text-2xl">⚠️</div>
           <div>
              <p className="text-slate-500 text-sm">สินค้าใกล้หมด</p>
              <h3 className="text-3xl font-bold text-slate-800">
                {stats.lowStockItems} <span className="text-sm font-normal text-slate-400">รายการ</span>
              </h3>
           </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 transition-transform hover:scale-105">
           <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-2xl">💰</div>
           <div>
              <p className="text-slate-500 text-sm">มูลค่าคงคลังรวม</p>
              <h3 className="text-3xl font-bold text-slate-800">
                {stats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} 
                <span className="text-sm font-normal text-slate-400 ml-1">บาท</span>
              </h3>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">

           <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
             <h3 className="font-bold text-slate-800 flex items-center gap-2">
               {viewMode === 'chart' ? '📈' : '📋'} การเคลื่อนไหว ({days} วันล่าสุด)
               {loading && <span className="text-xs text-slate-400 font-normal animate-pulse">...กำลังโหลด</span>}
             </h3>
             
             <div className="flex gap-2">
               <div className="bg-slate-100 p-1 rounded-lg flex text-sm font-medium">
                 <button 
                   onClick={() => setDays(7)}
                   className={`px-3 py-1.5 rounded-md transition-all ${days === 7 ? 'bg-white text-blue-600 shadow-sm font-bold' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                   7 วัน
                 </button>
                 <button 
                   onClick={() => setDays(30)}
                   className={`px-3 py-1.5 rounded-md transition-all ${days === 30 ? 'bg-white text-blue-600 shadow-sm font-bold' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                   30 วัน
                 </button>
               </div>

               <div className="bg-slate-100 p-1 rounded-lg flex text-sm font-medium">
                 <button 
                   onClick={() => setViewMode('chart')}
                   className={`px-3 py-1.5 rounded-md transition-all ${viewMode === 'chart' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                   กราฟ
                 </button>
                 <button 
                   onClick={() => setViewMode('table')}
                   className={`px-3 py-1.5 rounded-md transition-all ${viewMode === 'table' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                   ตาราง
                 </button>
               </div>
             </div>
           </div>
           <div className="h-[350px] w-full">
             {viewMode === 'chart' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      tick={{fill: '#94a3b8', fontSize: 10}} 
                      interval={days > 7 ? 2 : 0} 
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <YAxis tick={{fill: '#94a3b8', fontSize: 12}} axisLine={false} tickLine={false} />
                    <Tooltip 
                      cursor={{fill: '#f8fafc'}}
                      contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)'}} 
                    />
                    <Legend iconType="circle" />
                    <Bar dataKey="in" name="รับเข้า" fill="#10b981" radius={[4, 4, 0, 0]} barSize={days > 7 ? 12 : 30} />
                    <Bar dataKey="out" name="เบิกออก" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={days > 7 ? 12 : 30} />
                  </BarChart>
                </ResponsiveContainer>
             ) : (
                <div className="overflow-auto h-full pr-2 custom-scrollbar">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-white shadow-sm z-10">
                      <tr className="border-b-2 border-slate-100 text-slate-500">
                        <th className="py-3 text-left font-semibold pl-2">วันที่</th>
                        <th className="py-3 text-right font-semibold text-emerald-600">รับเข้า</th>
                        <th className="py-3 text-right font-semibold text-rose-600">เบิกออก</th>
                        <th className="py-3 text-right font-semibold text-slate-700 pr-2">สุทธิ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {stats.chartData.map((item: any, index: number) => {
                         const net = item.in - item.out;
                         return (
                          <tr key={index} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 font-medium text-slate-700 pl-2">{item.name}</td>
                            <td className="py-3 text-right text-slate-600">
                                {item.in > 0 ? <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded">{item.in.toLocaleString()}</span> : '-'}
                            </td>
                            <td className="py-3 text-right text-slate-600">
                                {item.out > 0 ? <span className="bg-rose-50 text-rose-700 px-2 py-1 rounded">{item.out.toLocaleString()}</span> : '-'}
                            </td>
                            <td className={`py-3 text-right font-bold pr-2 ${net > 0 ? 'text-emerald-600' : net < 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                              {net > 0 ? '+' : ''}{net !== 0 ? net.toLocaleString() : '-'}
                            </td>
                          </tr>
                         );
                      })}
                    </tbody>
                    <tfoot className="sticky bottom-0 bg-slate-50 border-t-2 border-slate-100 font-bold text-slate-700">
                      <tr>
                        <td className="py-3 text-left pl-2">รวม {days} วัน</td>
                        <td className="py-3 text-right text-emerald-700">
                          {stats.chartData.reduce((sum:number, x:any) => sum + x.in, 0).toLocaleString()}
                        </td>
                        <td className="py-3 text-right text-rose-700">
                          {stats.chartData.reduce((sum:number, x:any) => sum + x.out, 0).toLocaleString()}
                        </td>
                        <td className="py-3 text-right text-slate-500 pr-2">-</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
             )}
           </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[450px]">
           <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
             🏆 สต็อกเยอะที่สุด
           </h3>
           <div className="overflow-auto flex-1 pr-2 custom-scrollbar">
             <table className="w-full">
               <thead>
                 <tr className="text-left text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                   <th className="pb-3 font-medium pl-2">ชื่อสินค้า</th>
                   <th className="pb-3 font-medium text-right pr-2">จำนวน</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {stats.topProducts.map((p: any, index: number) => (
                   <tr key={p.id}>
                     <td className="py-4 pl-2">
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index < 3 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                            {index+1}
                          </span>
                          <div className="min-w-0">
                            <p className="text-slate-700 font-medium text-sm truncate max-w-[120px]" title={p.name}>{p.name}</p>
                            <p className="text-[10px] text-slate-400">{p.unit?.name || 'หน่วย'}</p>
                          </div>
                        </div>
                     </td>
                     <td className="py-4 text-right pr-2">
                        <span className="font-bold text-slate-800 text-sm">{p.current_stock.toLocaleString()}</span>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>

      </div>
    </div>
  );
}