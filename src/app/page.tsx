"use client";

import { useSession } from "next-auth/react";
import React from "react";
import Navbar from "@/components/Navbar";
import Carousel from "../components/Carousel";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") return <p className="text-center mt-4">Loading...</p>;

  return (
    <>
      <Navbar />
      <Carousel />
      <div className="p-6">
        {session ? (
          <>
            <h1 className="text-2xl font-semibold mb-4">
              Welcome, {session.user?.name}
            </h1>
            <img
              src={session.user?.image || ""}
              alt="Profile"
              width={50}
              className="rounded-full"
            />
          </>
        ) : (
          <p ></p>
        )}
      </div>
    </>
  );
}
