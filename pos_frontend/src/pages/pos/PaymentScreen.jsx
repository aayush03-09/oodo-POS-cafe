import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { formatCurrency } from '../../utils/formatCurrency';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';

export default function PaymentScreen() {
  const { orderId } = useParams(); const navigate = useNavigate();
  const [order, setOrder] = useState(null); const [methods, setMethods] = useState([]); const [selectedMethod, setSelectedMethod] = useState(null);
  const [showQR, setShowQR] = useState(false); const [qrData, setQrData] = useState(null); const [confirmed, setConfirmed] = useState(false);

  useEffect(() => { API.get(`/orders/${orderId}/`).then(r => setOrder(r.data)); API.get('/payment-methods/').then(r => setMethods(r.data.filter(m => m.is_enabled))); }, [orderId]);

  const validate = async () => {
    if (!selectedMethod) return toast.error('Select payment method');
    const method = methods.find(m => m.id === selectedMethod);
    if (method.name === 'UPI') { try { const res = await API.get(`/payment/qr/${orderId}/`); setQrData(res.data); setShowQR(true); } catch { toast.error('QR failed'); } return; }
    try { await API.post(`/orders/${orderId}/pay/`, { method: selectedMethod, amount: order.total }); setConfirmed(true); toast.success('Payment confirmed!'); } catch { toast.error('Payment failed'); }
  };
  const confirmUPI = async () => { try { await API.post('/payment/confirm/', { order_id: orderId }); setShowQR(false); setConfirmed(true); toast.success('UPI confirmed!'); } catch { toast.error('Failed'); } };

  if (confirmed) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #f7fee7 50%, #e0f2fe 100%)' }} onClick={() => navigate('/pos/floor')}>
      <div className="text-center"><div className="text-8xl mb-6">✅</div><h1 className="text-3xl font-bold text-slate-800 mb-2">Payment Confirmed!</h1><p className="text-2xl text-lime-600 font-bold">{formatCurrency(order?.total)}</p><p className="text-slate-400 mt-4">Click anywhere to continue</p></div>
    </div>
  );

  if (showQR && qrData) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #f7fee7 50%, #e0f2fe 100%)' }}>
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-xl">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Scan QR to Pay</h2>
        <div className="bg-slate-50 p-4 rounded-2xl inline-block mb-4 border border-slate-200"><QRCodeSVG value={`upi://pay?pa=${qrData.upi_id}&am=${qrData.amount}`} size={192} /></div>
        <p className="text-xl font-bold text-slate-700 mb-1">{formatCurrency(order?.total)}</p>
        <p className="text-sm text-slate-400 mb-6">UPI ID: {qrData.upi_id}</p>
        <div className="flex gap-3"><button onClick={confirmUPI} className="flex-1 py-3 bg-lime-500 text-white font-bold rounded-xl hover:bg-lime-400">Confirmed</button>
          <button onClick={() => setShowQR(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200">Cancel</button></div>
      </div>
    </div>
  );

  if (!order) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin"></div></div>;
  const icons = { Cash: '💵', Digital: '💳', UPI: '📱' };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #f7fee7 50%, #e0f2fe 100%)' }}>
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 shadow-xl">
        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-700 mb-4">← Back</button>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Payment — Order #{order.order_number}</h2>
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-6">
          {order.items?.map(item => <div key={item.id} className="flex justify-between py-1"><span className="text-slate-600">{item.product_name} x{item.quantity}</span><span className="text-slate-700">{formatCurrency(item.subtotal)}</span></div>)}
          <div className="border-t border-slate-200 mt-2 pt-2 flex justify-between text-lg font-bold"><span className="text-slate-700">Total</span><span className="text-lime-600">{formatCurrency(order.total)}</span></div>
        </div>
        <h3 className="text-sm text-slate-500 mb-3">Select Payment Method</h3>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {methods.map(m => (
            <button key={m.id} onClick={() => setSelectedMethod(m.id)} className={`p-4 rounded-xl border text-center transition-all ${selectedMethod === m.id ? 'border-sky-400 bg-sky-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
              <div className="text-2xl mb-1">{icons[m.name] || '💰'}</div><div className="text-sm text-slate-700">{m.name}</div>
            </button>
          ))}
        </div>
        <button onClick={validate} className="w-full py-3 bg-gradient-to-r from-sky-500 to-sky-600 text-white font-bold rounded-xl hover:from-sky-400 hover:to-sky-500 transition-all shadow-lg shadow-sky-200">Validate Payment</button>
      </div>
    </div>
  );
}
