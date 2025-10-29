import { Flame } from "lucide-react";
import { useState, useEffect } from "react";
import { getCurrentStreak } from "@/lib/db";

export default function Streak() {
  const [streak, setStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStreak();
  }, []);

  const loadStreak = async () => {
    try {
      const currentStreak = await getCurrentStreak();
      setStreak(currentStreak);
    } catch (error) {
      console.error('Failed to load streak:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Expose refresh function for parent components
  useEffect(() => {
    (window as any).refreshStreak = loadStreak;
    return () => {
      delete (window as any).refreshStreak;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-between">
        <div className="flex gap-2 justify-center items-center">
          <Flame size={20} fill="orange" stroke="orange" />
          <span className="text-xl font-bold">...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-between">
      <div className="flex gap-2 justify-center items-center">
        <Flame size={20} fill="orange" stroke="orange" />
        <span className="text-xl font-bold">{streak}</span>
      </div>
    </div>
  );
}
