"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface Product {
  _id?: string;
  name: string;
  description: string;
  type: "popular" | "latest" | "none";
  image: string;
}

export default function LatestProduct() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const res = await axios.get("/api/product");
      const latest = res.data.filter((p: Product) => p.type === "latest");
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
          <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded mb-2" />
          <h3 className="text-lg font-semibold">{product.name}</h3>
          <p>{product.description}</p>
        </div>
      ))}
    </div>
  );
}
