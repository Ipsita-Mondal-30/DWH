"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Product {
  _id?: string;
  name: string;
  description: string;
  type: "popular" | "latest" | "none";
  image: string;
}

export default function AdminPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<Product>({ name: "", description: "", type: "none", image: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchProducts = async () => {
    const res = await axios.get("/api/product");
    setProducts(res.data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImageFile(file);
  };

  const uploadImage = async (): Promise<string> => {
    if (!imageFile) return "";
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(",")[1];
        resolve(`data:image/png;base64,${base64}`);
      };
      reader.onerror = reject;
      reader.readAsDataURL(imageFile);
    });
  };

  const handleSubmit = async () => {
    const imageBase64 = await uploadImage();
    const payload = { ...form, imageBase64 };

    if (editingId) {
      await axios.put(`/api/product/${editingId}`, payload);
    } else {
      await axios.post("/api/product", payload);
    }

    setModalOpen(false);
    setForm({ name: "", description: "", type: "none", image: "" });
    setImageFile(null);
    setEditingId(null);
    fetchProducts();
  };

  const handleEdit = (product: Product) => {
    setForm({ ...product });
    setEditingId(product._id || null);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    await axios.delete(`/api/product/${id}`);
    fetchProducts();
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Admin Panel</h1>
        <Button onClick={() => setModalOpen(true)}>Add Product</Button>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {products.map(product => (
          <div key={product._id} className="border p-4 rounded shadow">
            <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded mb-2" />
            <h2 className="text-lg font-semibold">{product.name}</h2>
            <p>{product.description}</p>
            <p className="italic text-sm">{product.type}</p>
            <div className="mt-2 space-x-2">
              <Button onClick={() => handleEdit(product)}>Edit</Button>
              <Button variant="destructive" onClick={() => handleDelete(product._id!)}>Delete</Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded shadow w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editingId ? "Edit" : "Add"} Product</h2>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="w-full mb-2 border p-2 rounded" />
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="w-full mb-2 border p-2 rounded" />
            <select name="type" value={form.type} onChange={handleChange} className="w-full mb-2 border p-2 rounded">
              <option value="none">None</option>
              <option value="popular">Popular</option>
              <option value="latest">Latest</option>
            </select>
            <input type="file" onChange={handleImage} accept="image/*" className="w-full mb-4" />
            <div className="flex justify-end space-x-2">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>{editingId ? "Update" : "Add"}</Button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
