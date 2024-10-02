import React from "react";
import Image from "next/image";
import { StartPlanning } from "@/components/StartPlanning";

const Hero = () => {
  return (
    <div className="flex items-center justify-center h-screen gap-10">
      <div className="space-y-10 mb-8">
        <div className="flex flex-col">
          <div className="relative h-24 w-96">
            <Image src="/text-logo.png" alt="Decarbond" fill priority />
          </div>
          <p className="text-xl font-semibold my-5">
            Your Future Decarbonization Super App
          </p>
          <p className="">
            Decarbond is a software to plan, design, simulate, monitor, and
            optimize decarbonization project. Start from transition energy
            projects to emission management. Decarbond aim to be the ultimate
            All-in-One Decarbonization design and planning software.
          </p>
        </div>
        <StartPlanning />
      </div>
      <div className="w-fit">
        <div className="relative h-96 w-96">
          <Image src="/earth.png" alt="Hero Image" layout="fill" />
        </div>
      </div>
    </div>
  );
};

export default Hero;
