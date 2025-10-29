import { Check, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { addWaterLog, getSettings, getLastIntakeTime, getDailyStats, getCurrentStreak } from "@/lib/db";
import { showGoalCompletionNotification, showStreakNotification } from "@/lib/notifications";

export default function GlassCounter({ onWaterAdded }: { onWaterAdded?: () => void }) {
  const [count, setCount] = useState(1);
  const [glassSize, setGlassSize] = useState(250);
  const [selectedQuantity, setSelectedQuantity] = useState(250);
  const [lastIntakeTime, setLastIntakeTime] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load settings and last intake time on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const settings = await getSettings();
        setGlassSize(settings.glassSize);
        setSelectedQuantity(settings.glassSize);

        const lastTime = await getLastIntakeTime();
        setLastIntakeTime(lastTime);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };

    loadData();
  }, []);

  // Calculate cooldown progress
  const getCooldownProgress = () => {
    // Skip cooldown in development mode
    if (import.meta.env.DEV) return 100;

    if (!lastIntakeTime) return 100;
    const diff = new Date().getTime() - lastIntakeTime;
    return Math.min(100, (diff / (10 * 60 * 1000)) * 100);
  };

  const handleSubmit = async () => {
    if (isLoading) return;

    const progress = getCooldownProgress();
    if (progress < 100) {
      toast.error("Take a break of 10 minutes before you continue");
      return;
    }

    setIsLoading(true);
    try {
      await addWaterLog(count, selectedQuantity);
      toast.success(`Added ${count} ${count === 1 ? 'glass' : 'glasses'} of water (${selectedQuantity * count}ml)!`);
      setCount(1);
      setLastIntakeTime(Date.now());

      // Check if daily goal is achieved and show notification
      const today = new Date().toISOString().split('T')[0];
      const dailyStats = await getDailyStats(today);

      if (dailyStats.goalAchieved) {
        await showGoalCompletionNotification();

        // Check for streak milestones
        const streak = await getCurrentStreak();
        if (streak > 0 && streak % 7 === 0) { // Show notification every 7 days
          await showStreakNotification(streak);
        }
      }

      // Notify parent component to refresh data
      if (onWaterAdded) {
        onWaterAdded();
      }
    } catch (error) {
      console.error('Failed to add water log:', error);
      toast.error("Failed to add water log. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  const quantityOptions = [100, 150, 200, glassSize];

  return (
    <div className="flex flex-col gap-4 justify-center items-center">
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
            onClick={handleSubmit}
            disabled={isLoading}
            className={`bg-primary/10 w-16 md:w-24 flex justify-center items-center rounded-r p-4 text-2xl ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
          >
            <Check size={24} />
          </button>
        </div>
      </div>

      {/* Quantity Selection Toggle Boxes */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2 justify-between w-full">
          {quantityOptions.map((quantity) => (
            <button
              key={quantity}
              onClick={() => setSelectedQuantity(quantity)}
              className={`px-3 py-2 text-sm font-medium transition-colors ${selectedQuantity === quantity
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
                }`}
            >
              {quantity}ml
            </button>
          ))}
        </div>
        <small className="text-muted-foreground text-center">
          Total: {selectedQuantity * count}ml
        </small>
      </div>
    </div>
  );
}
