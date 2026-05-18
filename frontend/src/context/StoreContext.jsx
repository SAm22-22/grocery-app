import React, { createContext, useContext, useState, useEffect } from 'react';

const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([
    { id: '1', name: 'Organic Banana', price: 0.99, image: 'https://images.unsplash.com/photo-1543218024-57a70143c369?q=80&w=300' },
    { id: '2', name: 'Fresh Strawberries', price: 4.99, image: 'https://images.unsplash.com/photo-1464965911861-746a04b01625?q=80&w=300' },
    { id: '3', name: 'Local Honey', price: 8.99, image: 'https://images.unsplash.com/photo-1587049633562-ad767a978724?q=80&w=300' },
  ]);

  // Basic Cart Operations
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity: Math.max(0, quantity) } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const value = {
    cart,
    user,
    products,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    setUser,
    setProducts,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
