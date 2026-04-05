import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { usePOS } from '../../context/POSContext';

export default function FloorView() {
  const [floors, setFloors] = useState([]);
  const { setSelectedTable, session, setSession } = usePOS();
  const navigate = useNavigate();
  useEffect(() => { API.get('/floors/').then(r => setFloors(r.data)); if (!session) API.get('/sessions/current/').then(r => setSession(r.data)).catch(() => navigate('/pos/session')); }, []);
  const selectTable = (table) => { setSelectedTable(table); navigate(`/pos/order/${table.id}`); };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #f7fee7 50%, #e0f2fe 100%)' }}>
      <div className="bg-white/80 backdrop-blur border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-slate-800">☕ Floor View</h1>
          <span className="px-3 py-1 bg-sky-100 text-sky-600 rounded-full text-sm font-medium">Session #{session?.id}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/pos/customer-display')} className="px-3 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm hover:bg-slate-200">Customer Display</button>
          <button onClick={() => navigate('/pos/session')} className="px-3 py-2 bg-red-100 text-red-500 rounded-xl text-sm hover:bg-red-200">Close Register</button>
        </div>
      </div>
      <div className="p-6 space-y-8">
        {floors.map(floor => (
          <div key={floor.id}>
            <h2 className="text-lg font-semibold text-slate-700 mb-3">{floor.name}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {floor.tables?.map(table => (
                <button key={table.id} onClick={() => selectTable(table)}
                  className="bg-white/70 backdrop-blur border border-slate-200 rounded-2xl p-6 text-center hover:border-sky-400 hover:bg-sky-50 transition-all shadow-sm group">
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🪑</div>
                  <div className="text-xl font-bold text-slate-700">T{table.table_number}</div>
                  <div className="text-xs text-slate-400">{table.seats} seats</div>
                  <div className="mt-2 w-3 h-3 rounded-full bg-lime-400 mx-auto"></div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
