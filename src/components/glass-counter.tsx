import { Check, Info, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function GlassCounter({ time }: { time: number }) {
  const [count, setCount] = useState(1);
  // 10 minutes
  let diff = new Date().getTime() - time;
  let progress = (diff / (10 * 60 * 1000)) * 100;

  const handleSumbit = () => {
    console.log("submitting");
  };
  return (
    <div className="flex flex-col gap-2 justify-center items-center">
      <div className="flex flex-col gap-2">
        <small className="text-sm">Number of glasses</small>
        <div className="flex gap-1">
          <div className="bg-primary/10 p-4 rounded-l">
            <p className=" text-xs md:text-base flex gap-2 justify-center items-center w-32 md:w-64">
              <span className="text-3xl md:text-6xl font-bold">{count}</span>{" "}
              {count === 1 ? "Glass " : "Glasses "}of Water
            </p>
          </div>
          <button
            onClick={() => {
              if (count < 4) {
                setCount(count + 1);
              } else {
                setCount(1);
                toast.error(
                  "You are not allowed to drink more than 4 glasses of water per session"
                );
              }
            }}
            className="bg-primary/10 w-16 md:w-24 flex justify-center items-center  p-4 text-2xl"
          >
            <Plus size={24} />
          </button>
          <button
            onClick={() => {
              if (progress >= 100) {
                handleSumbit();
              } else {
                toast.error("Take a break of 10 minutes before you continue");
              }
            }}
            className="bg-primary/10 w-16 md:w-24 flex justify-center items-center rounded-r p-4 text-2xl"
          >
            <Check size={24} />
          </button>
        </div>
        <small className="text-muted-foreground flex gap-2 justify-start items-center">
          <Info size={14} /> 1 glass of water = 250ml
        </small>
      </div>
    </div>
  );
}
