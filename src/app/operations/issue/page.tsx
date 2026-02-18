// src/app/operations/issue/page.tsx
import { 
  getProducts, getEmployees, getAllEmployees, getStockOutHistory, getDepartments 
} from "@/app/actions";
import IssueForm from "./IssueForm";

export const dynamic = 'force-dynamic';

export default async function IssuePage() {
  const [productsRaw, officersRaw, employeesRaw, historyRaw, departmentsRaw] = await Promise.all([
    getProducts(),         
    getEmployees(),        
    getAllEmployees(),     
    getStockOutHistory(),
    getDepartments()   
  ]);

  const products = productsRaw.map(p => ({
    ...p,
    unit_price: Number(p.unit_price),
    safety_stock: Number(p.safety_stock),
    current_stock: Number(p.current_stock),
  }));

  const history = historyRaw.map(h => ({
    ...h,
    quantity: Number(h.quantity),
    stock_before: Number(h.stock_before || 0), 
    
    product: {
      ...h.product,
      unit_price: Number(h.product.unit_price),
      current_stock: Number(h.product.current_stock),
      safety_stock: Number(h.product.safety_stock || 0),
    }
  }));

  return (
    <IssueForm 
      products={products} 
      officers={officersRaw} 
      employees={employeesRaw}
      history={history}
      departments={departmentsRaw} // ✅ แก้ให้ตรงกับตัวแปรที่ประกาศไว้ข้างบน
    />
  );
}