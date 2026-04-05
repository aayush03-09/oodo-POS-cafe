import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { formatCurrency } from '../../utils/formatCurrency';

export default function Receipt() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const receiptRef = useRef(null);

  useEffect(() => { API.get(`/orders/${orderId}/receipt/`).then(r => setData(r.data)); }, [orderId]);

  const printReceipt = () => {
    const content = receiptRef.current;
    const win = window.open('', '', 'width=400,height=600');
    win.document.write(`<html><head><title>Receipt #${data.order_number}</title><style>body{font-family:monospace;padding:20px;font-size:13px}table{width:100%;border-collapse:collapse}td,th{padding:4px 0;text-align:left}th:last-child,td:last-child{text-align:right}.total{font-size:16px;font-weight:bold;border-top:2px solid #000;padding-top:8px}.center{text-align:center}.line{border-top:1px dashed #000;margin:8px 0}</style></head><body>${content.innerHTML}</body></html>`);
    win.document.close();
    win.print();
    win.close();
  };

  if (!data) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin"></div></div>;

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #f7fee7 50%, #e0f2fe 100%)' }}>
      <div className="w-full max-w-sm">
        <div ref={receiptRef} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl">
          {/* Receipt Content */}
          <div className="text-center mb-4">
            <h1 className="text-xl font-bold text-slate-800">☕ POS Cafe</h1>
            <p className="text-xs text-slate-400">Restaurant Receipt</p>
            <div className="border-t border-dashed border-slate-300 my-3"></div>
          </div>
          <div className="flex justify-between text-sm text-slate-500 mb-1">
            <span>Order #</span><span className="text-slate-700 font-semibold">{data.order_number}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-500 mb-1">
            <span>Table</span><span className="text-slate-700">{data.table_number}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-500 mb-1">
            <span>Staff</span><span className="text-slate-700">{data.staff}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-500 mb-3">
            <span>Date</span><span className="text-slate-700">{data.date}</span>
          </div>
          <div className="border-t border-dashed border-slate-300 my-3"></div>
          <table className="w-full mb-3">
            <thead>
              <tr className="text-xs text-slate-400 border-b border-slate-200">
                <th className="text-left py-1 font-medium">Item</th>
                <th className="text-center py-1 font-medium">Qty</th>
                <th className="text-right py-1 font-medium">Price</th>
                <th className="text-right py-1 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, i) => (
                <tr key={i} className="text-sm">
                  <td className="text-slate-700 py-1">{item.name}</td>
                  <td className="text-center text-slate-500">{item.qty}</td>
                  <td className="text-right text-slate-500">{formatCurrency(item.unit_price)}</td>
                  <td className="text-right text-slate-700 font-medium">{formatCurrency(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t-2 border-slate-800 pt-3 flex justify-between text-lg font-bold">
            <span className="text-slate-700">Total</span>
            <span className="text-slate-800">{formatCurrency(data.total)}</span>
          </div>
          <div className="border-t border-dashed border-slate-300 my-3"></div>
          <div className="flex justify-between text-sm text-slate-500">
            <span>Payment</span><span className="text-slate-700">{data.payment_method}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-500 mb-3">
            <span>Status</span><span className="text-emerald-600 font-semibold">{data.payment_status === 'done' ? '✓ PAID' : 'Pending'}</span>
          </div>
          <div className="border-t border-dashed border-slate-300 my-3"></div>
          <p className="text-center text-xs text-slate-400">Thank you for dining with us!</p>
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={printReceipt} className="flex-1 py-3 bg-sky-500 text-white rounded-xl font-bold shadow hover:bg-sky-400">🖨 Print Receipt</button>
          <button onClick={() => navigate('/staff/orders')} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200">Back to Orders</button>
        </div>
      </div>
    </div>
  );
}
