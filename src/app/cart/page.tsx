'use client';

import { useCart } from "../context/CartContext";
import { CartItem } from "../../types/cart";

export default function CartPage() {
  const { cart, removeFromCart } = useCart();

  if (cart.length === 0) {
    return <p className="p-4">Your cart is empty.</p>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
      {cart.map((item: CartItem) => (
        <div key={item.product._id} className="mb-3 p-3 border rounded shadow">
          <h3 className="text-lg font-semibold">{item.product.name}</h3>
          <p>Quantity: {item.quantity}</p>
          <button
            className="mt-2 bg-red-500 text-white px-2 py-1 rounded"
            onClick={() => item.product._id && removeFromCart(item.product._id)}
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}
