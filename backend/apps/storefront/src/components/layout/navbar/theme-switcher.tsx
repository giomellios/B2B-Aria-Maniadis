"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/design-system";
import { useT } from "@/lib/i18n/provider";

const subscribeNoop = () => () => {};

export function ThemeSwitcher() {
  // The theme is only known on the client: render a placeholder on the server and during hydration.
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );
  const { theme, setTheme } = useTheme();
  const t = useT();

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Sun className="size-5" strokeWidth={1.5} />
        <span className="sr-only">{t.nav.toggleTheme}</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun
            className="size-5 rotate-0 scale-100 transition-transform duration-500 ease-out dark:-rotate-90 dark:scale-0"
            strokeWidth={1.5}
          />
          <Moon
            className="absolute size-5 rotate-90 scale-0 transition-transform duration-500 ease-out dark:rotate-0 dark:scale-100"
            strokeWidth={1.5}
          />
          <span className="sr-only">{t.nav.toggleTheme}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="size-4" />
          <span>{t.nav.themeLight}</span>
          {theme === "light" && <span className="ml-auto text-xs">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="size-4" />
          <span>{t.nav.themeDark}</span>
          {theme === "dark" && <span className="ml-auto text-xs">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor className="size-4" />
          <span>{t.nav.themeSystem}</span>
          {theme === "system" && <span className="ml-auto text-xs">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
