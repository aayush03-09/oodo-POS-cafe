import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { usePOS } from '../../context/POSContext';
import { formatCurrency } from '../../utils/formatCurrency';
import toast from 'react-hot-toast';

export default function OrderScreen() {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const { session, cart, addToCart, updateQuantity, removeFromCart, clearCart, cartTotal, currentOrder, setCurrentOrder } = usePOS();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  useEffect(() => { API.get('/products/').then(r => setProducts(r.data)); API.get('/categories/').then(r => setCategories(r.data)); }, []);
  const filtered = activeCategory ? products.filter(p => p.category === activeCategory) : products;

  const sendToKitchen = async () => {
    if (cart.length === 0) return toast.error('Cart is empty');
    try {
      const orderRes = await API.post('/orders/', { session: session.id, table: tableId, items: cart.map(item => ({ product: item.product.id, quantity: item.quantity })) });
      setCurrentOrder(orderRes.data); await API.post(`/orders/${orderRes.data.id}/send-to-kitchen/`);
      toast.success(`Order #${orderRes.data.order_number} sent!`); clearCart(); setCurrentOrder(orderRes.data);
    } catch { toast.error('Failed'); }
  };
  const goToPayment = () => { if (currentOrder) navigate(`/pos/payment/${currentOrder.id}`); else toast.error('Create an order first'); };

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #f7fee7 50%, #e0f2fe 100%)' }}>
      <div className="flex-1 flex flex-col">
        <div className="bg-white/80 backdrop-blur border-b border-slate-200 px-4 py-3 flex items-center gap-3 shadow-sm">
          <button onClick={() => navigate('/pos/floor')} className="text-slate-400 hover:text-slate-700">← Back</button>
          <h2 className="text-lg font-bold text-slate-800">Table {tableId} — Order</h2>
        </div>
        <div className="flex gap-2 p-3 overflow-x-auto border-b border-slate-200 bg-white/50">
          <button onClick={() => setActiveCategory(null)} className={`px-4 py-1.5 rounded-lg text-sm whitespace-nowrap transition-all ${!activeCategory ? 'bg-sky-500 text-white shadow' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}>All</button>
          {categories.map(c => <button key={c.id} onClick={() => setActiveCategory(c.id)} className={`px-4 py-1.5 rounded-lg text-sm whitespace-nowrap transition-all ${activeCategory === c.id ? 'bg-sky-500 text-white shadow' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}>{c.name}</button>)}
        </div>
        <div className="flex-1 p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 overflow-y-auto">
          {filtered.map(p => (
            <button key={p.id} onClick={() => addToCart(p)} className="bg-white/70 backdrop-blur border border-slate-200 rounded-xl p-4 text-left hover:border-sky-400 hover:bg-sky-50 transition-all shadow-sm">
              <div className="text-slate-700 font-medium text-sm">{p.name}</div>
              <div className="text-sky-600 font-semibold mt-1">{formatCurrency(p.price)}</div>
            </button>
          ))}
        </div>
      </div>
      <div className="w-80 bg-white/80 backdrop-blur border-l border-slate-200 flex flex-col shadow-sm">
        <div className="p-4 border-b border-slate-200"><h3 className="text-lg font-bold text-slate-800">Cart</h3></div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 && <p className="text-slate-400 text-center py-8 text-sm">No items in cart</p>}
          {cart.map(item => (
            <div key={item.product.id} className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center justify-between">
              <div className="flex-1">
                <div className="text-slate-700 text-sm font-medium">{item.product.name}</div>
                <div className="text-sky-600 text-xs">{formatCurrency(item.unit_price)} x {item.quantity} = {formatCurrency(item.unit_price * item.quantity)}</div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-7 h-7 bg-slate-200 rounded-lg text-slate-600 text-sm hover:bg-slate-300">-</button>
                <span className="w-6 text-center text-slate-700 text-sm">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-7 h-7 bg-slate-200 rounded-lg text-slate-600 text-sm hover:bg-slate-300">+</button>
                <button onClick={() => removeFromCart(item.product.id)} className="w-7 h-7 bg-red-100 rounded-lg text-red-500 text-sm hover:bg-red-200 ml-1">×</button>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-slate-200 space-y-3">
          <div className="flex justify-between text-lg font-bold"><span className="text-slate-600">Total</span><span className="text-slate-800">{formatCurrency(cartTotal)}</span></div>
          <button onClick={sendToKitchen} className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-white font-bold rounded-xl hover:from-amber-300 hover:to-amber-400 transition-all shadow">Send to Kitchen</button>
          {currentOrder && <button onClick={goToPayment} className="w-full py-3 bg-gradient-to-r from-lime-500 to-lime-600 text-white font-bold rounded-xl hover:from-lime-400 hover:to-lime-500 transition-all shadow">Payment — #{currentOrder.order_number}</button>}
        </div>
      </div>
    </div>
  );
}
