import { SignedIn, SignedOut, useClerk } from "@clerk/clerk-react";
import { createContext, useContext, useEffect, useState } from "react";
import { Button } from "./ui/button";
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const clerk = useClerk();
  return (
    <>
      <SignedOut>
        <div className="flex flex-col gap-4 justify-center items-center min-h-[70vh]">
          <h2>You are not signed in</h2>
          <Button
            onClick={() =>
              clerk.openSignIn({
                redirectUrl: window.location.href,
              })
            }
          >
            Sign in
          </Button>
        </div>
      </SignedOut>
      <SignedIn>{children}</SignedIn>
    </>
  );
}

// Define the shape of the context's value
type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

// Define the possible theme values
type Theme = "dark" | "light" | "system";

// Create the context with a default value
const ThemeProviderContext = createContext<ThemeProviderState | undefined>(
  undefined
);

// The provider component that will wrap your entire application
export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}) {
  // State to hold the current theme. It initializes from localStorage or the default.
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;

    // Remove the previous theme class
    root.classList.remove("light", "dark");

    // If the theme is 'system', determine the theme based on user's OS preference
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      return;
    }

    // Add the selected theme class to the root element
    root.classList.add(theme);
  }, [theme]);

  // The value to be provided by the context
  const value = {
    theme,
    // A function to update both the state and localStorage
    setTheme: (newTheme: Theme) => {
      localStorage.setItem(storageKey, newTheme);
      setTheme(newTheme);
    },
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

// Custom hook to easily access the theme context
export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
