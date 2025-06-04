"use client";

import { useSession } from "next-auth/react";
import React from "react";
import Navbar from "@/components/Navbar";
import Carousel from "../components/Carousel";
import EnquiryForm from "@/components/EnquiryForm";
import LatestProduct from "@/components/LatestProduct";
import PopularProduct from "@/components/PopularProduct";

export default function Home() {
  const { status } = useSession();

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
      <EnquiryForm />
    </>
  );
}
