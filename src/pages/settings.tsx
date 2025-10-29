import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getSettings, updateSettings } from "@/lib/db";
import { testNotification, startWaterReminders, stopWaterReminders } from "@/lib/notifications";
import InstallPWA from "@/components/install-pwa";

export default function SettingsPage() {
  const [glassSize, setGlassSize] = useState(250);
  const [dailyGoal, setDailyGoal] = useState(2000);
  const [monthlyGoal, setMonthlyGoal] = useState(60000);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [reminderInterval, setReminderInterval] = useState(20);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await getSettings();
      setGlassSize(settings.glassSize || 250);
      setDailyGoal(settings.dailyGoal || 2000);
      setMonthlyGoal(settings.monthlyGoal || 60000);
      setNotificationsEnabled(settings.notificationsEnabled ?? true);
      setReminderInterval(settings.reminderInterval || 20);
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (isSaving) return;

    // Validation
    if (glassSize <= 0) {
      toast.error("Glass size must be greater than 0");
      return;
    }
    if (dailyGoal <= 0) {
      toast.error("Daily goal must be greater than 0");
      return;
    }
    if (monthlyGoal <= 0) {
      toast.error("Monthly goal must be greater than 0");
      return;
    }
    if (reminderInterval <= 0) {
      toast.error("Reminder interval must be greater than 0");
      return;
    }

    setIsSaving(true);
    try {
      await updateSettings({
        glassSize,
        dailyGoal,
        monthlyGoal,
        notificationsEnabled,
        reminderInterval,
      });

      // Update notification reminders based on new settings
      if (notificationsEnabled) {
        startWaterReminders(reminderInterval);
      } else {
        stopWaterReminders();
      }

      toast.success("Settings saved successfully!");
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <h3>Settings</h3>
        <div className="flex justify-center items-center py-8">
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h3>Settings</h3>
        <InstallPWA />
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label>Unit of a glass of water (ml)</Label>
          <Input
            type="number"
            value={glassSize}
            onChange={(e) => setGlassSize(Number(e.target.value))}
            placeholder="250"
            min="1"
          />
          <small className="text-muted-foreground">
            Default: 250ml. This affects how much water is logged per glass.
          </small>
        </div>
        <div className="flex flex-col gap-2">
          <Label>Water goal per day (ml)</Label>
          <Input
            type="number"
            value={dailyGoal}
            onChange={(e) => setDailyGoal(Number(e.target.value))}
            placeholder="2000"
            min="1"
          />
          <small className="text-muted-foreground">
            Recommended: 2000ml (8 glasses of 250ml each)
          </small>
        </div>
        <div className="flex flex-col gap-2">
          <Label>Water goal per month (ml)</Label>
          <Input
            type="number"
            value={monthlyGoal}
            onChange={(e) => setMonthlyGoal(Number(e.target.value))}
            placeholder="60000"
            min="1"
          />
          <small className="text-muted-foreground">
            Recommended: 60000ml (60L per month)
          </small>
        </div>

        {/* Notification Settings */}
        <div className="border-t pt-4 mt-4">
          <h4 className="font-semibold mb-4">Notification Settings</h4>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <Label>Enable Notifications</Label>
                <small className="text-muted-foreground">
                  Get reminders to drink water regularly
                </small>
              </div>
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                className="w-4 h-4"
              />
            </div>

            {notificationsEnabled && (
              <div className="flex flex-col gap-2">
                <Label>Reminder Interval (minutes)</Label>
                <Input
                  type="number"
                  value={reminderInterval}
                  onChange={(e) => setReminderInterval(Number(e.target.value))}
                  placeholder="20"
                  min="1"
                  max="480"
                />
                <small className="text-muted-foreground">
                  How often to remind you to drink water (1-480 minutes)
                </small>
              </div>
            )}

            {notificationsEnabled && (
              <Button
                variant="outline"
                onClick={testNotification}
                className="w-fit"
              >
                Test Notification
              </Button>
            )}
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="mt-4"
        >
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
