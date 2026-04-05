import { createContext, useContext, useState } from 'react';

const POSContext = createContext();

export function POSProvider({ children }) {
  const [session, setSession] = useState(null);
  const [cart, setCart] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [currentOrder, setCurrentOrder] = useState(null);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1, unit_price: product.price }];
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => item.product.id !== productId));
    } else {
      setCart(prev => prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      ));
    }
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);

  return (
    <POSContext.Provider value={{
      session, setSession,
      cart, addToCart, updateQuantity, removeFromCart, clearCart, cartTotal,
      selectedTable, setSelectedTable,
      currentOrder, setCurrentOrder,
    }}>
      {children}
    </POSContext.Provider>
  );
}

export const usePOS = () => useContext(POSContext);
