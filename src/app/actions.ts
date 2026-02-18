// src/app/actions.ts
"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

// 🛠️ Helper: แปลง Product Decimal เป็น Number (กัน Error หน้าขาว)
const sanitizeProduct = (p: any) => ({
  ...p,
  unit_price: Number(p.unit_price),
  current_stock: Number(p.current_stock),
  safety_stock: Number(p.safety_stock || 0),
});

// --- 1. ดึงสินค้า ---
export async function getProducts(query: string = '') {
  try {
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query } }, 
          { category: { name: { contains: query } } }
        ]
      },
      orderBy: { name: 'asc' },
      include: { category: true, unit: true }
    });
    
    return products.map(sanitizeProduct);

  } catch (error) {
    console.error("Database Error:", error);
    return [];
  }
}

// --- 2. ข้อมูลสรุปบน Header ---
export async function getSummaryStats() {
  try {
    const totalItems = await prisma.product.count();
    const products = await prisma.product.findMany();
    const lowStockItems = products.filter(p => Number(p.current_stock) <= Number(p.safety_stock || 0)).length; 
    return { totalItems, lowStockItems };
  } catch (error) {
    return { totalItems: 0, lowStockItems: 0 };
  }
}

// --- 3. บันทึกรับของเข้า (IN) ---
export async function createStockIn(prevState: any, formData: FormData) {
  const productId = parseInt(formData.get("productId") as string);
  const quantity = parseFloat(formData.get("quantity") as string);
  const officerId = parseInt(formData.get("officerId") as string); 
  const remark = formData.get("remark") as string || "-";
  
  if (!productId || !quantity) return { success: false, message: "กรุณาระบุข้อมูลให้ครบ" };

  try {
    await prisma.stockIn.create({
      data: {
        product_id: productId,
        quantity: quantity,
        stock_date: new Date(),
        stock_time: new Date(),
        remark: remark,
        officer_id: officerId
      }
    });

    // อัปเดตสต็อกสินค้า (บวกเพิ่ม)
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (product) {
      await prisma.product.update({
        where: { id: productId },
        data: { current_stock: Number(product.current_stock) + quantity }
      });
    }

    revalidatePath("/"); 
    revalidatePath("/operations/receive"); 
    return { success: true, message: "บันทึกสำเร็จ" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "เกิดข้อผิดพลาด" };
  }
}

// --- 4. ดึงรายชื่อพนักงาน ---
export async function getEmployees() {
  try {
    return await prisma.employee.findMany({
      where: {
        role: { in: ['store_officer', 'admin', 'manager', 'officer', 'Admin', 'Manager', 'operator', 'viewer'] }
      },
      orderBy: { full_name: 'asc' }
    });
  } catch (error) {
    return []; 
  }
}

// --- 5. ประวัติการรับเข้า ---
export async function getStockInHistory() {
  try {
    const logs = await prisma.stockIn.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      include: { product: { include: { unit: true } }, officer: true }
    });
    return logs.map(log => ({
        ...log,
        quantity: Number(log.quantity),
        product: log.product ? sanitizeProduct(log.product) : null
    }));
  } catch (error) { return []; }
}

// --- 6. ดึงรายชื่อพนักงานทั้งหมด ---
export async function getAllEmployees() {
  try {
    return await prisma.employee.findMany({ orderBy: { full_name: 'asc' } });
  } catch (error) { return []; }
}

// --- 7. ประวัติการเบิกออก ---
export async function getStockOutHistory() {
  try {
    const logs = await prisma.stockOut.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      include: { product: { include: { unit: true } }, requester: true, officer: true }
    });
    return logs.map(log => ({
        ...log,
        quantity: Number(log.quantity),
        product: log.product ? sanitizeProduct(log.product) : null
    }));
  } catch (error) { return []; }
}

