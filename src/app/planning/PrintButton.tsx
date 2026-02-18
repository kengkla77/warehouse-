"use client";

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()} 
      className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium shadow-sm flex items-center gap-2 print:hidden"
    >
      🖨️ พิมพ์รายงาน
    </button>
  );
}