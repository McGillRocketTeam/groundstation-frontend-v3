import { Moon, Sun } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useTheme } from "../ThemeProvider";
import { capitalize } from "lodash";

export default function SettingsThemeSection() {
  const { theme, setTheme } = useTheme();
  return (
    <section className="space-y-4">
      <h2>Theme Selector</h2>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="w-full text-left justify-start" variant="outline">
            <Moon className="size-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0 not-dark:hidden" />
            <Sun className="size-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90 dark:hidden" />
            {capitalize(theme)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => setTheme("light")}>
            Light
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")}>
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("system")}>
            System
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </section>
  );
}
