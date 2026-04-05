import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { formatCurrency } from '../../utils/formatCurrency';
import toast from 'react-hot-toast';

export default function StaffOrders() {
  const [floors, setFloors] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('new');
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark-theme'));
  
  // Customization Modal State
  const [selectedItemOption, setSelectedItemOption] = useState(null);
  const [customType, setCustomType] = useState('regular');
  const [customNote, setCustomNote] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/floors/').then(r => setFloors(r.data));
    API.get('/products/').then(r => setProducts(r.data));
    API.get('/categories/').then(r => setCategories(r.data));
    loadOrders();
  }, []);

  const loadOrders = () => API.get('/orders/').then(r => setOrders(r.data.filter(o => o.status !== 'draft')));

  const openCustomization = (p) => {
    setSelectedItemOption(p);
    setCustomType('regular');
    setCustomNote('');
  };

  const confirmAddToCart = () => {
    const p = selectedItemOption;
    // We group by product ID, type, and lowered note so exactly matching items stack
    const cartId = `${p.id}-${customType}-${customNote.toLowerCase().trim()}`;
    setCart(prev => {
      const e = prev.find(i => i.cartId === cartId);
      if (e) return prev.map(i => i.cartId === cartId ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { cartId, product: p, quantity: 1, unit_price: p.price, type: customType, note: customNote.trim() }];
    });
    setSelectedItemOption(null);
  };

  const updateQty = (cartId, q) => { if (q < 1) return removeItem(cartId); setCart(prev => prev.map(i => i.cartId === cartId ? { ...i, quantity: q } : i)); };
  const removeItem = (cartId) => setCart(prev => prev.filter(i => i.cartId !== cartId));
  const cartTotal = cart.reduce((s, i) => s + i.unit_price * i.quantity, 0);

  const placeOrder = async () => {
    if (!selectedTable) return toast.error('Select a table first');
    if (cart.length === 0) return toast.error('Add items to cart');
    try {
      const res = await API.post('/orders/', { 
        table: selectedTable.id, 
        items: cart.map(i => ({ 
          product: i.product.id, 
          quantity: i.quantity,
          customization_type: i.type,
          note: i.note
        })) 
      });
      await API.post(`/orders/${res.data.id}/send-to-kitchen/`);
      toast.success(`Order #${res.data.order_number} placed & sent to kitchen!`);
      setCart([]); setSelectedTable(null); loadOrders(); setTab('active');
    } catch (err) { toast.error('Failed to place order'); }
  };

  const markServed = async (id) => {
    await API.patch(`/orders/${id}/mark-served/`);
    toast.success('Marked as served'); loadOrders();
  };

  const filtered = activeCategory ? products.filter(p => p.category === activeCategory) : products;
  const statusBadge = (s) => {
    const c = { sent: 'bg-sky-100 text-sky-600', preparing: 'bg-amber-100 text-amber-600', served: 'bg-lime-100 text-lime-600', paid: 'bg-emerald-100 text-emerald-600' };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c[s] || 'bg-slate-100 text-slate-500'}`}>{s}</span>;
  };
  const payBadge = (s) => s === 'done' ? <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-600">Paid</span> : <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-500">Pending</span>;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #f7fee7 50%, #e0f2fe 100%)' }}>
      <nav className="bg-white/80 backdrop-blur border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-lime-400 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow">☕</div>
          <span className="text-lg font-bold text-slate-700">Staff Portal</span>
        </div>
        <div className="flex gap-2">
          {[{ k: 'new', l: '+ New Order' }, { k: 'active', l: 'Active Orders' }].map(t => (
            <button key={t.k} onClick={() => setTab(t.k)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === t.k ? 'bg-sky-500 text-white shadow' : 'text-slate-500 hover:bg-slate-100'}`}>{t.l}</button>
          ))}
          <button onClick={() => { document.documentElement.classList.toggle('dark-theme'); setIsDark(!isDark); }} className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all text-sm ml-2">
            {isDark ? '☀️' : '🌙'}
          </button>
          <button onClick={() => { localStorage.removeItem('poscafe_user'); localStorage.removeItem('poscafe_tokens'); window.location.href='/login'; }}
            className="px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 text-sm font-medium ml-2">Logout</button>
        </div>
      </nav>

      {/* NEW ORDER TAB */}
      {tab === 'new' && (
        <div className="flex h-[calc(100vh-57px)] relative">
          {/* Left: Table + Menu */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {!selectedTable ? (
              <div className="p-6 overflow-y-auto">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Select Table</h2>
                {floors.map(floor => (
                  <div key={floor.id} className="mb-6">
                    <h3 className="text-sm font-medium text-slate-500 mb-2">{floor.name}</h3>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                      {floor.tables?.map(t => (
                        <button key={t.id} onClick={() => setSelectedTable(t)}
                          className={`border rounded-xl p-4 text-center transition-all shadow-sm ${
                            t.is_occupied 
                              ? 'border-red-400 bg-red-50 hover:bg-red-100' 
                              : 'border-slate-200 bg-white/70 hover:border-lime-400 hover:bg-lime-50'
                          }`}>
                          <div className="text-2xl mb-1">🪑</div>
                          <div className={`font-bold ${t.is_occupied ? 'text-red-700' : 'text-slate-700'}`}>T{t.table_number}</div>
                          <div className={`text-xs ${t.is_occupied ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
                            {t.is_occupied ? 'Occupied' : 'Free'}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col flex-1 overflow-hidden">
                <div className="bg-white/60 px-4 py-2 border-b border-slate-200 flex items-center gap-3">
                  <button onClick={() => { setSelectedTable(null); setCart([]); }} className="text-slate-400 hover:text-slate-700 text-sm">← Back</button>
                  <span className="font-semibold text-slate-700">Table {selectedTable.table_number}</span>
                </div>
                <div className="flex gap-2 p-3 overflow-x-auto border-b border-slate-200 bg-white/40">
                  <button onClick={() => setActiveCategory(null)} className={`px-3 py-1 rounded-lg text-sm whitespace-nowrap ${!activeCategory ? 'bg-sky-500 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}>All</button>
                  {categories.map(c => <button key={c.id} onClick={() => setActiveCategory(c.id)} className={`px-3 py-1 rounded-lg text-sm whitespace-nowrap ${activeCategory === c.id ? 'bg-sky-500 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}>{c.name}</button>)}
                </div>
                <div className="flex-1 p-4 grid grid-cols-2 lg:grid-cols-4 gap-3 overflow-y-auto">
                  {filtered.map(p => (
                    <button key={p.id} onClick={() => openCustomization(p)} className="bg-white/70 border border-slate-200 rounded-xl p-3 text-left hover:border-sky-400 hover:bg-sky-50 transition-all shadow-sm flex flex-col justify-between h-24">
                      <div className="text-slate-700 font-medium text-sm leading-tight">{p.name}</div>
                      <div className="text-sky-600 font-semibold text-sm mt-1">{formatCurrency(p.price)}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Cart */}
          {selectedTable && (
            <div className="w-80 bg-white/80 backdrop-blur border-l border-slate-200 flex flex-col shadow-sm">
              <div className="p-4 border-b border-slate-200"><h3 className="text-lg font-bold text-slate-800">Order — T{selectedTable.table_number}</h3></div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {cart.length === 0 && <p className="text-slate-400 text-center py-8 text-sm">Add items from the menu</p>}
                {cart.map(item => (
                  <div key={item.cartId} className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-slate-700 text-sm font-medium">
                          {item.product.name}
                          {item.type === 'jain' && <span className="ml-2 inline-block px-1.5 py-0.5 rounded text-[10px] bg-green-100 text-green-700 font-bold border border-green-200">JAIN</span>}
                        </div>
                        {item.note && <div className="text-amber-600 text-xs mt-0.5 italic">Note: {item.note}</div>}
                        <div className="text-sky-600 text-xs mt-1">{formatCurrency(item.unit_price)} × {item.quantity} = {formatCurrency(item.unit_price * item.quantity)}</div>
                      </div>
                      <button onClick={() => removeItem(item.cartId)} className="text-red-400 hover:text-red-600 text-sm">×</button>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => updateQty(item.cartId, item.quantity - 1)} className="w-6 h-6 bg-slate-200 rounded text-slate-600 hover:bg-slate-300 text-sm">-</button>
                      <span className="text-sm text-slate-700 w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQty(item.cartId, item.quantity + 1)} className="w-6 h-6 bg-slate-200 rounded text-slate-600 hover:bg-slate-300 text-sm">+</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-slate-200 space-y-3">
                <div className="flex justify-between text-lg font-bold"><span className="text-slate-600">Total</span><span className="text-slate-800">{formatCurrency(cartTotal)}</span></div>
                <button onClick={placeOrder} className="w-full py-3 bg-gradient-to-r from-sky-500 to-sky-600 text-white font-bold rounded-xl hover:from-sky-400 hover:to-sky-500 transition-all shadow-lg shadow-sky-200">
                  Place Order
                </button>
              </div>
            </div>
          )}

          {/* Customization Modal */}
          {selectedItemOption && (
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 text-lg">{selectedItemOption.name}</h3>
                  <div className="text-sky-600 font-semibold">{formatCurrency(selectedItemOption.price)}</div>
                </div>
                <div className="p-5 space-y-5">
                  <div>
                    <label className="text-sm font-semibold text-slate-600 mb-2 block">Preparation Type</label>
                    <div className="flex gap-2">
                      <button onClick={() => setCustomType('regular')} className={`flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-all ${customType === 'regular' ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-slate-100 text-slate-500 hover:border-slate-200'}`}>Regular</button>
                      <button onClick={() => setCustomType('jain')} className={`flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-all ${customType === 'jain' ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-100 text-slate-500 hover:border-slate-200'}`}>Jain</button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-600 mb-2 block">Custom Notes <span className="text-slate-400 font-normal">(Optional)</span></label>
                    <textarea 
                      value={customNote} onChange={(e) => setCustomNote(e.target.value)} 
                      placeholder="E.g. Less spicy, strictly no garlic..."
                      rows="2"
                      className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-400 transition-all resize-none"
                    ></textarea>
                  </div>
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2">
                  <button onClick={() => setSelectedItemOption(null)} className="flex-1 py-2.5 rounded-xl font-medium text-slate-500 hover:bg-slate-200 bg-slate-100 transition-all text-sm">Cancel</button>
                  <button onClick={confirmAddToCart} className="flex-1 py-2.5 rounded-xl font-semibold text-white bg-sky-500 hover:bg-sky-400 shadow shadow-sky-200 transition-all text-sm">Add to Cart</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ACTIVE ORDERS TAB */}
      {tab === 'active' && (
        <div className="p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Active Orders</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.filter(o => o.status !== 'paid').map(o => (
              <div key={o.id} className="bg-white/70 backdrop-blur border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <div><span className="font-bold text-slate-700 text-lg">#{o.order_number}</span><span className="text-sm text-slate-400 ml-2">T{o.table_number}</span></div>
                  <div className="flex gap-2">{statusBadge(o.status)}{payBadge(o.payment_status)}</div>
                </div>
                <div className="p-4 space-y-1">
                  {o.items?.map(i => (
                    <div key={i.id} className="flex justify-between text-sm py-1 border-b border-slate-50/50 last:border-0">
                      <div>
                        <div className="text-slate-700">
                          {i.product_name} ×{i.quantity}
                          {i.customization_type === 'jain' && <span className="ml-2 inline-block px-1.5 py-0.5 rounded text-[10px] bg-green-100 text-green-700 font-bold border border-green-200 leading-none">JAIN</span>}
                        </div>
                        {i.note && <div className="text-amber-500 text-xs italic mt-0.5">{i.note}</div>}
                      </div>
                      <span className="text-slate-700">{formatCurrency(i.subtotal)}</span>
                    </div>
                  ))}
                  <div className="border-t border-slate-100 pt-2 mt-2 flex justify-between font-bold"><span className="text-slate-600">Total</span><span className="text-slate-800">{formatCurrency(o.total)}</span></div>
                </div>
                <div className="px-4 pb-4 flex gap-2">
                  {(o.status === 'sent' || o.status === 'preparing') && <button onClick={() => markServed(o.id)} className="flex-1 py-2 bg-lime-500 text-white rounded-xl font-medium hover:bg-lime-400 text-sm">Mark Served</button>}
                  {o.status === 'served' && o.payment_status === 'pending' && <button onClick={() => navigate(`/staff/payment/${o.id}`)} className="flex-1 py-2 bg-sky-500 text-white rounded-xl font-medium hover:bg-sky-400 text-sm">Take Payment</button>}
                  {o.payment_status === 'done' && <button onClick={() => navigate(`/staff/receipt/${o.id}`)} className="flex-1 py-2 bg-emerald-100 text-emerald-600 rounded-xl font-medium text-sm">View Receipt</button>}
                </div>
              </div>
            ))}
            {orders.filter(o => o.status !== 'paid').length === 0 && <p className="text-slate-400 col-span-full text-center py-8">No active orders</p>}
          </div>
        </div>
      )}
    </div>
  );
}
