import { getProducts, getEmployees, getStockInHistory } from "@/app/actions";
import ReceiveForm from "./ReceiveForm";

export const dynamic = 'force-dynamic';

export default async function ReceivePage() {
  const [productsRaw, officers, historyRaw] = await Promise.all([
    getProducts(),
    getEmployees(),
    getStockInHistory()
  ]);

  
  const products = productsRaw.map((p) => ({
    ...p,
    unit_price: Number(p.unit_price),
    safety_stock: Number(p.safety_stock),
    current_stock: Number(p.current_stock),
  }));

  const history = historyRaw.map((h) => ({
    ...h,
    quantity: Number(h.quantity),
    product: {
      ...h.product,
      unit_price: Number(h.product.unit_price),
      safety_stock: Number(h.product.safety_stock),
      current_stock: Number(h.product.current_stock),
    }
  }));

  return (
    <ReceiveForm 
      products={products} 
      officers={officers} 
      history={history} 
    />
  );
}