import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getProducts } from "@/app/actions";
import PlanningTable from "./PlanningTable"; 
import PrintButton from "./PrintButton";
import MovementAnalysis from '@/components/MovementAnalysis';

export default async function PlanningPage() {

  const session = await auth();
  const role = session?.user?.role;
  const isAdmin = role === 'admin' || role === 'viewer' || role === 'manager' || role === 'Boss' || role === 'Admin' || role === 'Manager';

  if (!isAdmin) {
    redirect("/"); 
  }

  const products = await getProducts('');

  return (
    <div className="max-w-7xl mx-auto pb-20 print:max-w-none print:pb-0">
      
      {/* 1. ส่วน Header (ชื่อหน้า + ปุ่ม Print) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            📑 วางแผนสั่งซื้อ (Reorder Planning)
          </h1>
          <p className="text-slate-500 mt-1">
            รายการสินค้าทั้งหมด ตรวจสอบจุดสั่งซื้อและสถานะคงคลัง
          </p>
        </div>
        
        <div>
           <PrintButton />
        </div>
      </div>

      {/* 2. ส่วนวิเคราะห์ */}
      <div className="mb-8 print:hidden">
        <MovementAnalysis />
      </div>

      {/* 3. ตารางสินค้า */}
      <PlanningTable initialProducts={products} />
      
    </div>
  );
}