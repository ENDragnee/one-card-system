"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Prevent SSR mismatch

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "rounded-full justify-center text-[#7c818c] md:m-3 mt-2 ml-1",
      )}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? (
        <Moon className="h-7 w-7 md:hover:text-[#eaeff9]" />
      ) : (
        <Sun className="h-7 w-7 hover:text-[#545d75]" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
