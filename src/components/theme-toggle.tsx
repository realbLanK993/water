import { Monitor, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "./provider";
import { Button } from "./ui/button";

// A simple dropdown-style button to toggle the theme
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="relative">
      <Button
        className="rounded-full"
        size={"icon"}
        variant={"outline"}
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      >
        {theme === "light" ? (
          <SunIcon />
        ) : theme === "dark" ? (
          <MoonIcon />
        ) : (
          <Monitor />
        )}
      </Button>
    </div>
  );
}
