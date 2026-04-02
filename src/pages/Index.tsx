import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { KPICard } from "@/components/dashboard/KPICard";
import { AQIStatusPanel } from "@/components/dashboard/AQIStatusPanel";
import { SensorDetailsPanel } from "@/components/dashboard/SensorDetailsPanel";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { AQITrendChart, TempHumidityChart, GasLevelChart, DustChart } from "@/components/dashboard/Charts";
import { LoadingSkeleton } from "@/components/dashboard/LoadingSkeleton";
import { useAirQualityData, getAQICategory } from "@/hooks/useAirQualityData";
import { useTheme } from "@/hooks/useTheme";
import { Wind, Thermometer, Droplets, Flame, CloudFog } from "lucide-react";

const Index = () => {
  const { latest, history, loading, error, lastUpdated, alerts, downloadCSV } = useAirQualityData();
  const { isDark, toggle } = useTheme();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <DashboardHeader
            lastUpdated={lastUpdated}
            isDark={isDark}
            onToggleTheme={toggle}
            onDownloadCSV={downloadCSV}
          />
          <main className="flex-1 overflow-auto">
            {loading ? (
              <LoadingSkeleton />
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-destructive">{error}</p>
              </div>
            ) : latest ? (
              <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto">
                {/* KPI Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <KPICard label="Air Quality" value={Math.round(latest.aqi).toString()} unit="AQI" icon={Wind} colorClass={getAQICategory(latest.aqi).color} index={0} />
                  <KPICard label="Temperature" value={latest.temperature.toFixed(1)} unit="°C" icon={Thermometer} colorClass="text-chart-4" index={1} />
                  <KPICard label="Humidity" value={latest.humidity.toFixed(1)} unit="%" icon={Droplets} colorClass="text-chart-2" index={2} />
                  <KPICard label="Gas Level" value={Math.round(latest.gasLevel).toString()} unit="ppm" icon={Flame} colorClass="text-chart-3" index={3} />
                  <KPICard label="Dust PM" value={latest.dustPM.toFixed(1)} unit="µg/m³" icon={CloudFog} colorClass="text-chart-5" index={4} />
                </div>

                {/* Status + Details + Alerts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <AQIStatusPanel aqi={latest.aqi} />
                  <SensorDetailsPanel data={latest} />
                  <AlertsPanel alerts={alerts} />
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AQITrendChart data={history} />
                  <TempHumidityChart data={history} />
                  <GasLevelChart data={history} />
                  <DustChart data={history} />
                </div>
              </div>
            ) : null}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
