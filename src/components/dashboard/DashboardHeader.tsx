import { Sun, Moon, Download, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface Props {
  lastUpdated: Date;
  isDark: boolean;
  onToggleTheme: () => void;
  onDownloadCSV: () => void;
}

export function DashboardHeader({ lastUpdated, isDark, onToggleTheme, onDownloadCSV }: Props) {
  return (
    <header className="h-14 flex items-center justify-between border-b border-border/50 px-4 bg-card/50 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground" />
        <div className="flex items-center gap-2">
          <div className="relative flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-aqi-good opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-aqi-good" />
            </span>
            <span className="text-xs font-medium text-aqi-good flex items-center gap-1">
              <Radio className="h-3 w-3" /> Live Data
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground font-mono hidden sm:block">
          {lastUpdated.toLocaleTimeString()}
        </span>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={onDownloadCSV} title="Download CSV">
          <Download className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={onToggleTheme}>
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
    </header>
  );
}
