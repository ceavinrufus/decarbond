import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Link from "next/link";

export function StartPlanning() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="shadow-lg ">Start Planning</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 flex gap-3 flex-col">
        <Label>Choose a Planning Tool</Label>
        <div className="flex justify-around w-full">
          <Button asChild className="shadow-lg">
            <Link href="/solar-planning">Solar Planning</Link>
          </Button>
          <Button asChild className="shadow-lg">
            <Link href="/pipeline-route">Pipeline Route</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