// --- 8. บันทึกเบิกของออก (OUT) ---
export async function createStockOut(prevState: any, formData: FormData) {
  const productId = parseInt(formData.get("productId") as string);
  const quantity = parseFloat(formData.get("quantity") as string);
  const requesterId = parseInt(formData.get("requesterId") as string);
  const officerId = parseInt(formData.get("officerId") as string);
  
  if (!productId || !quantity || !requesterId || !officerId) return { success: false, message: "ข้อมูลไม่ครบ" };

  try {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    const currentStock = Number(product?.current_stock || 0);

    if (!product || currentStock < quantity) {
      return { success: false, message: `ยอดคงเหลือไม่พอ (มีแค่ ${currentStock})` };
    }

    await prisma.stockOut.create({
      data: {
        product_id: productId,
        quantity: quantity,
        withdrawal_date: new Date(),
        withdrawal_time: new Date(),
        requester_id: requesterId,
        officer_id: officerId,
        status: "approved"
      }
    });


    await prisma.product.update({
      where: { id: productId },
      data: { current_stock: Number(product.current_stock) - quantity }
    });
   
    revalidatePath("/");
    revalidatePath("/operations/issue");
    return { success: true, message: "บันทึกสำเร็จ" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "เกิดข้อผิดพลาด" };
  }
}

// --- 9. ประวัติรวม ---
export async function getAllHistory() {
  try {
    const LIMIT = 50;
    const stockIns = await prisma.stockIn.findMany({
      take: LIMIT,
      orderBy: { stock_date: 'desc' },
      include: { product: { include: { unit: true } }, officer: true },
    });

    const stockOuts = await prisma.stockOut.findMany({
      take: LIMIT,
      orderBy: { withdrawal_date: 'desc' },
      include: { product: { include: { unit: true } }, requester: true, officer: true, department: true },
    });

    const history = [
      ...stockIns.map((item) => {
        const date = new Date(item.stock_date);
        if (item.stock_time) date.setHours(item.stock_time.getHours(), item.stock_time.getMinutes());
        return {
          id: `IN-${item.id}`,
          type: 'IN',
          department: 'รับสินค้าเข้า',
          dateObject: date,
          name: item.product?.name || 'ลบแล้ว',
          qty: Number(item.quantity),
          unit: item.product?.unit?.name || 'หน่วย',
          officer: (item.officer as any)?.nickname || (item.officer as any)?.full_name || '-',
          requester: null, 
          timestamp: date.toISOString(),
        };
      }),
      ...stockOuts.map((item) => {
        const date = new Date(item.withdrawal_date);
        if (item.withdrawal_time) date.setHours(item.withdrawal_time.getHours(), item.withdrawal_time.getMinutes());
        return {
          id: `OUT-${item.id}`,
          type: 'OUT',
          name: item.product?.name || 'ลบแล้ว',
          qty: Number(item.quantity),
          unit: item.product?.unit?.name || 'หน่วย',
          officer: (item.officer as any)?.nickname || (item.officer as any)?.full_name || '-',
          requester: (item.requester as any)?.nickname || (item.requester as any)?.full_name || '-',
          department: item.department?.name || '-',
          dateObject: date,
          timestamp: date.toISOString(),
        };
      })
    ];

    history.sort((a, b) => b.dateObject.getTime() - a.dateObject.getTime());
    return history;

  } catch (error) {
    console.error("History Error:", error);
    return [];
  }
}

