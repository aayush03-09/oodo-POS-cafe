import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, getRedirectPath } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('user'); // 'user' or 'kitchen'
  const [pin, setPin] = useState('');
  const [kitchenPin, setKitchenPin] = useState(null);

  useEffect(() => {
    if (activeTab === 'kitchen') {
      API.get('/auth/get-kitchen-pin/').then(res => setKitchenPin(res.data.pin));
    }
  }, [activeTab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const loginUsername = activeTab === 'kitchen' ? 'kitchen' : username;
      const loginPassword = activeTab === 'kitchen' ? pin : password;
      const user = await login(loginUsername, loginPassword);
      toast.success(`Welcome, ${user.username}!`);
      navigate(getRedirectPath(user.role));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #f7fee7 50%, #e0f2fe 100%)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-lime-400 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg">☕</div>
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Odoo POS Cafe</h1>
          <p className="text-slate-500 mt-1 text-sm">Restaurant Management System</p>
        </div>
        <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-2xl shadow-xl shadow-sky-100/50 overflow-hidden">
          <div className="flex border-b border-slate-100 bg-slate-50/50">
            <button type="button" onClick={() => setActiveTab('user')} className={`flex-1 py-4 text-sm font-semibold transition-all ${activeTab === 'user' ? 'text-sky-600 bg-white border-b-2 border-sky-500' : 'text-slate-400 hover:text-slate-600'}`}>Staff & Manager</button>
            <button type="button" onClick={() => setActiveTab('kitchen')} className={`flex-1 py-4 text-sm font-semibold transition-all ${activeTab === 'kitchen' ? 'text-amber-500 bg-white border-b-2 border-amber-500' : 'text-slate-400 hover:text-slate-600'}`}>Kitchen PIN</button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {activeTab === 'user' ? (
              <>
                <div>
                  <label className="block text-sm text-slate-500 mb-1 font-medium">Username</label>
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all" />
                </div>
                <div>
                  <label className="block text-sm text-slate-500 mb-1 font-medium">Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all" />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm text-slate-500 mb-1 font-medium text-center">Enter 4-Digit Kitchen PIN</label>
                <input type="password" maxLength={4} pattern="\d{4}" value={pin} onChange={(e) => setPin(e.target.value)} required
                  className="w-full text-center tracking-[1em] text-3xl font-bold px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all font-mono" />
                <p className="text-sm text-center text-amber-600 mt-3 font-medium">Auto-generated PIN: {kitchenPin ? kitchenPin : 'Not Generated Yet'}</p>
              </div>
            )}
            
            <button type="submit" disabled={loading}
              className={`w-full py-3 text-white font-semibold rounded-xl transition-all disabled:opacity-50 shadow-lg ${activeTab === 'user' ? 'bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 shadow-sky-200' : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 shadow-amber-200'}`}>
              {loading ? 'Accessing...' : (activeTab === 'user' ? 'Sign In' : 'Enter Kitchen')}
            </button>

            {activeTab === 'user' && (
              <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-400 text-center mb-2">Quick Login</p>
                <div className="flex gap-2 justify-center">
                  {[{u:'manager',p:'manager@123',r:'Manager',c:'bg-sky-100 text-sky-700 hover:bg-sky-200'},{u:'staff',p:'staff@123',r:'Staff',c:'bg-lime-100 text-lime-700 hover:bg-lime-200'}].map(c => (
                    <button key={c.u} type="button" onClick={() => { setUsername(c.u); setPassword(c.p); }}
                      className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${c.c}`}>
                      {c.r}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
