import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";
import { ThemeToggle } from "./theme-toggle";

export function Navbar() {
  return (
    <header className="w-full">
      <nav className="pr-4 pt-4">
        <ul className="flex gap-2 w-full justify-between">
          <div className="flex gap-4">
            <li>
              <a href="/">
                <img alt="logo" className="w-12 rounded-full" src="/logo.png" />
              </a>
            </li>
          </div>

          <div className="flex gap-4 justify-center items-center">
            <ThemeToggle />
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </ul>
      </nav>
    </header>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col w-full h-full max-w-[700px]">
      <Navbar />
      <main className="flex flex-col w-full h-full">
        <div className="flex flex-col w-full h-full">
          <div className="w-full h-full p-4">{children}</div>
        </div>
      </main>
    </div>
  );
}
