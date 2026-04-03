import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { PuneMapFixed } from "@/components/dashboard/PuneMapFixed";
import { useTheme } from "@/hooks/useTheme";

const MapDashboard = () => {
  const { isDark, toggle } = useTheme();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <DashboardHeader
            lastUpdated={new Date()}
            isDark={isDark}
            onToggleTheme={toggle}
            onDownloadCSV={() => {}}
          />
          <main className="flex-1 overflow-auto p-4 md:p-6 flex flex-col items-center">
            <div className="w-full h-full max-w-[1600px] flex flex-col" style={{ minHeight: 'calc(100vh - 120px)' }}>
              <div className="mb-4">
                <h2 className="text-2xl font-bold tracking-tight">Pune Geospatial Monitor</h2>
                <p className="text-muted-foreground">Live visualization of sensor fleet data across Pune, India.</p>
              </div>
              <div className="flex-1 min-h-[500px]">
                <PuneMapFixed />
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MapDashboard;
