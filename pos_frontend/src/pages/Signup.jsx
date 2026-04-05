import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Signup() {
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'admin' });
  const [loading, setLoading] = useState(false);
  const { signup, getRedirectPath } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await signup(form.username, form.email, form.password, form.role);
      toast.success('Account created!');
      navigate(getRedirectPath(user.role));
    } catch (err) {
      toast.error(err.response?.data?.username?.[0] || 'Signup failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0f23] via-[#1a1a3e] to-[#2d1b69] p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">☕ Odoo POS Cafe</h1>
        </div>
        <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl space-y-5">
          <h2 className="text-2xl font-semibold text-white text-center">Create Account</h2>
          {['username', 'email', 'password'].map(field => (
            <div key={field}>
              <label className="block text-sm text-gray-400 mb-1 capitalize">{field}</label>
              <input type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                value={form[field]} onChange={e => setForm({...form, [field]: e.target.value})} required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-all" />
            </div>
          ))}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Role</label>
            <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}
              className="w-full px-4 py-3 bg-[#1a1a3e] border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500">
              <option value="admin">Admin</option>
              <option value="cashier">Cashier</option>
              <option value="kitchen">Kitchen</option>
            </select>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50">
            {loading ? 'Creating...' : 'Create Account'}
          </button>
          <p className="text-center text-sm text-gray-400">
            Already have an account? <Link to="/login" className="text-indigo-400 hover:text-indigo-300">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
