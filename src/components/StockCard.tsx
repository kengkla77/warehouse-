// src/components/StockCard.tsx
import { Product } from '@/lib/types';

interface StockCardProps {
  product: Product;
  onSelect: (id: string) => void;
}

export default function StockCard({ product, onSelect }: StockCardProps) {
  const isLowStock = product.currentStock <= product.minStock;

  return (
    <div 
      onClick={() => onSelect(product.id)}
      className={`
        p-4 rounded-xl shadow-sm border-2 cursor-pointer transition-all active:scale-95
        ${isLowStock ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'}
      `}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg text-gray-800">{product.name}</h3>
          <p className="text-sm text-gray-500">{product.code}</p>
        </div>
        {isLowStock && (
          <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full animate-pulse">
            Low Stock
          </span>
        )}
      </div>

      <div className="mt-4 flex justify-between items-end">
        <div>
          <p className="text-sm text-gray-500">คงเหลือ</p>
          <p className={`text-3xl font-bold ${isLowStock ? 'text-red-600' : 'text-blue-600'}`}>
            {product.currentStock} <span className="text-base font-normal text-gray-400">{product.unit}</span>
          </p>
        </div>
      </div>
    </div>
  );
}