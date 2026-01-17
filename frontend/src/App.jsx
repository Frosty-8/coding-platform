import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import ProblemSolver from "./components/ProblemSolver";

export default function App() {
  // Try to respect system preference on first load
  const [dark, setDark] = useState(() => {
    if (localStorage.theme === "dark") return true;
    if (localStorage.theme === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Persist theme preference & apply to document
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
    }
  }, [dark]);

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left - Brand */}
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-md bg-primary/90 flex items-center justify-center text-primary-foreground font-bold text-lg">
              DS
            </div>
            <h1 className="text-lg font-semibold tracking-tight hidden sm:block">
              DSA Practice Platform
            </h1>
          </div>

          {/* Right - Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDark(!dark)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent transition-colors"
              aria-label="Toggle dark mode"
            >
              {dark ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            {/* Optional future additions */}
            {/* <button className="text-sm text-muted-foreground hover:text-foreground">
              Sign In
            </button> */}
            {/* <button className="px-4 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90">
              Start Practice
            </button> */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <ProblemSolver dark={dark} />
      </main>
    </div>
  );
}