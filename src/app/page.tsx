"use client";

import { useSession } from "next-auth/react";
import React from "react";
import Navbar from "@/components/Navbar";
import Carousel from "../components/Carousel";
import LatestProduct from "@/components/LatestSweet";
import PopularProduct from "@/components/PopularProduct";
import SawamaniForm from "@/components/SawamaniForm";
import InteractiveMap from '@/components/InteractiveMap';
import LatestNamkeen from "@/components/LatestNamkeen";
import FloatingEnquiryButton from "@/components/FloatingEnquiryButton";
import About from "@/components/About";

export default function Home() {
  const { status } = useSession();

  if (status === "loading") return <p className="text-center mt-4">Loading...</p>;

  return (
    <>
      <div className="bg-gradient-to-br from-pink-50 via-orange-50 to-red-50">
        <Navbar />
        <div className="mt-35">
          <Carousel />
        </div>

        <section className="max-w-7xl mx-auto px-4 py-8">
          <LatestProduct />
          <LatestNamkeen />
        </section>

        <section className="max-w-7xl mx-auto px-4 py-8">
          <PopularProduct />
        </section>
        
        <section className="max-w-7xl mx-auto px-4 py-8"> 
          <InteractiveMap /> 
          <About />
        </section>
        
        <section className="max-w-7xl mx-auto bg-gradient-to-br from-pink-50 via-orange-50 to-red-50">
          <SawamaniForm />
        </section>
      </div>

      {/* Floating Enquiry Button */}
      <FloatingEnquiryButton />
    </>
  );
}