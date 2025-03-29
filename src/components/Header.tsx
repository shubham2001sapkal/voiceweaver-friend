
import { CodeSquare } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="py-4 px-6 w-full">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <CodeSquare className="h-5 w-5 text-primary" />
            <span className="font-bold text-base bg-gradient-to-r from-primary to-voiceback-400 bg-clip-text text-transparent">
              Knoxed CreatiCode
            </span>
          </div>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
