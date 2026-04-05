import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  sent:      { label: 'Pending',   bg: 'bg-red-400',   card: 'border-red-300',   btn: 'bg-amber-500 hover:bg-amber-400', next: 'preparing', btnText: '🍳 Start Cooking' },
  preparing: { label: 'Cooking',   bg: 'bg-amber-400', card: 'border-amber-300', btn: 'bg-lime-500 hover:bg-lime-400',   next: 'served',    btnText: '✓ Mark Prepared' },
  served:    { label: 'Prepared',  bg: 'bg-lime-500',  card: 'border-lime-300',  btn: null,                              next: null,        btnText: null },
};

export default function KitchenDisplay() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark-theme'));
  const ws = useRef(null);
  const navigate = useNavigate();

  const load = () => API.get('/kitchen/orders/').then(r => setOrders(r.data));

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    try {
      ws.current = new WebSocket('ws://localhost:8000/ws/kitchen/');
      ws.current.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        if (msg.type === 'new_order') { setOrders(prev => [...prev, msg.order]); toast.success(`New order #${msg.order.order_number}!`); }
        else if (msg.type === 'order_update') { setOrders(prev => prev.map(o => o.id === msg.order.id ? msg.order : o)); }
      };
    } catch {}
    return () => { ws.current?.close(); clearInterval(interval); };
  }, []);

  const updateStatus = async (order, newStatus) => {
    try {
      const res = await API.patch(`/kitchen/orders/${order.id}/status/`, { status: newStatus });
      setOrders(prev => prev.map(o => o.id === order.id ? res.data : o));
      const labels = { preparing: 'Cooking started', served: 'Marked as Prepared' };
      toast.success(`Order #${order.order_number}: ${labels[newStatus]}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    }
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);
  const counts = { all: orders.length, sent: orders.filter(o => o.status === 'sent').length, preparing: orders.filter(o => o.status === 'preparing').length };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #f7fee7 50%, #e0f2fe 100%)' }}>
      {/* Header */}
      <div className="bg-white/80 backdrop-blur border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-red-400 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow">🍳</div>
          <span className="text-lg font-bold text-slate-700">Kitchen Display</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            {[{ k: 'all', l: 'All' }, { k: 'sent', l: 'Pending' }, { k: 'preparing', l: 'Cooking' }, { k: 'served', l: 'Prepared' }].map(t => (
              <button key={t.k} onClick={() => setFilter(t.k)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === t.k ? 'bg-amber-500 text-white shadow' : 'text-slate-500 hover:bg-slate-100'}`}>{t.l}</button>
            ))}
            <button onClick={() => { document.documentElement.classList.toggle('dark-theme'); setIsDark(!isDark); }} className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all text-sm ml-2">
              {isDark ? '☀️' : '🌙'}
            </button>
            <button onClick={() => { localStorage.removeItem('poscafe_user'); localStorage.removeItem('poscafe_tokens'); navigate('/login'); }}
              className="px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 text-sm font-medium ml-2">Logout</button>
          </div>
        </div>
      </div>

      {/* Order Cards */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(order => {
          const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.sent;
          return (
            <div key={order.id} className={`bg-white/80 backdrop-blur border-2 ${config.card} rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all`}>
              {/* Header bar */}
              <div className={`${config.bg} px-4 py-3 flex justify-between items-center`}>
                <div>
                  <span className="font-bold text-white text-xl">#{order.order_number}</span>
                  <span className="text-white/80 text-sm ml-2">Table {order.table_number}</span>
                </div>
                <span className="bg-white/20 text-white text-xs font-bold px-2 py-1 rounded-full">{config.label}</span>
              </div>

              {/* Items */}
              <div className="p-4">
                <div className="text-xs text-slate-400 mb-2">Staff: {order.created_by_name} · {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                <div className="space-y-2 mb-4">
                  {order.items?.map(item => (
                    <div key={item.id} className="flex justify-between items-start bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
                      <div className="flex-1 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-700 font-bold">{item.product_name}</span>
                          {item.customization_type === 'jain' && <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded border border-green-200 leading-none">JAIN</span>}
                        </div>
                        {item.note && <div className="text-amber-600 text-xs mt-1 italic leading-tight flex items-start gap-1"><span>💬</span><span>{item.note}</span></div>}
                      </div>
                      <span className="bg-slate-200 text-slate-700 text-sm font-bold px-2 py-0.5 rounded shrink-0 flex-none h-fit">×{item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Action button */}
                {config.btn && (
                  <button onClick={() => updateStatus(order, config.next)}
                    className={`w-full py-3 ${config.btn} text-white font-bold rounded-xl transition-all shadow text-sm`}>
                    {config.btnText}
                  </button>
                )}
                {order.status === 'served' && (
                  <div className="text-center py-2 text-lime-600 font-bold text-sm">✓ Ready for service</div>
                )}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-20">
            <div className="text-6xl mb-4">🍳</div>
            <div className="text-xl text-slate-400 font-medium">
              {filter === 'all' ? 'No orders yet' : `No ${filter} orders`}
            </div>
            <div className="text-sm text-slate-300 mt-1">Orders from staff will appear here in real-time</div>
          </div>
        )}
      </div>
    </div>
  );
}
