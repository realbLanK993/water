import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h3>Settings</h3>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label>Unit of a glass of water</Label>
          <Input type="number" />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Water goal/day</Label>
          <Input type="number" />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Water goal/month</Label>
          <Input type="number" />
        </div>
      </div>
    </div>
  );
}
