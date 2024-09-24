"use client";

import Image from "next/image";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

const NotFound = () => {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.back();
    }, 3000);

    return () => clearTimeout(timer); // Cleanup the timer if the component unmounts
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gray-100">
      <div className="relative h-24 w-96">
        <Image src="/text-logo.png" alt="Decarbond" fill priority />
      </div>
      <h1 className="text-4xl font-bold text-black my-4">Under Development</h1>
      <p className="text-lg text-primary">
        Oops! Looks like this page is currently under development. Please check
        back later.
      </p>
    </div>
  );
};

export default NotFound;
