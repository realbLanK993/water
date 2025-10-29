import RootLayout from "./components/layout";
import { Button } from "./components/ui/button";
import Home from "./pages/home";
import SettingsPage from "./pages/settings";
import { useEffect } from "react";
import { requestNotificationPermission, initializeReminders } from "./lib/notifications";

const routes = [
  { path: "/", element: <Home /> },
  { path: "/settings", element: <SettingsPage /> },
];

const NotFound = () => {
  return (
    <div className="flex flex-col gap-2 justify-center items-center min-h-[calc(100vh-96px)] w-full h-full">
      <p className="text-8xl font-bold ">404</p>
      <p>Page not found</p>
      <img src="/logo.png" />

      <Button variant={"link"} onClick={() => (window.location.href = "/")}>
        Go Home
      </Button>
    </div>
  );
};

export default function App() {
  const pathname = window.location.pathname;

  useEffect(() => {
    // Initialize notifications when app starts
    const initNotifications = async () => {
      const hasPermission = await requestNotificationPermission();
      if (hasPermission) {
        await initializeReminders();
      }
    };

    initNotifications();
  }, []);

  return (
    <RootLayout>
      {routes.find((route) => route.path === pathname) ? (
        routes.find((route) => route.path === pathname)!.element
      ) : (
        <NotFound />
      )}
    </RootLayout>
  );
}
