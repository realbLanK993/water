import { Settings } from "lucide-react";
import BadgeDrawer from "./badge-drawer";

export default function SettingsAndBadge() {
  return (
    <div className="rounded-full p-4 mb-4 border w-full flex justify-between items-center h-full">
      <BadgeDrawer />

      <a href="/settings" className="flex gap-2 justify-center items-center">
        <Settings size={20} fill="grey" />
        <span className="text-sm font-bold">Settings</span>
      </a>
    </div>
  );
}
