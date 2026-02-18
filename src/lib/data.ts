// src/lib/data.ts
export const mockProducts = [
  {
    id: '1',
    code: 'FST-03-05',
    name: 'BOLT 1/4"x1"',
    category: 'Hardware',
    currentStock: 120,
    minStock: 50,
    unit: 'ตัว',
    status: 'NORMAL' // NORMAL, LOW, OUT
  },
  {
    id: '2',
    code: 'FST-03-06',
    name: 'สรูหัวจม 5/16"',
    category: 'Hardware',
    currentStock: 8,
    minStock: 20,
    unit: 'ตัว',
    status: 'LOW' // ของใกล้หมด
  },
  {
    id: '3',
    code: 'PAINT-01',
    name: 'สีสเปรย์ สีส้ม',
    category: 'Chemical',
    currentStock: 2,
    minStock: 5,
    unit: 'กระป๋อง',
    status: 'LOW'
  },
];