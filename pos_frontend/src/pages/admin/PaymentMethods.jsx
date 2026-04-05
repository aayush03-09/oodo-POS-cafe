import { useState, useEffect } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function PaymentMethods() {
  const [methods, setMethods] = useState([]);
  const load = () => API.get('/payment-methods/').then(r => setMethods(r.data));
  useEffect(load, []);
  const toggle = async (m) => { await API.put(`/payment-methods/${m.id}/`, { ...m, is_enabled: !m.is_enabled }); toast.success(`${m.name} ${!m.is_enabled ? 'enabled' : 'disabled'}`); load(); };
  const updateUPI = async (m, upi_id) => { await API.put(`/payment-methods/${m.id}/`, { ...m, upi_id }); toast.success('UPI ID updated'); load(); };
  const icons = { Cash: '💵', Digital: '💳', UPI: '📱' };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Payment Methods</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {methods.map(m => (
          <div key={m.id} className={`bg-white/70 backdrop-blur border rounded-2xl p-6 transition-all shadow-sm ${m.is_enabled ? 'border-sky-300' : 'border-slate-200 opacity-60'}`}>
            <div className="text-3xl mb-3">{icons[m.name] || '💰'}</div>
            <div className="text-xl font-semibold text-slate-700 mb-1">{m.name}</div>
            <div className="flex items-center gap-3 mt-4">
              <button onClick={() => toggle(m)} className={`relative w-12 h-6 rounded-full transition-all ${m.is_enabled ? 'bg-sky-500' : 'bg-slate-300'}`}>
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${m.is_enabled ? 'left-6' : 'left-0.5'}`}></span>
              </button>
              <span className="text-sm text-slate-500">{m.is_enabled ? 'Enabled' : 'Disabled'}</span>
            </div>
            {m.name === 'UPI' && m.is_enabled && (
              <div className="mt-4"><label className="text-sm text-slate-500">UPI ID</label>
                <div className="flex gap-2 mt-1">
                  <input defaultValue={m.upi_id} id={`upi-${m.id}`} className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:border-sky-400" />
                  <button onClick={() => updateUPI(m, document.getElementById(`upi-${m.id}`).value)} className="px-3 py-2 bg-sky-500 text-white rounded-xl text-sm hover:bg-sky-400">Save</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
