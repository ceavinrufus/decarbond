import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 w-full">
      <div className="flex flex-col justify-center items-center mb-8 text-center">
        <div className="relative h-24 w-96">
          <Image src="/text-logo.png" alt="Decarbond" fill priority />
        </div>
        <p className="text-xl font-semibold my-5">
          The Ultimate One-For-All{" "}
          <span className="underline">Decarbonization Design</span> and{" "}
          <span className="underline">Planning Software</span>
        </p>
        <p className="w-1/2">
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Eveniet ut
          omnis exercitationem. Debitis, neque nobis, distinctio magni itaque
          asperiores aperiam, cumque magnam rerum est ea error omnis impedit?
          Dicta commodi quod sit ducimus quae optio voluptates ipsa esse
          voluptatem officia.
        </p>
      </div>

      <Button asChild className="shadow-lg w-1/3">
        <Link href="/">Start Planning</Link>
      </Button>
    </main>
  );
}
