import { useState, useEffect } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';

const STATUS_COLORS = { confirmed: 'bg-sky-500', seated: 'bg-amber-500', completed: 'bg-lime-500', cancelled: 'bg-red-400' };
const STATUS_BG = { confirmed: 'bg-sky-100 text-sky-600', seated: 'bg-amber-100 text-amber-600', completed: 'bg-lime-100 text-lime-600', cancelled: 'bg-red-100 text-red-500' };

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [tables, setTables] = useState([]);
  const [ganttData, setGanttData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [tab, setTab] = useState('manage');
  const [ganttDate, setGanttDate] = useState(new Date().toISOString().split('T')[0]);
  const [form, setForm] = useState({ customer_name: '', customer_phone: '', party_size: 2, table: '', booking_date: new Date().toISOString().split('T')[0], time_slot_start: '12:00', time_slot_end: '13:00', notes: '' });

  const load = () => {
    API.get('/bookings/').then(r => setBookings(r.data));
    API.get('/floors/').then(r => { const t = []; r.data.forEach(f => f.tables?.forEach(tb => t.push({ ...tb, floor_name: f.name }))); setTables(t); });
  };
  const loadGantt = () => API.get('/bookings/gantt/', { params: { date: ganttDate } }).then(r => setGanttData(r.data));
  useEffect(() => { load(); }, []);
  useEffect(() => { if (tab === 'gantt') loadGantt(); }, [tab, ganttDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await API.put(`/bookings/${editing.id}/`, form); toast.success('Updated'); }
      else { await API.post('/bookings/', form); toast.success('Created'); }
      setShowModal(false); setEditing(null); load(); if (tab === 'gantt') loadGantt();
    } catch (err) { toast.error(err.response?.data?.table?.[0] || 'Error'); }
  };
  const updateStatus = async (id, s) => { await API.patch(`/bookings/${id}/status/`, { status: s }); toast.success(`Status: ${s}`); load(); if (tab === 'gantt') loadGantt(); };
  const deleteBooking = async (id) => { if (!confirm('Delete?')) return; await API.delete(`/bookings/${id}/`); toast.success('Deleted'); load(); };
  const openCreate = () => { setEditing(null); setForm({ customer_name: '', customer_phone: '', party_size: 2, table: '', booking_date: new Date().toISOString().split('T')[0], time_slot_start: '12:00', time_slot_end: '13:00', notes: '' }); setShowModal(true); };
  const openEdit = (b) => { setEditing(b); setForm({ customer_name: b.customer_name, customer_phone: b.customer_phone, party_size: b.party_size, table: b.table || '', booking_date: b.booking_date, time_slot_start: b.time_slot_start, time_slot_end: b.time_slot_end, notes: b.notes }); setShowModal(true); };

  const hours = Array.from({ length: 15 }, (_, i) => i + 8);
  const timeToPercent = (t) => { const [h, m] = t.split(':').map(Number); return ((h - 8 + m / 60) / 15) * 100; };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Booking Management</h1>
        <button onClick={openCreate} className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl transition-all font-medium shadow-sm">+ New Booking</button>
      </div>
      <div className="flex gap-2 mb-6">
        {[{ k: 'manage', l: 'Manage Bookings' }, { k: 'history', l: 'History (30 days)' }, { k: 'gantt', l: 'Gantt Chart' }].map(t => (
          <button key={t.k} onClick={() => setTab(t.k)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === t.k ? 'bg-sky-500 text-white shadow' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}>{t.l}</button>
        ))}
      </div>

      {tab === 'manage' && (
        <div className="bg-white/70 backdrop-blur border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full"><thead><tr className="bg-slate-50">{['Customer','Phone','Party','Table','Date','Time Slot','Status','Actions'].map(h => <th key={h} className="px-3 py-3 text-left text-sm text-slate-500 font-medium">{h}</th>)}</tr></thead>
            <tbody>{bookings.map(b => (
              <tr key={b.id} className="border-t border-slate-100 hover:bg-sky-50/30 transition-all">
                <td className="px-3 py-3 text-slate-700 font-medium">{b.customer_name}</td>
                <td className="px-3 py-3 text-slate-500">{b.customer_phone || '-'}</td>
                <td className="px-3 py-3 text-slate-500">{b.party_size}</td>
                <td className="px-3 py-3 text-slate-500">{b.table_number ? `T${b.table_number}` : '-'}</td>
                <td className="px-3 py-3 text-slate-500">{b.booking_date}</td>
                <td className="px-3 py-3 text-slate-500">{b.time_slot_start?.slice(0,5)} - {b.time_slot_end?.slice(0,5)}</td>
                <td className="px-3 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BG[b.status]}`}>{b.status}</span></td>
                <td className="px-3 py-3"><div className="flex gap-1 flex-wrap">
                  {b.status === 'confirmed' && <button onClick={() => updateStatus(b.id, 'seated')} className="px-2 py-1 bg-amber-100 text-amber-600 rounded text-xs hover:bg-amber-200">Seat</button>}
                  {b.status === 'seated' && <button onClick={() => updateStatus(b.id, 'completed')} className="px-2 py-1 bg-lime-100 text-lime-600 rounded text-xs hover:bg-lime-200">Complete</button>}
                  {b.status !== 'cancelled' && b.status !== 'completed' && <button onClick={() => updateStatus(b.id, 'cancelled')} className="px-2 py-1 bg-red-100 text-red-500 rounded text-xs hover:bg-red-200">Cancel</button>}
                  <button onClick={() => openEdit(b)} className="px-2 py-1 bg-sky-100 text-sky-600 rounded text-xs hover:bg-sky-200">Edit</button>
                  <button onClick={() => deleteBooking(b.id)} className="px-2 py-1 bg-red-100 text-red-500 rounded text-xs hover:bg-red-200">Del</button>
                </div></td>
              </tr>
            ))}{bookings.length === 0 && <tr><td colSpan={8} className="px-3 py-8 text-center text-slate-400">No bookings yet</td></tr>}</tbody>
          </table>
        </div>
      )}

      {tab === 'history' && (
        <div className="bg-white/70 backdrop-blur border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full"><thead><tr className="bg-slate-50">{['Customer','Party','Table','Date','Time','Status'].map(h => <th key={h} className="px-4 py-3 text-left text-sm text-slate-500">{h}</th>)}</tr></thead>
            <tbody>{bookings.filter(b => { const d = new Date(b.booking_date); const c = new Date(); c.setDate(c.getDate()-30); return d >= c; }).map(b => (
              <tr key={b.id} className="border-t border-slate-100 hover:bg-sky-50/30">
                <td className="px-4 py-3 text-slate-700">{b.customer_name}</td><td className="px-4 py-3 text-slate-500">{b.party_size}</td>
                <td className="px-4 py-3 text-slate-500">{b.table_number ? `T${b.table_number}` : '-'}</td><td className="px-4 py-3 text-slate-500">{b.booking_date}</td>
                <td className="px-4 py-3 text-slate-500">{b.time_slot_start?.slice(0,5)} - {b.time_slot_end?.slice(0,5)}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BG[b.status]}`}>{b.status}</span></td>
              </tr>))}</tbody>
          </table>
        </div>
      )}

      {tab === 'gantt' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <label className="text-slate-500 text-sm">Date:</label>
            <input type="date" value={ganttDate} onChange={e => setGanttDate(e.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:border-sky-400" />
          </div>
          <div className="bg-white/70 backdrop-blur border border-slate-200 rounded-2xl p-4 overflow-x-auto shadow-sm">
            <div className="flex mb-1" style={{ marginLeft: '120px' }}>
              {hours.map(h => <div key={h} className="text-[10px] text-slate-400 font-medium" style={{ width: `${100/15}%`, minWidth: '50px' }}>{h}:00</div>)}
            </div>
            {ganttData?.tables?.map(table => {
              const tb = ganttData.bookings?.filter(b => String(b.table_number) === String(table.table_number)) || [];
              return (
                <div key={table.id} className="flex items-center mb-1 relative" style={{ minHeight: '36px' }}>
                  <div className="w-[120px] shrink-0 text-sm text-slate-600 font-medium pr-2">T{table.table_number} <span className="text-slate-400 text-xs">({table.seats}s)</span></div>
                  <div className="flex-1 bg-slate-100 rounded-lg relative" style={{ minHeight: '32px', minWidth: `${15*50}px` }}>
                    {tb.map(b => { const l = timeToPercent(b.time_slot_start); const w = timeToPercent(b.time_slot_end) - l; return (
                      <div key={b.id} title={`${b.customer_name} (${b.party_size}p)`} className={`absolute top-0.5 h-7 rounded-md flex items-center px-2 text-[11px] text-white font-medium truncate ${STATUS_COLORS[b.status]}`} style={{ left: `${l}%`, width: `${Math.max(w, 3)}%` }}>{b.customer_name}</div>
                    ); })}
                  </div>
                </div>
              );
            })}
            <div className="flex gap-4 mt-4 pt-3 border-t border-slate-200">
              {Object.entries(STATUS_COLORS).map(([s, c]) => <div key={s} className="flex items-center gap-1"><div className={`w-3 h-3 rounded ${c}`}></div><span className="text-xs text-slate-500 capitalize">{s}</span></div>)}
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-xl">
            <h2 className="text-xl font-bold text-slate-700">{editing ? 'Edit Booking' : 'New Booking'}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm text-slate-500 mb-1">Customer Name *</label><input value={form.customer_name} onChange={e => setForm({...form, customer_name: e.target.value})} required className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-sky-400" /></div>
              <div><label className="block text-sm text-slate-500 mb-1">Phone</label><input value={form.customer_phone} onChange={e => setForm({...form, customer_phone: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-sky-400" /></div>
              <div><label className="block text-sm text-slate-500 mb-1">Party Size</label><input type="number" min="1" value={form.party_size} onChange={e => setForm({...form, party_size: parseInt(e.target.value)})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-sky-400" /></div>
              <div><label className="block text-sm text-slate-500 mb-1">Assign Table</label><select value={form.table} onChange={e => setForm({...form, table: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-sky-400"><option value="">Select</option>{tables.map(t => <option key={t.id} value={t.id}>T{t.table_number} ({t.seats}s) - {t.floor_name}</option>)}</select></div>
              <div><label className="block text-sm text-slate-500 mb-1">Date *</label><input type="date" value={form.booking_date} onChange={e => setForm({...form, booking_date: e.target.value})} required className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-sky-400" /></div>
              <div className="flex gap-2">
                <div className="flex-1"><label className="block text-sm text-slate-500 mb-1">From *</label><input type="time" value={form.time_slot_start} onChange={e => setForm({...form, time_slot_start: e.target.value})} required className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-sky-400" /></div>
                <div className="flex-1"><label className="block text-sm text-slate-500 mb-1">To *</label><input type="time" value={form.time_slot_end} onChange={e => setForm({...form, time_slot_end: e.target.value})} required className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-sky-400" /></div>
              </div>
            </div>
            <div><label className="block text-sm text-slate-500 mb-1">Notes</label><textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 h-16 focus:outline-none focus:border-sky-400" /></div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl transition-all font-medium">Save</button>
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl transition-all">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
