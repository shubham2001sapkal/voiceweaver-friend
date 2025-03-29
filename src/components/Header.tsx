
import { CodeSquare } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="py-4 px-6 w-full border-b border-border/40 bg-secondary/30 backdrop-blur-sm">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
            <CodeSquare className="h-6 w-6 text-voiceback-500" />
            <span className="font-bold text-lg bg-gradient-to-r from-voiceback-500 to-voiceback-400 bg-clip-text text-transparent tracking-tight">
              Knoxed CreatiCode
            </span>
          </div>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
