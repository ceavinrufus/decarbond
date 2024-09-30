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
            The Ultimate One-For-All{" "}
            <span className="underline">Decarbonization Design</span> and{" "}
            <span className="underline">Planning Software</span>
          </p>
          <p className="">
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Eveniet ut
            omnis exercitationem. Debitis, neque nobis, distinctio magni itaque
            asperiores aperiam, cumque magnam rerum est ea error omnis impedit?
            Dicta commodi quod sit ducimus quae optio voluptates ipsa esse
            voluptatem officia.
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
