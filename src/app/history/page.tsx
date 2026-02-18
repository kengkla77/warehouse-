import { getAllHistory } from '@/app/actions';
import HistoryList from './HistoryList';

export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
  const transactionsRaw = await getAllHistory();

  const transactions = transactionsRaw.map((t) => ({
    id: t.id,
    type: t.type,
    name: t.name,
    qty: t.qty,
    unit: t.unit,
    officer: t.officer,
    department: t.department,
    timestamp: t.timestamp,
    
 
    requester: t.requester || undefined, 
  }));

  return <HistoryList transactions={transactions} />;
}