export async function getDashboardStats(days: number = 7) {
  try {
    const totalProducts = await prisma.product.count();
    const allProducts = await prisma.product.findMany();
    const lowStockCount = allProducts.filter(p => Number(p.current_stock) <= Number(p.safety_stock || 0)).length;
    const totalValueCalc = allProducts.reduce((sum, p) => sum + (Number(p.current_stock) * Number(p.unit_price)), 0);

    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stockIns = await prisma.stockIn.findMany({
      where: { stock_date: { gte: startDate } }
    });

    const stockOuts = await prisma.stockOut.findMany({
      where: { withdrawal_date: { gte: startDate } }
    });

    
    const chartDataMap = new Map();
    for(let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString('th-TH', { 
          day: 'numeric', 
          month: 'short',
          timeZone: 'Asia/Bangkok'
        });
        chartDataMap.set(key, { name: key, in: 0, out: 0 });
    }

    // 4. หยอดข้อมูลขาเข้า
    stockIns.forEach(log => {
      const key = new Date(log.stock_date).toLocaleDateString('th-TH', { 
        day: 'numeric', month: 'short', timeZone: 'Asia/Bangkok' 
      });
      if (chartDataMap.has(key)) {
        chartDataMap.get(key).in += Number(log.quantity);
      }
    });

    // 5. หยอดข้อมูลขาออก
    stockOuts.forEach(log => {
      const key = new Date(log.withdrawal_date).toLocaleDateString('th-TH', { 
        day: 'numeric', month: 'short', timeZone: 'Asia/Bangkok' 
      });
      if (chartDataMap.has(key)) {
        chartDataMap.get(key).out += Number(log.quantity);
      }
    });

    const chartData = Array.from(chartDataMap.values());
    const topProducts = allProducts.sort((a,b) => Number(b.current_stock) - Number(a.current_stock)).slice(0, 5);
    
    

    return {
      totalProducts,
      lowStockItems: lowStockCount,
      totalValue: totalValueCalc,
      chartData,
      topProducts: topProducts.map(sanitizeProduct) 
    };

  } catch (error) {
    console.error("Dashboard Error:", error);
    return null;
  }
}


export async function getProductMovementStats() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentStockOuts = await prisma.stockOut.findMany({
      where: {
        withdrawal_date: { gte: thirtyDaysAgo }
      },
      select: {
        product_id: true,
        quantity: true
      }
    });

    const allProducts = await prisma.product.findMany({
      include: {
        category: true,
        unit: true
      }
    });
   
    const movementMap = new Map<number, number>();
    
    allProducts.forEach(p => movementMap.set(p.id, 0));
    recentStockOuts.forEach(record => {
      const current = movementMap.get(record.product_id) || 0;
      movementMap.set(record.product_id, current + Number(record.quantity));
    });


    const productStats = allProducts.map(p => ({
      ...p,
      movement_score: movementMap.get(p.id) || 0,
      unit_price: Number(p.unit_price),
      current_stock: Number(p.current_stock),
      safety_stock: Number(p.safety_stock || 0)
    }));

    const fastMoving = [...productStats]
      .sort((a, b) => b.movement_score - a.movement_score)
      .slice(0, 5)
      .filter(p => p.movement_score > 0); 

    const deadStock = [...productStats]
      .filter(p => p.movement_score === 0 && p.current_stock > 0) 
      .sort((a, b) => (b.current_stock * b.unit_price) - (a.current_stock * a.unit_price))
      .slice(0, 5);

    return { fastMoving, deadStock };

  } catch (error) {
    console.error("Movement Stats Error:", error);
    return { fastMoving: [], deadStock: [] };
  }
}


export async function getDepartments() {
  try {
    return await prisma.department.findMany({ orderBy: { name: 'asc' } });
  } catch (error) {
    return [];
  }
}


export async function createBulkStockOut(data: { 
  items: { productId: string; quantity: number }[]; 
  requesterId: string; 
  officerId: string; 
  departmentId: string; 
}) {
  try {
    await prisma.$transaction(async (tx) => {
      for (const item of data.items) {
      

        await tx.product.update({
            where: { id: Number(item.productId) },
            data: { current_stock: { decrement: item.quantity } }
        });

        await tx.stockOut.create({
          data: {
            product_id: Number(item.productId),
            quantity: item.quantity,
            requester_id: Number(data.requesterId),
            officer_id: Number(data.officerId),
            department_id: Number(data.departmentId),
            withdrawal_date: new Date(),
            withdrawal_time : new Date()
            
          }
        });
      }
    });

    revalidatePath('/operations/issue');
    revalidatePath('/');
    return { success: true };

  } catch (error: any) {
    console.error("Bulk Issue Error:", error);
    return { success: false, message: error.message };
  }
}