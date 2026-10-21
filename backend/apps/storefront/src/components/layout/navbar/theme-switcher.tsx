"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Check, Moon, Sun, Monitor } from "@/design-system/icons";
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
        <Sun className="size-5" />
        <span className="sr-only">{t.nav.toggleTheme}</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="size-5 rotate-0 scale-100 opacity-100 transition-[transform,opacity] duration-500 ease-out dark:-rotate-90 dark:scale-75 dark:opacity-0" />
          <Moon className="absolute size-5 rotate-90 scale-75 opacity-0 transition-[transform,opacity] duration-500 ease-out dark:rotate-0 dark:scale-100 dark:opacity-100" />
          <span className="sr-only">{t.nav.toggleTheme}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="size-4" />
          <span>{t.nav.themeLight}</span>
          {theme === "light" && <Check className="ml-auto size-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="size-4" />
          <span>{t.nav.themeDark}</span>
          {theme === "dark" && <Check className="ml-auto size-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor className="size-4" />
          <span>{t.nav.themeSystem}</span>
          {theme === "system" && <Check className="ml-auto size-4" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
