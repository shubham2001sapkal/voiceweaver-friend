
import { CodeSquare, Mic } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="py-4 px-6 w-full">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <CodeSquare className="h-4 w-4" />
            <code className="text-xs">{'{/}'}</code> Knoxed CreatiCode
          </div>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
