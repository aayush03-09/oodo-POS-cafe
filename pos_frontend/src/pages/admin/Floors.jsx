import { useState, useEffect } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function Floors() {
  const [floors, setFloors] = useState([]);
  const [floorName, setFloorName] = useState('');
  const [showTableModal, setShowTableModal] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [tableForm, setTableForm] = useState({ table_number: '', seats: 4 });
  const load = () => API.get('/floors/').then(r => setFloors(r.data));
  useEffect(() => { load(); }, []);
  const addFloor = async (e) => { e.preventDefault(); await API.post('/floors/', { name: floorName }); setFloorName(''); toast.success('Floor added'); load(); };
  const addTable = async (e) => { e.preventDefault(); await API.post('/tables/', { ...tableForm, floor: selectedFloor.id }); setShowTableModal(false); toast.success('Table added'); load(); };
  const deleteTable = async (id) => { await API.delete(`/tables/${id}/`); toast.success('Deleted'); load(); };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Floors & Tables</h1>
      <form onSubmit={addFloor} className="flex gap-3 mb-6">
        <input value={floorName} onChange={e => setFloorName(e.target.value)} required placeholder="Floor name" className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-sky-400" />
        <button className="px-4 py-2 bg-sky-500 text-white rounded-xl hover:bg-sky-400 transition-all shadow-sm">Add Floor</button>
      </form>
      <div className="space-y-6">
        {floors.map(floor => (
          <div key={floor.id} className="bg-white/70 backdrop-blur border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-700">{floor.name}</h3>
              <button onClick={() => { setSelectedFloor(floor); setTableForm({ table_number: '', seats: 4 }); setShowTableModal(true); }}
                className="px-3 py-1 bg-sky-100 text-sky-600 rounded-lg text-sm hover:bg-sky-200">+ Add Table</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {floor.tables?.map(table => (
                <div key={table.id} className={`border rounded-xl p-3 text-center transition-all group ${
                  table.is_occupied ? 'bg-red-50 border-red-200 hover:bg-red-100' : 'bg-green-50 border-green-200 hover:bg-green-100'
                }`}>
                  <div className={`text-xl font-bold ${table.is_occupied ? 'text-red-700' : 'text-green-700'}`}>T{table.table_number}</div>
                  <div className={`text-xs ${table.is_occupied ? 'text-red-400' : 'text-green-600'}`}>{table.seats} seats</div>
                  <button onClick={() => deleteTable(table.id)} className="text-red-400 text-xs mt-1 opacity-0 group-hover:opacity-100 transition-all">Remove</button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {showTableModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <form onSubmit={addTable} className="bg-white border border-slate-200 rounded-2xl p-6 w-80 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-700">Add Table to {selectedFloor.name}</h3>
            <input value={tableForm.table_number} onChange={e => setTableForm({...tableForm, table_number: e.target.value})} required placeholder="Table number" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-sky-400" />
            <input type="number" value={tableForm.seats} onChange={e => setTableForm({...tableForm, seats: e.target.value})} placeholder="Seats" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-sky-400" />
            <div className="flex gap-2">
              <button type="submit" className="flex-1 py-2 bg-sky-500 text-white rounded-xl">Add</button>
              <button type="button" onClick={() => setShowTableModal(false)} className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-xl">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
