// src/lib/types.ts

// ประเภทการทำรายการ (รับเข้า / เบิกออก)
export type TransactionType = 'IN' | 'OUT';

// ข้อมูลสินค้า
export interface Product {
  id: string;
  code: string;        // รหัสสินค้า (เช่น FST-03-05)
  name: string;        // ชื่อสินค้า (เช่น BOLT 1/4"x1")
  category: string;    // หมวดหมู่
  currentStock: number; // จำนวนคงเหลือปัจจุบัน
  minStock: number;    // จุดสั่งซื้อ (Reorder Point) สำหรับแจ้งเตือน
  unit: string;        // หน่วยนับ (ตัว, อัน, กล่อง)
  imageUrl?: string;   // รูปภาพ (ช่วยให้หาของง่ายขึ้นบน iPad)
}

// ข้อมูลการทำรายการ (Transaction)
export interface Transaction {
  id: string;
  productId: string;
  type: TransactionType;
  quantity: number;
  date: Date;          // วันที่เวลา (Auto)
  performedBy: string; // ชื่อผู้เบิก/ผู้รับ (ดึงจาก Login หรือเลือกจาก List)
  note?: string;       // หมายเหตุ (เผื่อมี)
}