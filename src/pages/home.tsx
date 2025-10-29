import GlassCounter from "@/components/glass-counter";
import SettingsAndBadge from "@/components/settings-badge";
import Streak from "@/components/streak-counter";
import WaterProgressBar from "@/components/water-progress";
import { X, Check, GlassWater } from "lucide-react";
import { useState, useEffect } from "react";
import { getTodayProgress, getWeeklyStats, getWaterLogsByDate, getDailyStats, type WaterLog, type DailyStats } from "@/lib/db";

const findWatToDisplay = (d: string, streak: boolean) => {
  const date = new Date(d);
  const now = new Date();

  if (date.getDate() === now.getDate()) {
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

const DayCard = ({
  streak,
  date,
  isSelected,
  onClick
}: {
  streak: boolean;
  date: string;
  isSelected: boolean;
  onClick: () => void;
}) => {
  const day = new Date(date).toLocaleDateString("en-US", { weekday: "short" });
  const isToday = new Date(date).toDateString() === new Date().toDateString();

  return (
    <div
      onClick={onClick}
      className={`flex flex-col text-xs md:text-base justify-center items-center gap-2 p-2 md:p-4 cursor-pointer transition-colors ${isSelected
        ? "border-primary border-2 rounded bg-primary/20"
        : isToday
          ? "border-primary border rounded bg-primary/5"
          : "hover:bg-muted/50 rounded"
        }`}
    >
      <p className="font-semibold">{day}</p>
      <span>{findWatToDisplay(date, streak)}</span>
    </div>
  );
};

// const WaterLogsList = ({ logs, date }: { logs: WaterLog[]; date: string }) => {
//   const formatTime = (timestamp: number) => {
//     return new Date(timestamp).toLocaleTimeString("en-US", {
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   const formatDate = (dateStr: string) => {
//     const date = new Date(dateStr);
//     const today = new Date();
//     const yesterday = new Date(today);
//     yesterday.setDate(today.getDate() - 1);

//     if (date.toDateString() === today.toDateString()) {
//       return "Today";
//     } else if (date.toDateString() === yesterday.toDateString()) {
//       return "Yesterday";
//     } else {
//       return date.toLocaleDateString("en-US", {
//         weekday: "long",
//         month: "short",
//         day: "numeric"
//       });
//     }
//   };

//   if (logs.length === 0) {
//     return (
//       <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
//         <Droplets size={48} className="mb-2 opacity-50" />
//         <p className="text-sm">No water logged for {formatDate(date)}</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-3">
//       <h3 className="font-semibold text-lg">Water Logs - {formatDate(date)}</h3>
//       <div className="space-y-2 max-h-40 overflow-y-auto">
//         {logs.map((log) => (
//           <div
//             key={log.id}
//             className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
//           >
//             <div className="flex items-center gap-3">
//               <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
//                 <Droplets size={16} className="text-blue-600 dark:text-blue-400" />
//               </div>
//               <div>
//                 <p className="font-medium">
//                   {log.glasses} {log.glasses === 1 ? "glass" : "glasses"}
//                 </p>
//                 <p className="text-sm text-muted-foreground">
//                   {log.quantity}ml total
//                 </p>
//               </div>
//             </div>
//             <div className="flex items-center gap-2 text-sm text-muted-foreground">
//               <Clock size={14} />
//               <span>{formatTime(log.timestamp)}</span>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

export default function Home() {
  const [progress, setProgress] = useState(0);
  const [weeklyStats, setWeeklyStats] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [, setSelectedDateLogs] = useState<WaterLog[]>([]);
  const [, setSelectedDateStats] = useState<DailyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {

      // Get today's progress
      const todayProgress = await getTodayProgress();
      setProgress(todayProgress);

      // Get weekly stats (3 days before today, today, 3 days after today)
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - 3); // 3 days before today
      const startDateStr = startOfWeek.toISOString().split('T')[0];

      const stats = await getWeeklyStats(startDateStr);
      setWeeklyStats(stats);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSelectedDateData = async (date: string) => {
    try {
      const logs = await getWaterLogsByDate(date);
      const stats = await getDailyStats(date);
      setSelectedDateLogs(logs);
      setSelectedDateStats(stats);
      setProgress(stats.progress)
    } catch (error) {
      console.error('Failed to load selected date data:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadSelectedDateData(selectedDate);
  }, [selectedDate]);

  const handleWaterAdded = () => {
    // Refresh data when water is added
    loadData();
    // Refresh selected date data if it's today
    if (selectedDate === new Date().toISOString().split('T')[0]) {
      loadSelectedDateData(selectedDate);
    }
    // Also refresh streak counter
    if ((window as any).refreshStreak) {
      (window as any).refreshStreak();
    }
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-[calc(100vh-96px)] justify-center items-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-96px)] justify-between gap-4">
      <div>
        <div className="flex justify-between w-full items-center">
          <h2>Home</h2>
          <Streak />
        </div>
        <div className="flex w-full justify-between max-w-screen overflow-x-auto gap-1">
          {weeklyStats.map((stat) => (
            <DayCard
              key={stat.date}
              streak={stat.goalAchieved}
              date={stat.date}
              isSelected={stat.date === selectedDate}
              onClick={() => handleDateSelect(stat.date)}
            />
          ))}
        </div>
      </div>

      {/* Selected Date Details */}
      {/* <div className="bg-card border rounded-lg p-4">
        {selectedDateStats && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                {selectedDateStats.totalQuantity}ml / {selectedDateStats.totalGlasses} glasses
              </span>
              <span className={`text-sm px-2 py-1 rounded ${selectedDateStats.goalAchieved
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                }`}>
                {selectedDateStats.goalAchieved ? 'Goal Achieved' : 'Goal Pending'}
              </span>
            </div>
          </div>
        )}
        <WaterLogsList logs={selectedDateLogs} date={selectedDate} />
      </div> */}
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

        <GlassCounter onWaterAdded={handleWaterAdded} />
      </div>
      <SettingsAndBadge />
    </div>
  );
}
