import { Crown, Flame } from "lucide-react";

export default function Streak() {
  return (
    <div className="flex justify-between">
      <div className="flex gap-2 justify-center items-center">
        <Flame size={20} fill="orange" stroke="orange" />
        <span className="text-xl font-bold">25</span>
      </div>
    </div>
  );
}
