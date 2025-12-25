import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ThemeToggle = ({ className = "" }: { className?: string }) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Set default to light if system theme
    if (theme === "system") {
      setTheme("light");
    }
  }, [theme, setTheme]);

  if (!mounted) {
    return (
      <div className={`h-9 w-16 rounded-full bg-muted animate-pulse ${className}`} />
    );
  }

  const isDark = theme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className={`relative h-9 w-16 rounded-full bg-muted/80 border border-border/50 transition-all duration-300 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/20 ${className}`}
      aria-label="Toggle theme"
    >
      {/* Toggle indicator */}
      <div
        className={`absolute top-1 left-1 h-7 w-7 rounded-full bg-background border border-border shadow-sm transition-all duration-300 flex items-center justify-center ${
          isDark ? "translate-x-7" : "translate-x-0"
        }`}
      >
        <Sun
          className={`h-4 w-4 transition-all duration-300 ${
            isDark ? "scale-0 opacity-0 rotate-90" : "scale-100 opacity-100 rotate-0"
          }`}
        />
        <Moon
          className={`absolute h-4 w-4 transition-all duration-300 ${
            isDark ? "scale-100 opacity-100 rotate-0" : "scale-0 opacity-0 -rotate-90"
          }`}
        />
      </div>
    </button>
  );
};

export default ThemeToggle;

