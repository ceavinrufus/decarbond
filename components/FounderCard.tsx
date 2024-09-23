"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { DirectionAwareHover } from "./ui/direction-aware-hover";

export function FounderCard({ founder }: { founder: any }) {
  return (
    <div className="relative flex items-center justify-center">
      <DirectionAwareHover imageUrl={founder.imageUrl}>
        <p className="font-bold text-xl">{founder.nama}</p>
        <p className="font-normal text-sm">{founder.otobiografi}</p>
      </DirectionAwareHover>
    </div>
  );
}
