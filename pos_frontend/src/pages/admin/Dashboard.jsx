import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { formatCurrency } from '../../utils/formatCurrency';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const load = () => API.get('/reports/dashboard/').then(r => setData(r.data));
  useEffect(() => { load(); const interval = setInterval(load, 15000); return () => clearInterval(interval); }, []);

  const resetKitchenPin = async () => {
    if (!window.confirm('Are you sure you want to change the Kitchen Login PIN? The old PIN will immediately stop working.')) return;
    try {
      const res = await API.post('/auth/reset-kitchen-pin/');
      alert(`🔐 NEW KITCHEN PIN GENERATED\n\nThe new Kitchen Login PIN is: ${res.data.pin}\n\nAnyone currently logged into the Kitchen Portal will not be logged out, but new logins will require this PIN.`);
    } catch (err) {
      toast.error('Failed to reset Kitchen PIN');
    }
  };

  if (!data) return <div className="flex items-center justify-center h-[60vh]"><div className="w-10 h-10 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin"></div></div>;

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);
  const bookingMap = {};
  (data.booking_by_date || []).forEach(b => { const d = new Date(b.booking_date); if (d.getMonth() === month) bookingMap[d.getDate()] = b.count; });

  const statusBadge = (s) => {
    const c = { sent: 'bg-sky-100 text-sky-600', preparing: 'bg-amber-100 text-amber-600', served: 'bg-lime-100 text-lime-600', paid: 'bg-emerald-100 text-emerald-600' };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c[s] || 'bg-slate-100 text-slate-500'}`}>{s}</span>;
  };
  const payBadge = (s) => s === 'done'
    ? <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-600">✓ Done</span>
    : <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-500">Pending</span>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-800">Manager Dashboard</h1>
          <button onClick={resetKitchenPin} className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-lg border border-amber-200 hover:bg-amber-200 transition-all shadow-sm">
            🔑 Generate Kitchen PIN
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Today's Profit", value: formatCurrency(data.total_profit), bg: 'from-lime-400 to-lime-500', icon: '💰' },
          { label: 'Total Orders', value: data.total_orders, bg: 'from-sky-400 to-sky-500', icon: '📋' },
          { label: 'Paid Orders', value: data.paid_orders, bg: 'from-emerald-400 to-emerald-500', icon: '✅' },
          { label: 'Pending Payment', value: data.pending_orders, bg: 'from-red-400 to-red-500', icon: '⏳' },
          { label: "Today's Bookings", value: data.total_bookings_today, bg: 'from-sky-500 to-blue-500', icon: '📅' },
        ].map(card => (
          <div key={card.label} className={`bg-gradient-to-br ${card.bg} rounded-2xl p-5 shadow-lg`}>
            <div className="text-2xl mb-1">{card.icon}</div>
            <div className="text-2xl font-bold text-white">{card.value}</div>
            <div className="text-sm text-white/80">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Order dashboard — order copies from staff */}
      <div className="bg-white/70 backdrop-blur border border-slate-200 rounded-2xl shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-700">📋 Today's Orders (Live)</h3>
          <span className="text-xs text-slate-400">Auto-refreshes every 15s</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-slate-50">
              {['Order #', 'Table', 'Staff', 'Items', 'Total', 'Order Status', 'Payment', 'Time'].map(h =>
                <th key={h} className="px-4 py-3 text-left text-sm text-slate-500 font-medium">{h}</th>
              )}
            </tr></thead>
            <tbody>
              {data.recent_orders?.map(o => (
                <tr key={o.id} className="border-t border-slate-100 hover:bg-sky-50/30 transition-all">
                  <td className="px-4 py-3 text-slate-700 font-semibold">#{o.order_number}</td>
                  <td className="px-4 py-3 text-slate-600">T{o.table_number}</td>
                  <td className="px-4 py-3 text-slate-500">{o.created_by_name}</td>
                  <td className="px-4 py-3 text-slate-500 text-sm">{o.items?.map(i => `${i.product_name}×${i.quantity}`).join(', ')}</td>
                  <td className="px-4 py-3 text-lime-600 font-semibold">{formatCurrency(o.total)}</td>
                  <td className="px-4 py-3">{statusBadge(o.status)}</td>
                  <td className="px-4 py-3">{payBadge(o.payment_status)}</td>
                  <td className="px-4 py-3 text-slate-400 text-sm">{new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                </tr>
              ))}
              {(!data.recent_orders || data.recent_orders.length === 0) && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">No orders today yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/70 backdrop-blur border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-slate-700">Daily Profit (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.daily_profit}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" stroke="#94a3b8" /><YAxis stroke="#94a3b8" />
              <Tooltip formatter={v => formatCurrency(v)} contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px' }} />
              <Bar dataKey="total" fill="#84cc16" radius={[6, 6, 0, 0]} name="Profit" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white/70 backdrop-blur border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-slate-700">Booking Calendar — {today.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d} className="text-slate-400 font-medium py-1">{d}</div>)}
            {calendarDays.map((day, i) => {
              if (day === null) return <div key={`e-${i}`} />;
              const count = bookingMap[day] || 0;
              const isToday = day === today.getDate();
              return (
                <div key={day} className={`py-2 rounded-lg text-sm relative cursor-default transition-all ${
                  isToday ? 'bg-sky-500 text-white font-bold shadow' : count > 0 ? 'bg-lime-100 text-lime-700 font-medium' : 'text-slate-500 hover:bg-slate-50'
                }`}>
                  {day}
                  {count > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-lime-500 text-white text-[10px] rounded-full flex items-center justify-center shadow">{count}</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-slate-700">Bookings Over Last 30 Days</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data.booking_graph}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="day" stroke="#94a3b8" tick={{ fontSize: 10 }} interval={4} /><YAxis stroke="#94a3b8" allowDecimals={false} />
            <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px' }} />
            <Area type="monotone" dataKey="bookings" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.15} name="Bookings" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Category Sales */}
      <div className="bg-white/70 backdrop-blur border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-slate-700">Sales by Category</h3>
        {data.category_sales?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {data.category_sales.map((c, i) => (
              <div key={i} className="flex justify-between items-center bg-slate-50 rounded-xl p-3 border border-slate-100">
                <span className="text-slate-700">{c.category}</span>
                <span className="text-lime-600 font-semibold">{formatCurrency(c.total)}</span>
              </div>
            ))}
          </div>
        ) : <p className="text-slate-400 text-center py-4">No sales data yet</p>}
      </div>
    </div>
  );
}
