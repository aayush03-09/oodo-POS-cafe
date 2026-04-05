import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { formatCurrency } from '../../utils/formatCurrency';

export default function Reports() {
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({ date_from: '', date_to: '' });
  const load = () => { const params = Object.fromEntries(Object.entries(filters).filter(([_,v]) => v)); API.get('/reports/sales/', { params }).then(r => setData(r.data)); };
  useEffect(load, []);
  const exportPDF = () => window.open('http://localhost:8000/api/reports/export/pdf/', '_blank');
  const exportXLS = () => window.open('http://localhost:8000/api/reports/export/xls/', '_blank');

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Reports</h1>
        <div className="flex gap-2">
          <button onClick={exportPDF} className="px-4 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 text-sm font-medium">Export PDF</button>
          <button onClick={exportXLS} className="px-4 py-2 bg-lime-100 text-lime-600 rounded-xl hover:bg-lime-200 text-sm font-medium">Export XLS</button>
        </div>
      </div>
      <div className="bg-white/70 backdrop-blur border border-slate-200 rounded-2xl p-4 mb-6 flex flex-wrap gap-3 shadow-sm">
        <input type="date" value={filters.date_from} onChange={e => setFilters({...filters, date_from: e.target.value})} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm" />
        <input type="date" value={filters.date_to} onChange={e => setFilters({...filters, date_to: e.target.value})} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm" />
        <button onClick={load} className="px-4 py-2 bg-sky-500 text-white rounded-xl text-sm hover:bg-sky-400">Apply</button>
      </div>
      {data && (<>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-lime-400 to-lime-500 rounded-2xl p-5 shadow"><div className="text-sm text-white/80">Total Revenue</div><div className="text-2xl font-bold text-white">{formatCurrency(data.total_revenue)}</div></div>
          <div className="bg-gradient-to-br from-sky-400 to-sky-500 rounded-2xl p-5 shadow"><div className="text-sm text-white/80">Total Orders</div><div className="text-2xl font-bold text-white">{data.total_orders}</div></div>
          <div className="bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-2xl p-5 shadow"><div className="text-sm text-white/80">Avg Order Value</div><div className="text-2xl font-bold text-white">{formatCurrency(data.avg_order_value)}</div></div>
        </div>
        {data.top_products?.length > 0 && (
          <div className="bg-white/70 backdrop-blur border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-700 mb-3">Top Products</h3>
            <div className="space-y-2">{data.top_products.map((p,i) => (
              <div key={i} className="flex justify-between items-center bg-slate-50 rounded-xl p-3 border border-slate-100">
                <span className="text-slate-700">{p.name}</span>
                <div className="flex gap-4 text-sm"><span className="text-slate-400">Qty: {p.total_qty}</span><span className="text-lime-600 font-medium">{formatCurrency(p.total_sales)}</span></div>
              </div>))}</div>
          </div>
        )}
        <div className="bg-white/70 backdrop-blur border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full"><thead><tr className="bg-slate-50">{['Order #','Table','Staff','Amount','Date'].map(h => <th key={h} className="px-4 py-3 text-left text-sm text-slate-500">{h}</th>)}</tr></thead>
            <tbody>{data.orders?.map(o => (
              <tr key={o.id} className="border-t border-slate-100 hover:bg-sky-50/30">
                <td className="px-4 py-3 text-slate-700">#{o.order_number}</td><td className="px-4 py-3 text-slate-500">{o.table_number || '-'}</td>
                <td className="px-4 py-3 text-slate-500">{o.created_by_name}</td><td className="px-4 py-3 text-lime-600">{formatCurrency(o.total)}</td>
                <td className="px-4 py-3 text-slate-500">{new Date(o.created_at).toLocaleString()}</td>
              </tr>))}</tbody>
          </table>
        </div>
      </>)}
    </div>
  );
}
