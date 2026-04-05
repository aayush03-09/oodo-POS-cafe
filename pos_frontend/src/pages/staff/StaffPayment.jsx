import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { formatCurrency } from '../../utils/formatCurrency';
import toast from 'react-hot-toast';

export default function StaffPayment() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [methods, setMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    API.get(`/orders/${orderId}/`).then(r => setOrder(r.data));
    API.get('/payment-methods/').then(r => setMethods(r.data.filter(m => m.is_enabled)));
  }, [orderId]);

  const processPayment = async () => {
    if (!selectedMethod) return toast.error('Select a payment method');
    try {
      await API.post(`/orders/${orderId}/pay/`, { method: selectedMethod, amount: order.total });
      setConfirmed(true);
      toast.success('Payment confirmed!');
    } catch { toast.error('Payment failed'); }
  };

  if (confirmed) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #f7fee7 50%, #e0f2fe 100%)' }}>
      <div className="text-center">
        <div className="text-8xl mb-6">✅</div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Payment Done!</h1>
        <p className="text-2xl text-lime-600 font-bold mb-6">{formatCurrency(order?.total)}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate(`/staff/receipt/${orderId}`)} className="px-6 py-3 bg-sky-500 text-white rounded-xl font-bold shadow-lg hover:bg-sky-400">View Receipt</button>
          <button onClick={() => navigate('/staff/orders')} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200">Back to Orders</button>
        </div>
      </div>
    </div>
  );

  if (!order) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin"></div></div>;

  const icons = { Cash: '💵', Digital: '💳', UPI: '📱' };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #f7fee7 50%, #e0f2fe 100%)' }}>
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 shadow-xl">
        <button onClick={() => navigate('/staff/orders')} className="text-slate-400 hover:text-slate-700 mb-4 text-sm">← Back to Orders</button>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Payment — Order #{order.order_number}</h2>
        <div className="text-sm text-slate-400 mb-4">Table {order.table_number}</div>
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-6">
          {order.items?.map(item => (
            <div key={item.id} className="flex justify-between py-1">
              <span className="text-slate-600">{item.product_name} ×{item.quantity}</span>
              <span className="text-slate-700">{formatCurrency(item.subtotal)}</span>
            </div>
          ))}
          <div className="border-t border-slate-200 mt-2 pt-2 flex justify-between text-lg font-bold">
            <span className="text-slate-700">Total</span>
            <span className="text-lime-600">{formatCurrency(order.total)}</span>
          </div>
        </div>
        <h3 className="text-sm text-slate-500 mb-3 font-medium">Payment Method</h3>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {methods.map(m => (
            <button key={m.id} onClick={() => setSelectedMethod(m.id)}
              className={`p-4 rounded-xl border text-center transition-all ${selectedMethod === m.id ? 'border-sky-400 bg-sky-50 shadow' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
              <div className="text-2xl mb-1">{icons[m.name] || '💰'}</div>
              <div className="text-sm text-slate-700 font-medium">{m.name}</div>
            </button>
          ))}
        </div>
        <button onClick={processPayment}
          className="w-full py-3 bg-gradient-to-r from-lime-500 to-lime-600 text-white font-bold rounded-xl hover:from-lime-400 hover:to-lime-500 transition-all shadow-lg shadow-lime-200 text-lg">
          ✓ Mark Payment Done
        </button>
      </div>
    </div>
  );
}
