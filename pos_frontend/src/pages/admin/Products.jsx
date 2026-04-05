import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { formatCurrency } from '../../utils/formatCurrency';
import toast from 'react-hot-toast';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', category: '', price: '', unit: 'piece', tax_percent: 5, description: '', send_to_kitchen: true });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const load = () => {
    API.get('/products/').then(r => setProducts(r.data));
    API.get('/categories/').then(r => setCategories(r.data));
  };
  useEffect(load, []);

  const totalPages = Math.ceil(products.length / itemsPerPage) || 1;
  const paginatedProducts = products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { if (editing) { await API.put(`/products/${editing.id}/`, form); toast.success('Updated'); } else { await API.post('/products/', form); toast.success('Created'); }
      setShowModal(false); setEditing(null); load();
    } catch { toast.error('Error'); }
  };
  const handleDelete = async (id) => { if (!confirm('Delete?')) return; await API.delete(`/products/${id}/`); toast.success('Deleted'); load(); };
  const openEdit = (p) => { setEditing(p); setForm({ name: p.name, category: p.category, price: p.price, unit: p.unit, tax_percent: p.tax_percent, description: p.description, send_to_kitchen: p.send_to_kitchen }); setShowModal(true); };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Products</h1>
        <button onClick={() => { setEditing(null); setForm({ name: '', category: '', price: '', unit: 'piece', tax_percent: 5, description: '', send_to_kitchen: true }); setShowModal(true); }}
          className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl transition-all font-medium shadow-sm">+ Add Product</button>
      </div>
      <div className="bg-white/70 backdrop-blur border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full"><thead><tr className="bg-slate-50">{['Name','Category','Price','Tax %','Kitchen','Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-sm text-slate-500 font-medium">{h}</th>)}</tr></thead>
          <tbody>{paginatedProducts.map(p => (
            <tr key={p.id} className="border-t border-slate-100 hover:bg-sky-50/30 transition-all">
              <td className="px-4 py-3 text-slate-700 font-medium">{p.name}</td>
              <td className="px-4 py-3 text-slate-500">{p.category_name}</td>
              <td className="px-4 py-3 text-lime-600 font-medium">{formatCurrency(p.price)}</td>
              <td className="px-4 py-3 text-slate-500">{p.tax_percent}%</td>
              <td className="px-4 py-3">{p.send_to_kitchen ? <span className="text-lime-600">Yes</span> : <span className="text-slate-400">No</span>}</td>
              <td className="px-4 py-3 flex gap-2">
                <button onClick={() => openEdit(p)} className="px-3 py-1 bg-sky-100 text-sky-600 rounded-lg hover:bg-sky-200 text-sm">Edit</button>
                <button onClick={() => handleDelete(p.id)} className="px-3 py-1 bg-red-100 text-red-500 rounded-lg hover:bg-red-200 text-sm">Delete</button>
              </td>
            </tr>))}</tbody>
        </table>
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 py-4 bg-white border-t border-slate-100">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 disabled:opacity-50 text-sm font-medium">Previous</button>
            <span className="text-sm font-medium text-slate-600">Page {currentPage} of {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 disabled:opacity-50 text-sm font-medium">Next</button>
          </div>
        )}
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-xl">
            <h2 className="text-xl font-bold text-slate-700">{editing ? 'Edit Product' : 'New Product'}</h2>
            {[{f:'name',t:'text',l:'Name'},{f:'price',t:'number',l:'Price'},{f:'unit',t:'text',l:'Unit'},{f:'tax_percent',t:'number',l:'Tax %'}].map(({f,t,l}) => (
              <div key={f}><label className="block text-sm text-slate-500 mb-1">{l}</label>
                <input type={t} value={form[f]} onChange={e => setForm({...form, [f]: e.target.value})} required={f==='name'||f==='price'}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-sky-400" /></div>
            ))}
            <div><label className="block text-sm text-slate-500 mb-1">Category</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700"><option value="">Select</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div><label className="block text-sm text-slate-500 mb-1">Description</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 h-20 focus:outline-none focus:border-sky-400" /></div>
            <label className="flex items-center gap-2 text-slate-600"><input type="checkbox" checked={form.send_to_kitchen} onChange={e => setForm({...form, send_to_kitchen: e.target.checked})} className="rounded" /> Send to Kitchen</label>
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
