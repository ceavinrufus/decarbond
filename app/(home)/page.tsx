import { FounderCard } from "@/components/FounderCard";
import GaugeChart from "@/components/GaugeChart";
import Hero from "@/components/Hero";

const founders = [
  {
    nama: "Adam Novaldino",
    otobiografi:
      "Adam, an ITB student with multiple awards, has focused on energy-related research. He's created innovative ideas for emission reduction and low-emission technologies, winning awards for his work, including a business competition prize for translating research into commercial applications.",
    imageUrl: "/adam.jpg",
  },
  {
    nama: "Ceavin Rufus",
    otobiografi:
      "Ceavin Rufus is a motivated software engineer with a strong desire to learn and grow. He has a combination of academic knowledge and 2+ years of practical experience from both professional and freelance work.",
    imageUrl: "/cepus.jpg",
  },
  {
    nama: "Fachri Miskyatul",
    otobiografi:
      "Fachri is a software developer and the head of the Service Information and Profession Division at ITB's Petroleum Engineering Student Association. He led the development of an all-in-one website for petroleum engineering students and a website for the 2024 Conference of Association of China Southeast Asia Microscopy.",
    imageUrl: "/fachri.jpg",
  },
  {
    nama: "Andrew Ringgas",
    otobiografi:
      "Ringgas, an ITB student interested in geospatial technology and CCUS, won a paper competition for his research on using GNSS in CCUS. As a GIS analyst at Pertamina Hulu Energy, he focused on surface and subsurface analysis for carbon injection. He's also the president of the Geodetic & Geomatic Student Association at ITB.",
    imageUrl: "/ringgas.jpg",
  },
];

export default function Home() {
  return (
    <main className="p-6 max-w-7xl">
      <Hero />
      <div className="">
        <h1 className="text-center text-3xl font-bold mb-10">Meet Our Team</h1>
        <div className="flex justify-around">
          {founders.map((founder, index) => (
            <FounderCard key={index} founder={founder} />
          ))}
        </div>
      </div>
    </main>
  );
}
