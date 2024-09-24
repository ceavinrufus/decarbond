"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "./ui/sidebar";
import {
  IconBrandTabler,
  IconSolarPanel2,
  IconMapPin2,
  IconWind,
  IconWavesElectricity,
  IconWaveSquare,
  IconTree,
  IconBuildingFactory,
  IconHomeBolt,
} from "@tabler/icons-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function SidebarComponent() {
  const links = [
    {
      label: "Home",
      href: "/",
      icon: <IconBrandTabler className="text-white h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Solar Planning",
      href: "/solar-planning",
      icon: <IconSolarPanel2 className="text-white h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Pipeline Route",
      href: "/pipeline-route",
      icon: <IconMapPin2 className="text-white h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Wind Planning",
      href: "/wind-planning",
      icon: <IconWind className="text-white h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Hydro Planning",
      href: "/hydro-planning",
      icon: (
        <IconWavesElectricity className="text-white h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Geothermal Planning",
      href: "/geothermal-planning",
      icon: <IconWaveSquare className="text-white h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Forestation Planning",
      href: "/forestation-planning",
      icon: <IconTree className="text-white h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Smart Grid",
      href: "/smart-grid",
      icon: <IconHomeBolt className="text-white h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Emission Tracking and Monitoring",
      href: "/emission",
      icon: (
        <IconBuildingFactory className="text-white h-5 w-5 flex-shrink-0" />
      ),
    },
  ];
  const [open, setOpen] = useState(false);
  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-10 h-screen border-r-2 bg-primary">
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {open ? <Logo /> : <LogoIcon />}
          <div className="mt-8 flex flex-col gap-2">
            {links.map((link, idx) => (
              <SidebarLink key={idx} link={link} />
            ))}
          </div>
        </div>
        <div>
          <SidebarLink
            link={{
              label: "Ceavin Rufus",
              href: "#",
              icon: (
                <Image
                  src="https://assets.aceternity.com/manu.png"
                  className="h-7 w-7 flex-shrink-0 rounded-full"
                  width={50}
                  height={50}
                  alt="Avatar"
                />
              ),
            }}
          />
        </div>
      </SidebarBody>
    </Sidebar>
  );
}
export const Logo = () => {
  return (
    <Link
      href="/"
      className="font-normal flex space-x-2 items-center text-sm py-1 relative z-20"
    >
      <div className="relative h-6 w-[92px]">
        <Image src="/text-logo-white.png" alt="Decarbond" fill priority />
      </div>
    </Link>
  );
};
export const LogoIcon = () => {
  return (
    <Link
      href="/"
      className="font-normal flex space-x-2 items-center text-sm py-1 relative z-20"
    >
      <div className="relative size-6">
        <Image src="/logo-white.png" alt="Decarbond" fill priority />
      </div>
    </Link>
  );
};
