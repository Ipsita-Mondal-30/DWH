"use client";

import { useSession } from "next-auth/react";
import React from "react";
import Navbar from "@/components/Navbar";
import Carousel from "../components/Carousel";
import EnquiryForm from "@/components/EnquiryForm";
import LatestProduct from "@/components/LatestSweet";
import PopularProduct from "@/components/PopularProduct";
import SawamaniForm from "@/components/SawamaniForm";
import InteractiveMap from '@/components/InteractiveMap';
import LatestNamkeen from "@/components/LatestNamkeen";

export default function Home() {
  const { status } = useSession();

  if (status === "loading") return <p className="text-center mt-4">Loading...</p>;

  return (
    <>
    <div className="bg-gradient-to-br from-pink-50 via-orange-50 to-red-50">
     <Navbar />
      <div className="mt-10">
        <Carousel />
      </div>


      <section className="max-w-7xl mx-auto px-4 py-8 ">
        <h2 className="text-2xl font-semibold mb-6">Latest Product</h2>
        <LatestProduct />
        <LatestNamkeen />
      </section>

      <section className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-6">Popular Product</h2>
        <PopularProduct />
      </section>
      <section> 
        <InteractiveMap /> 
      </section>
      <section className="max-w-7xl bg-gradient-to-br from-pink-50 via-orange-50 to-red-50">
        <SawamaniForm />
        <EnquiryForm />
      </section>
      </div>
    </>
  );
}
