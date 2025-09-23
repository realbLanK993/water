import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Clock, Crown } from "lucide-react";
import { Button } from "./ui/button";

export default function BadgeDrawer() {
  return (
    <Drawer>
      <DrawerTrigger>
        <div className="flex gap-2 justify-center items-center">
          <Crown size={20} fill="orange" stroke="orange" />
          <span className="text-sm font-bold">Badges</span>
        </div>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Badges and Achievements</DrawerTitle>
          <DrawerDescription> </DrawerDescription>
        </DrawerHeader>
        <div className="w-full max-w-md mx-auto p-8 md:p-12 text-center">
          <div className="inline-block p-4 bg-sky-500 rounded-full mb-6 shadow-md">
            <Crown
              fill="orange"
              stroke="orange"
              className="text-white"
              size={40}
            />
          </div>
          <h1 className="text-4xl font-bold mb-3">Coming Soon!</h1>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            We're working hard to bring you a new achievements and badges
            system. Stay tuned for exciting new challenges!
          </p>
          <div className="flex justify-center items-center gap-2 text-gray-500">
            <Clock size={16} />
            <span>Check back later</span>
          </div>
        </div>
        <DrawerFooter className="flex justify-center items-center">
          <DrawerClose asChild>
            <Button className="w-fit px-16">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
