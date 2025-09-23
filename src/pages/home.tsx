import GlassCounter from "@/components/glass-counter";
import SettingsAndBadge from "@/components/settings-badge";
import Streak from "@/components/streak-counter";
import WaterProgressBar from "@/components/water-progress";
import { X, Check, GlassWater } from "lucide-react";

const findWatToDisplay = (d: string, streak: boolean) => {
  const date = new Date(d).getDate();
  const now = new Date().getDate();

  if (date === now) {
    return <GlassWater />;
  }
  if (date < now) {
    if (streak) {
      return <Check size={15} />;
    }
    return <X size={15} />;
  }
  if (date > now) {
    return new Date(d).toLocaleDateString("en-US", { day: "numeric" });
  }
};

const DayCard = ({ streak, date }: { streak: boolean; date: string }) => {
  const day = new Date(date).toLocaleDateString("en-US", { weekday: "short" });
  return (
    <div
      className={`flex flex-col text-xs md:text-base justify-center items-center gap-2 p-2 md:p-4 ${
        new Date(date).getDay() === new Date().getDay()
          ? "border-primary border rounded bg-primary/5"
          : ""
      }`}
    >
      <p className="font-semibold">{day}</p>
      <span>{findWatToDisplay(date, streak)}</span>
    </div>
  );
};

export default function Home() {
  const progress = 41;
  let time = new Date().getTime() - 1000 * 60 * 9;
  return (
    <div className="flex flex-col min-h-[calc(100vh-96px)] justify-between gap-4">
      <div>
        <div className="flex justify-between w-full items-center">
          <h2>Home</h2>
          <Streak />
        </div>
        <div className="flex w-full justify-between max-w-screen">
          <DayCard streak={true} date="2025-09-21" />
        </div>
      </div>
      <div>
        <div className="w-full flex justify-center items-center p-8">
          <WaterProgressBar size={200} progress={progress}>
            <div className="flex justify-center items-end">
              <p
                style={{ fontSize: "3rem" }}
                className="font-semibold text-background"
              >
                {progress}
              </p>
              <small className="font-semibold text-background pb-4">%</small>
            </div>
          </WaterProgressBar>
        </div>

        <GlassCounter time={time} />
      </div>
      <SettingsAndBadge />
    </div>
  );
}
