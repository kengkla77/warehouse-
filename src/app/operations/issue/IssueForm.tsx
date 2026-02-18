// src/app/operations/issue/IssueForm.tsx
"use client";

import { useState, useEffect, useRef } from 'react';
import { createBulkStockOut } from '@/app/actions';
import Link from 'next/link';

// --- ✨ COMPONENT ใหม่: SearchableSelect (ตัวเลือกแบบค้นหาได้) ---
// ตัวนี้จะช่วยให้พิมพ์ค้นหาชื่อสินค้า/คน ได้ง่ายๆ บน Tablet ครับ
type Option = {
  id: string | number;
  label: string;
  subLabel?: string;
  disabled?: boolean;
};

function SearchableSelect({
  label,
  options,
  value,
  onChange,
  placeholder,
  disabled = false
}: {
  label: string;
  options: Option[];
  value: string | number;
  onChange: (val: string) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // หาตัวที่ถูกเลือกอยู่ปัจจุบัน
  const selectedOption = options.find(o => String(o.id) === String(value));

  // กรองรายการตามคำค้นหา
  const filteredOptions = options.filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase()) ||
    (o.subLabel && o.subLabel.toLowerCase().includes(search.toLowerCase()))
  );

  useEffect(() => {
    // ถ้าเปิดกล่อง ให้โฟกัสที่ช่องพิมพ์ทันที
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    // ถ้าปิดกล่อง ให้เคลียร์คำค้นหา
    if (!isOpen) {
      setSearch("");
    }
  }, [isOpen]);

  return (
    <div className="relative w-full">
      <label className="block text-sm font-bold text-slate-700 mb-2">{label}</label>

      {/* 1. ส่วนแสดงผล (ปุ่มกดเปิด) */}
      {!isOpen ? (
        <button
          onClick={() => !disabled && setIsOpen(true)}
          disabled={disabled}
          className={`w-full px-4 py-3 rounded-xl border-2 text-left flex justify-between items-center transition-all ${disabled ? 'bg-slate-100 text-slate-400 border-slate-100 cursor-not-allowed' :
              'bg-white text-slate-700 border-slate-100 hover:border-rose-300 focus:outline-none focus:border-rose-500'
            }`}
        >
          <span className={!selectedOption ? "text-slate-400" : "font-medium"}>
            {selectedOption ? (
              <span className="flex flex-col text-left">
                <span>{selectedOption.label}</span>
                {selectedOption.subLabel && <span className="text-xs text-slate-400 font-normal">{selectedOption.subLabel}</span>}
              </span>
            ) : placeholder}
          </span>
          <span className="text-slate-400 text-xs">▼</span>
        </button>
      ) : (
        /* 2. ส่วนช่องพิมพ์ค้นหา (จะโผล่มาทับปุ่มเมื่อกด) */
        <div className="relative z-50">
          <input
            ref={inputRef}
            type="text"
            className="w-full px-4 py-3 rounded-xl border-2 border-rose-500 bg-white text-slate-800 focus:outline-none shadow-lg"
            placeholder="พิมพ์เพื่อค้นหา..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {/* ปุ่มกากบาทปิด */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>

          {/* 3. รายการตัวเลือก (Dropdown List) */}
          <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 max-h-60 overflow-y-auto z-50 divide-y divide-slate-50">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <button
                  key={opt.id}
                  disabled={opt.disabled}
                  onClick={() => {
                    onChange(String(opt.id));
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-rose-50 transition-colors flex justify-between items-center ${String(value) === String(opt.id) ? 'bg-rose-50 text-rose-700 font-bold' : 'text-slate-700'
                    } ${opt.disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''}`}
                >
                  <div className="flex flex-col">
                    <span className={opt.disabled ? 'line-through text-slate-400' : ''}>{opt.label}</span>
                  </div>
                  {opt.subLabel && (
                    <span className={`text-xs ${opt.disabled ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
                      {opt.subLabel}
                    </span>
                  )}
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-slate-400 text-sm">ไม่พบข้อมูล "{search}"</div>
            )}
          </div>
        </div>
      )}

      {/* Backdrop (ฉากหลังใสๆ ไว้กดปิดเมื่อจิ้มข้างนอก) */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/5" onClick={() => setIsOpen(false)}></div>
      )}
    </div>
  );
}

// --- จบ Component เสริม ---


type Props = {
  products: any[];
  officers: any[];
  employees: any[];
  history: any[];
  departments: any[];
};

type CartItem = {
  product: any;
  quantity: number;
};

