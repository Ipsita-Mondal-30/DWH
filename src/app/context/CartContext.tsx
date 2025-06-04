'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { CartItem } from '../../types/cart';

interface CartContextType {
  cart: CartItem[];
  addToCart: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
    const { data: session } = useSession();
    const [cart, setCart] = useState<CartItem[]>([]);
  
    const fetchCart = useCallback(async () => {
      if (session) {
        const res = await axios.get('/api/cart');
        setCart(res.data.items);
      }
    }, [session]);  // fetchCart changes only if session changes
  
    useEffect(() => {
      fetchCart();
    }, [fetchCart]);  // now fetchCart is a stable dependency
  
  const addToCart = async (productId: string, quantity: number) => {
    await axios.post('/api/cart', { productId, quantity });
    fetchCart(); // Sync after update
  };

  const removeFromCart = async (productId: string) => {
    await axios.delete('/api/cart', { data: { productId } });
    fetchCart(); // Sync after removal
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
