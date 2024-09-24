import { FounderCard } from "@/components/FounderCard";
import Hero from "@/components/Hero";

const founders = [
  {
    nama: "Adam Novaldino",
    otobiografi:
      "Adam is an Institut Teknologi Bandung student with four Ganesha Awards and multiple achievements in international competitions, primarily focused on energy-related themes. He has created innovative ideas, including emission reduction frameworks for private industry and low-emission technologies for fishermen. Adam also won a business competition award for translating research into commercial applications for companies like Grab Indonesia.",
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
      "Fachri has a strong background and interest in software development. He currently serves as the Head of the Service Information and Profession Division in the Petroleum Engineering Student Association at Institut Teknologi Bandung. Fachri led the development of an all-in-one website to meet the needs of petroleum engineering students at ITB and also developed a website for the 2024 Conference of Association of China Southeast Asia Microscopy.",
    imageUrl: "/fachri.jpg",
  },
  {
    nama: "Andrew Ringgas",
    otobiografi:
      "Ringgas is an Institut Teknologi Bandung student with deep interest in geospatial technology and CCUS. He won a paper competition for his research paper on the potential of GNSS implementation in CCUS. In his time as an intern at Pertamina Hulu Energy, he worked as a GIS analyst, focusing on surface and subsurface analysis for carbon injection. Ringgas also serves as the president of the Geodetic & Geomatic Student Association at Institut Teknologi Bandung.",
    imageUrl: "/ringgas.jpg",
  },
];

export default function Home() {
  return (
    <main className="p-6">
      <Hero />
      <div className="">
        <h1 className="text-center text-3xl font-bold mb-10">Meet Our Team</h1>
        <div className="flex justify-around">
          {founders.map((founder) => (
            <FounderCard founder={founder} />
          ))}
        </div>
      </div>
    </main>
  );
}
