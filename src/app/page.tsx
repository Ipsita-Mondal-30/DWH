"use client";

import { useSession } from "next-auth/react";
import React from "react";
import Navbar from "@/components/Navbar";
import Carousel from "../components/Carousel";
import LatestProduct from "@/components/LatestProduct"; // import if you have this
import PopularProduct from "@/components/PopularProduct"; // import if you have this
import AddProduct from "@/components/AddProduct"; // import if you have this

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") return <p className="text-center mt-4">Loading...</p>;

  return (
    <>
    <Navbar />
    <Carousel />

    <section className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-6">Latest Product</h2>
      <LatestProduct />
    </section>

    <section className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-6">Popular Product</h2>
      <PopularProduct />
    </section>

    <section className="max-w-7xl mx-auto px-4 py-8">
      <AddProduct />
    </section>
  </>
);
}