export default function IssueForm({ products, officers, employees, history, departments }: Props) {

  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [qty, setQty] = useState<number>(1);
  const [cart, setCart] = useState<CartItem[]>([]);

  const [requesterId, setRequesterId] = useState<string>("");
  const [officerId, setOfficerId] = useState<string>("");
  const [departmentId, setDepartmentId] = useState<string>("");

  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>("");

  const selectedProduct = products.find(p => p.id.toString() === selectedProductId);

  const getAvailableStock = (productId: string) => {
    const product = products.find(p => p.id.toString() === productId);
    if (!product) return 0;

    const inCart = cart.find(c => c.product.id.toString() === productId);
    const cartQty = inCart ? inCart.quantity : 0;

    return Number(product.current_stock) - cartQty;
  };

  const availableStock = selectedProductId ? getAvailableStock(selectedProductId) : 0;

  useEffect(() => {
    setCurrentTime(new Date().toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'medium' }));
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'medium' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const addToCart = () => {
    if (!selectedProduct || qty <= 0) return;

    if (qty > availableStock) {
      alert(`เบิกเกินจำนวนที่มี! (เหลือให้เบิกได้ ${availableStock})`);
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.product.id === selectedProduct.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === selectedProduct.id
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [...prev, { product: selectedProduct, quantity: qty }];
    });

    setQty(1);
    setSelectedProductId("");
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  async function handleSaveAll() {
    if (cart.length === 0) {
      alert("กรุณาเลือกสินค้าลงรายการก่อน");
      return;
    }
    if (!requesterId || !officerId || !departmentId) {
      alert("กรุณาระบุข้อมูลให้ครบถ้วน (ผู้เบิก, ผู้จ่าย, แผนก)");
      return;
    }

    setIsLoading(true);

    const payload = {
      items: cart.map(c => ({
        productId: c.product.id.toString(),
        quantity: c.quantity
      })),
      requesterId,
      officerId,
      departmentId
    };

    const result = await createBulkStockOut(payload);

    setIsLoading(false);

    if (result.success) {
      setIsSuccess(true);
      setCart([]);
      setRequesterId("");
      setOfficerId("");
      setDepartmentId("");
    } else {
      alert("เกิดข้อผิดพลาด: " + result.message);
    }
  }

  // --- เตรียมข้อมูลสำหรับ SearchableSelect ---

  // 1. สินค้า (แปลงข้อมูลให้พร้อมแสดงผล)
  const productOptions = products.map(p => {
    const stock = getAvailableStock(p.id.toString());
    return {
      id: p.id,
      label: p.name,
      subLabel: stock > 0 ? `คงเหลือ: ${stock} ${p.unit?.name}` : '(สินค้าหมด)',
      disabled: stock <= 0
    };
  });

  // 2. พนักงาน
  const employeeOptions = employees.map(e => ({
    id: e.id,
    label: e.full_name,
    subLabel: e.nickname ? `(${e.nickname})` : ''
  }));

  // 3. เจ้าหน้าที่
  const officerOptions = officers.map(o => ({
    id: o.id,
    label: o.full_name,
    subLabel: o.nickname ? `(${o.nickname})` : ''
  }));

  // 4. แผนก
  const departmentOptions = departments?.map(d => ({
    id: d.id,
    label: d.name
  })) || [];


  return (
    <div className="max-w-6xl mx-auto py-10 px-4">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <span className="p-2 bg-rose-100 rounded-lg text-rose-600">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4m0 0l6-6m-6 6l6 6" /></svg>
            </span>
            เบิกสินค้าออก (Tablet Mode)
          </h1>
          <p className="text-slate-500 mt-2">แตะเพื่อค้นหาและเลือกรายการได้ง่ายขึ้น</p>
        </div>

        <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
          <span className="text-lg font-mono font-bold text-slate-700 min-w-[160px] text-center">
            {currentTime || "..."}
          </span>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">

        {/* --- LEFT COLUMN --- */}
        <div className="w-full xl:w-2/3 space-y-6">

          {/* Card เพิ่มรายการ */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 relative z-20"> {/* z-20 เพื่อให้ dropdown ไม่โดนบัง */}
            <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
              ➕ เพิ่มรายการ
            </h3>
            <div className="flex flex-col md:flex-row gap-4 items-end">

              <div className="flex-1 w-full">
                {/* ✨ ใช้ Component ใหม่ตรงนี้ */}
                <SearchableSelect
                  label="เลือกสินค้า"
                  placeholder="-- แตะเพื่อค้นหาสินค้า --"
                  options={productOptions}
                  value={selectedProductId}
                  onChange={(val) => {
                    setSelectedProductId(val);
                    setQty(1);
                  }}
                />
              </div>

              <div className="w-full md:w-32">
                <label className="block text-sm font-bold text-slate-700 mb-2">จำนวน</label>
                <div className="flex items-center">
                  {/* ปุ่มลบ/บวก สำหรับ Tablet จิ้มง่ายๆ */}
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    disabled={!selectedProductId}
                    className="w-12 h-[50px] bg-slate-100 rounded-l-xl border-y-2 border-l-2 border-slate-100 flex items-center justify-center text-slate-500 font-bold active:bg-slate-200"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={availableStock}
                    className="w-full h-[50px] border-y-2 border-slate-100 bg-white text-center font-bold text-lg text-slate-800 focus:outline-none"
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                    disabled={!selectedProductId}
                  />
                  <button
                    onClick={() => setQty(Math.min(availableStock, qty + 1))}
                    disabled={!selectedProductId}
                    className="w-12 h-[50px] bg-slate-100 rounded-r-xl border-y-2 border-r-2 border-slate-100 flex items-center justify-center text-slate-500 font-bold active:bg-slate-200"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={addToCart}
                disabled={!selectedProductId || availableStock <= 0}
                className="w-full md:w-auto px-6 h-[50px] bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                ลงตะกร้า 👇
              </button>
            </div>

            {/* แสดงคำเตือนถ้าสินค้าหมด */}
            {selectedProductId && availableStock <= 0 && (
              <p className="text-xs text-rose-500 mt-2 text-right font-bold">
                ❌ สินค้านี้หมดแล้ว
              </p>
            )}
          </div>

          {/* Card รายการในตะกร้า */}
          <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-100 border border-white min-h-[300px] flex flex-col z-10">
            <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
              🛒 รายการที่จะเบิก ({cart.length})
            </h3>

            <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-slate-400 text-sm border-b border-slate-100">
                    <th className="py-2 font-medium">สินค้า</th>
                    <th className="py-2 font-medium text-center">จำนวน</th>
                    <th className="py-2 font-medium text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {cart.map((item, index) => (
                    <tr key={index} className="group hover:bg-slate-50 transition-colors">
                      <td className="py-3 pr-2">
                        <p className="font-bold text-slate-700">{item.product.name}</p>
                        <p className="text-xs text-slate-400">{item.product.category?.name}</p>
                      </td>
                      <td className="py-3 text-center">
                        <span className="px-3 py-1 bg-rose-50 text-rose-700 rounded-lg font-bold">
                          {item.quantity}
                        </span>
                        <span className="text-xs text-slate-400 ml-1">{item.product.unit?.name}</span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-3 bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                        >
                          ❌
                        </button>
                      </td>
                    </tr>
                  ))}
                  {cart.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-10 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
                        ยังไม่มีรายการในตะกร้า
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* ส่วนสรุปและปุ่มยืนยัน */}
            <div className="mt-6 pt-6 border-t border-slate-100 bg-slate-50/50 -mx-6 -mb-6 p-6 rounded-b-3xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

                {/* 1. ผู้เบิก (Searchable) */}
                <div>
                  <SearchableSelect
                    label="ผู้เบิก (Requester)"
                    placeholder="-- ค้นหาชื่อพนักงาน --"
                    options={employeeOptions}
                    value={requesterId}
                    onChange={setRequesterId}
                  />
                </div>

                {/* 2. แผนก (Searchable) */}
                <div>
                  <SearchableSelect
                    label="แผนก (Department)"
                    placeholder="-- เลือกแผนก --"
                    options={departmentOptions}
                    value={departmentId}
                    onChange={setDepartmentId}
                  />
                </div>

                {/* 3. ผู้จ่าย (Searchable) */}
                <div>
                  <SearchableSelect
                    label="ผู้จ่าย (Approver)"
                    placeholder="-- ค้นหาชื่อเจ้าหน้าที่ --"
                    options={officerOptions}
                    value={officerId}
                    onChange={setOfficerId}
                  />
                </div>
              </div>

              <button
                onClick={handleSaveAll}
                disabled={isLoading || cart.length === 0}
                className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xl shadow-lg shadow-rose-200 hover:shadow-xl hover:scale-[1.01] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? "กำลังบันทึก..." : (
                  <>
                    <span>🚀</span> ยืนยันการเบิก {cart.length} รายการ
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN: ประวัติ --- */}
        <div className="w-full xl:w-1/3 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 h-full">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-rose-500 rounded-full"></span>
              ประวัติเบิกล่าสุด
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
                    <span className="text-rose-600 font-bold">-{Number(item.quantity)} {item.product?.unit?.name}</span>
                    <span className="text-slate-500 text-xs">{item.requester?.nickname || '-'}</span>
                  </div>
                </div>
              ))}
              {history.length === 0 && <p className="text-slate-400 text-center py-4">ยังไม่มีรายการเบิก</p>}
            </div>

            <Link href="/history" className="block mt-8 text-center text-sm text-slate-500 hover:text-rose-600 font-medium">
              ดูรายการทั้งหมด &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Pop-up Success */}
      {isSuccess && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">เบิกสินค้าสำเร็จ!</h2>
            <p className="text-slate-500 mb-8">บันทึกรายการทั้งหมดเรียบร้อยแล้ว</p>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/" className="py-3 px-4 rounded-xl border-2 border-slate-100 text-slate-600 font-bold hover:bg-slate-50 transition-colors">
                กลับหน้าหลัก
              </Link>
              <button onClick={() => setIsSuccess(false)} className="py-3 px-4 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition-colors">
                ทำรายการต่อ
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}