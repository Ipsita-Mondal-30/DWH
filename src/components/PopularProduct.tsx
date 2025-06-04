"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import type { IProduct } from "../models/Product";
import { useCart } from "../app/context/CartContext";
import Image from "next/image";

export default function PopularProduct() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      const res = await axios.get("/api/product");
      const popular = res.data.filter((p: IProduct) => p.type === "popular");
      setProducts(popular);
    };

    fetchProducts();
  }, []);

  if (products.length === 0) {
    return <p>No popular products found.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {products.map((product) => (
  <div key={product._id} className="border p-4 rounded shadow">
    <div className="relative w-full h-48 rounded mb-2 overflow-hidden">
      <Image
        src={product.image}
        alt={product.name}
        fill
        className="object-cover"
      />
    </div>
    <h3 className="text-lg font-semibold">{product.name}</h3>
    <p>{product.description}</p>
    <button onClick={() => product._id && addToCart(product._id, 1)}>Add to Cart</button>
  </div>
))}

    </div>
  );
}
