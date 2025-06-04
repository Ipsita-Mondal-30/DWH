"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import type { IProduct } from "../models/Product";
import { useCart } from '../app/context/CartContext';
import Image from "next/image";  // <-- Import Image from next/image

export default function LatestProduct() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      const res = await axios.get("/api/product");
      const latest = res.data.filter((p: IProduct) => p.type === "latest");
      setProducts(latest);
    };

    fetchProducts();
  }, []);

  if (products.length === 0) {
    return <p>No latest products found.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product) => (
        <div key={product._id} className="border p-4 rounded shadow">
          <Image
            src={product.image}
            alt={product.name}
            width={400}       // <-- specify width (adjust as needed)
            height={192}      // <-- specify height (adjust as needed)
            className="rounded mb-2 object-cover"
          />
          <h3 className="text-lg font-semibold">{product.name}</h3>
          <p>{product.description}</p>
          <button onClick={() => product._id && addToCart(product._id, 1)}>Add to Cart</button>
        </div>
      ))}
    </div>
  );
}
