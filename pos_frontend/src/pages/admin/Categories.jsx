import { useState, useEffect } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState(''); const [desc, setDesc] = useState(''); const [editing, setEditing] = useState(null);
  const load = () => API.get('/categories/').then(r => setCategories(r.data));
  useEffect(() => { load(); }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    try { if (editing) { await API.put(`/categories/${editing.id}/`, { name, description: desc }); toast.success('Updated'); } else { await API.post('/categories/', { name, description: desc }); toast.success('Created'); }
      setName(''); setDesc(''); setEditing(null); load();
    } catch { toast.error('Error'); }
  };
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Categories</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleSubmit} className="bg-white/70 backdrop-blur border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <h3 className="text-lg font-medium text-slate-700">{editing ? 'Edit Category' : 'Add Category'}</h3>
          <input value={name} onChange={e => setName(e.target.value)} required placeholder="Category name" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-sky-400" />
          <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 h-20 focus:outline-none focus:border-sky-400" />
          <div className="flex gap-2">
            <button type="submit" className="flex-1 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl transition-all">Save</button>
            {editing && <button type="button" onClick={() => { setEditing(null); setName(''); setDesc(''); }} className="py-2 px-4 bg-slate-100 text-slate-600 rounded-xl">Cancel</button>}
          </div>
        </form>
        <div className="lg:col-span-2 space-y-3">
          {categories.map(c => (
            <div key={c.id} className="bg-white/70 backdrop-blur border border-slate-200 rounded-xl p-4 flex justify-between items-center hover:bg-sky-50/30 transition-all shadow-sm">
              <div><div className="text-slate-700 font-medium">{c.name}</div><div className="text-sm text-slate-400">{c.description}</div></div>
              <div className="flex gap-2">
                <button onClick={() => { setEditing(c); setName(c.name); setDesc(c.description); }} className="px-3 py-1 bg-sky-100 text-sky-600 rounded-lg text-sm hover:bg-sky-200">Edit</button>
                <button onClick={async () => { await API.delete(`/categories/${c.id}/`); toast.success('Deleted'); load(); }} className="px-3 py-1 bg-red-100 text-red-500 rounded-lg text-sm hover:bg-red-200">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
