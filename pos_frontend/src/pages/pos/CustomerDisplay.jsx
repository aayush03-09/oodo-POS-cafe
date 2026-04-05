import { usePOS } from '../../context/POSContext';
import { formatCurrency } from '../../utils/formatCurrency';

export default function CustomerDisplay() {
  const { currentOrder } = usePOS();
  if (!currentOrder) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #f7fee7 50%, #e0f2fe 100%)' }}>
      <div className="text-center"><div className="text-8xl mb-6">☕</div><h1 className="text-4xl font-bold text-slate-800">Welcome to POS Cafe</h1><p className="text-slate-400 mt-4 text-xl">Your order will appear here</p></div>
    </div>
  );
  const isPaid = currentOrder.status === 'paid';
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #f7fee7 50%, #e0f2fe 100%)' }}>
      {isPaid ? (
        <div className="text-center"><div className="text-8xl mb-6">🎉</div><h1 className="text-4xl font-bold text-slate-800 mb-4">Thank You!</h1><p className="text-2xl text-lime-600">Payment Received</p></div>
      ) : (
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-slate-800 text-center mb-6">Your Order</h2>
          <div className="space-y-3 mb-6">{currentOrder.items?.map(item => <div key={item.id} className="flex justify-between bg-slate-50 p-3 rounded-xl border border-slate-100"><span className="text-slate-700">{item.product_name} x{item.quantity}</span><span className="text-sky-600">{formatCurrency(item.subtotal)}</span></div>)}</div>
          <div className="border-t border-slate-200 pt-4 flex justify-between text-2xl font-bold"><span className="text-slate-700">Total</span><span className="text-lime-600">{formatCurrency(currentOrder.total)}</span></div>
          <div className={`mt-6 text-center py-3 rounded-xl font-bold text-lg ${isPaid ? 'bg-lime-100 text-lime-600' : 'bg-red-100 text-red-500'}`}>{isPaid ? 'PAID' : 'UNPAID'}</div>
        </div>
      )}
    </div>
  );
}
