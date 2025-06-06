'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';

export interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  size?: string;
  type?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    if (status === 'loading') return;
    if (!session) {
      setCart([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await axios.get('/api/cart');
      setCart(res.data.items || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setError('Failed to fetch cart');
      setCart([]);
    } finally {
      setLoading(false);
    }
  }, [session, status]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId: string, quantity: number) => {
    if (!session) {
      setError('Please login to add items to cart');
      return;
    }

    try {
      setError(null);
      await axios.post('/api/cart', { productId, quantity });
      await fetchCart(); // Refresh cart after adding
    } catch (error) {
      console.error('Error adding to cart:', error);
      setError('Failed to add item to cart');
      throw error;
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!session) {
      setError('Please login to modify cart');
      return;
    }

    try {
      setError(null);
      await axios.delete('/api/cart', { data: { productId } });
      await fetchCart(); // Refresh cart after removing
    } catch (error) {
      console.error('Error removing from cart:', error);
      setError('Failed to remove item from cart');
      throw error;
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!session) {
      setError('Please login to modify cart');
      return;
    }

    try {
      setError(null);
      await axios.put('/api/cart', { productId, quantity });
      await fetchCart(); // Refresh cart after updating
    } catch (error) {
      console.error('Error updating cart:', error);
      setError('Failed to update cart');
      throw error;
    }
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      loading, 
      error 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};