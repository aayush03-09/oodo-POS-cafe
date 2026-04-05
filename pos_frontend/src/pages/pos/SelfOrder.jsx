import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API from '../../api/axios';
import { formatCurrency } from '../../utils/formatCurrency';
import toast from 'react-hot-toast';

export default function SelfOrder() {
  const { token } = useParams();
  const [products, setProducts] = useState([]); const [categories, setCategories] = useState([]); const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null); const [submitted, setSubmitted] = useState(false);

  useEffect(() => { API.get('/self-order/menu/').then(r => { setProducts(r.data); setCategories([...new Set(r.data.map(p => p.category_name).filter(Boolean))]); }); }, []);

  const addToCart = (product) => { setCart(prev => { const e = prev.find(i => i.product.id === product.id); if (e) return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i); return [...prev, { product, quantity: 1 }]; }); };
  const total = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const filtered = activeCategory ? products.filter(p => p.category_name === activeCategory) : products;
  const submit = async () => { if (cart.length === 0) return toast.error('Add items'); try { await API.post('/self-order/place/', { token, items: cart.map(i => ({ product: i.product.id, quantity: i.quantity })) }); setSubmitted(true); toast.success('Order placed!'); } catch (err) { toast.error(err.response?.data?.error || 'Failed'); } };

  if (submitted) return <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #f7fee7 50%, #e0f2fe 100%)' }}><div className="text-center"><div className="text-8xl mb-6">✅</div><h1 className="text-3xl font-bold text-slate-800 mb-2">Order Placed!</h1><p className="text-slate-400">Sent to the kitchen</p></div></div>;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #f7fee7 50%, #e0f2fe 100%)' }}>
      <div className="bg-white/80 backdrop-blur border-b border-slate-200 px-6 py-4 shadow-sm"><h1 className="text-2xl font-bold text-slate-800">☕ Self Order Menu</h1></div>
      <div className="flex gap-2 p-3 overflow-x-auto border-b border-slate-200 bg-white/50">
        <button onClick={() => setActiveCategory(null)} className={`px-4 py-1.5 rounded-lg text-sm ${!activeCategory ? 'bg-sky-500 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}>All</button>
        {categories.map(c => <button key={c} onClick={() => setActiveCategory(c)} className={`px-4 py-1.5 rounded-lg text-sm ${activeCategory === c ? 'bg-sky-500 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}>{c}</button>)}
      </div>
      <div className="p-4 grid grid-cols-2 gap-3 pb-32">
        {filtered.map(p => <button key={p.id} onClick={() => addToCart(p)} className="bg-white/70 border border-slate-200 rounded-xl p-4 text-left hover:border-sky-400 hover:bg-sky-50 transition-all shadow-sm"><div className="text-slate-700 font-medium text-sm">{p.name}</div><div className="text-sky-600 font-semibold mt-1">{formatCurrency(p.price)}</div></button>)}
      </div>
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-lg">
          <div className="flex justify-between items-center mb-3"><span className="text-slate-700 font-bold">{cart.reduce((s, i) => s + i.quantity, 0)} items</span><span className="text-lime-600 font-bold text-lg">{formatCurrency(total)}</span></div>
          <button onClick={submit} className="w-full py-3 bg-gradient-to-r from-sky-500 to-sky-600 text-white font-bold rounded-xl shadow">Place Order</button>
        </div>
      )}
    </div>
  );
}
