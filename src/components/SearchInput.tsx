// src/components/SearchInput.tsx
"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";

export default function SearchInput() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  function handleSearch(term: string) {
    const params = new URLSearchParams(searchParams);
    
    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }
    
    // อัปเดต URL โดยไม่โหลดหน้าใหม่
    replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {/* ไอคอนแว่นขยาย 🔍 */}
        <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        placeholder="ค้นหาชื่อสินค้า, หมวดหมู่..."
        className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-80 shadow-sm text-slate-700"
        onChange={(e) => handleSearch(e.target.value)}
        defaultValue={searchParams.get("q")?.toString()}
      />
    </div>
  );
}