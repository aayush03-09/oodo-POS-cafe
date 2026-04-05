import { createContext, useContext, useState } from 'react';
import API from '../api/axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('poscafe_user') || 'null'));

  const login = async (username, password) => {
    const res = await API.post('/auth/login/', { username, password });
    localStorage.setItem('poscafe_user', JSON.stringify(res.data.user));
    localStorage.setItem('poscafe_tokens', JSON.stringify(res.data.tokens));
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('poscafe_user');
    localStorage.removeItem('poscafe_tokens');
    setUser(null);
  };

  const getRedirectPath = (role) => {
    switch (role) {
      case 'admin': return '/admin-portal/dashboard';
      case 'staff': return '/staff/orders';
      case 'kitchen': return '/kitchen/display';
      default: return '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, getRedirectPath }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
