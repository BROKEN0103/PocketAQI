import { useState, useMemo } from "react";
import { format } from "date-fns";
import { CalendarIcon, TrendingUp, TrendingDown, Minus, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useAirQualityData, SensorReading } from "@/hooks/useAirQualityData";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend,
} from "recharts";

function StatCard({ label, value, unit, trend, index = 0 }: {
  label: string; value: string; unit: string; trend?: "up" | "down" | "flat"; index?: number;
}) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "text-aqi-bad" : trend === "down" ? "text-aqi-good" : "text-muted-foreground";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="glass-card p-5"
    >
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-foreground font-mono">{value}</span>
        <span className="text-xs text-muted-foreground mb-1">{unit}</span>
        {trend && <TrendIcon className={cn("h-4 w-4 ml-auto", trendColor)} />}
      </div>
    </motion.div>
  );
}

function computeStats(data: SensorReading[]) {
  if (data.length === 0) return null;
  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const min = (arr: number[]) => Math.min(...arr);
  const max = (arr: number[]) => Math.max(...arr);

  const aqis = data.map(d => d.aqi);
  const temps = data.map(d => d.temperature);
  const hums = data.map(d => d.humidity);
  const gas = data.map(d => d.gasLevel);
  const dust = data.map(d => d.dustPM);

  const trend = (arr: number[]): "up" | "down" | "flat" => {
    if (arr.length < 2) return "flat";
    const first = avg(arr.slice(0, Math.floor(arr.length / 2)));
    const second = avg(arr.slice(Math.floor(arr.length / 2)));
    const diff = (second - first) / (first || 1);
    if (diff > 0.05) return "up";
    if (diff < -0.05) return "down";
    return "flat";
  };

  return {
    aqi: { avg: avg(aqis), min: min(aqis), max: max(aqis), trend: trend(aqis) },
    temp: { avg: avg(temps), min: min(temps), max: max(temps), trend: trend(temps) },
    humidity: { avg: avg(hums), min: min(hums), max: max(hums), trend: trend(hums) },
    gas: { avg: avg(gas), min: min(gas), max: max(gas), trend: trend(gas) },
    dust: { avg: avg(dust), min: min(dust), max: max(dust), trend: trend(dust) },
  };
}

const Analytics = () => {
  const { history, loading, lastUpdated, downloadCSV } = useAirQualityData();
  const { isDark, toggle } = useTheme();
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();

  const filtered = useMemo(() => {
    return history.filter(r => {
      const t = new Date(r.timestamp);
      if (dateFrom && t < dateFrom) return false;
      if (dateTo && t > new Date(dateTo.getTime() + 86400000)) return false;
      return true;
    });
  }, [history, dateFrom, dateTo]);

  const stats = useMemo(() => computeStats(filtered), [filtered]);

  const chartData = useMemo(() =>
    filtered.map(r => ({
      time: new Date(r.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      aqi: +r.aqi.toFixed(1),
      temperature: +r.temperature.toFixed(1),
      humidity: +r.humidity.toFixed(1),
      gas: +r.gasLevel.toFixed(1),
      dust: +r.dustPM.toFixed(1),
    })), [filtered]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <DashboardHeader lastUpdated={lastUpdated} isDark={isDark} onToggleTheme={toggle} onDownloadCSV={downloadCSV} />
          <main className="flex-1 overflow-auto">
            <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto">
              {/* Page title + filters */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <h1 className="text-xl font-bold text-foreground">Analytics</h1>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-[160px] justify-start text-left text-sm", !dateFrom && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFrom ? format(dateFrom, "MMM dd") : "From"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-[160px] justify-start text-left text-sm", !dateTo && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateTo ? format(dateTo, "MMM dd") : "To"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                  {(dateFrom || dateTo) && (
                    <Button variant="ghost" size="sm" onClick={() => { setDateFrom(undefined); setDateTo(undefined); }}>Clear</Button>
                  )}
                </div>
              </div>

              {loading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : stats ? (
                <>
                  {/* Summary stats */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <StatCard label="Avg AQI" value={stats.aqi.avg.toFixed(0)} unit="AQI" trend={stats.aqi.trend} index={0} />
                    <StatCard label="Avg Temp" value={stats.temp.avg.toFixed(1)} unit="°C" trend={stats.temp.trend} index={1} />
                    <StatCard label="Avg Humidity" value={stats.humidity.avg.toFixed(1)} unit="%" trend={stats.humidity.trend} index={2} />
                    <StatCard label="Avg Gas" value={stats.gas.avg.toFixed(0)} unit="ppm" trend={stats.gas.trend} index={3} />
                    <StatCard label="Avg Dust" value={stats.dust.avg.toFixed(1)} unit="µg/m³" trend={stats.dust.trend} index={4} />
                  </div>

                  {/* Min/Max table */}
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/50">
                          <th className="text-left p-3 text-muted-foreground font-medium">Metric</th>
                          <th className="text-right p-3 text-muted-foreground font-medium">Min</th>
                          <th className="text-right p-3 text-muted-foreground font-medium">Max</th>
                          <th className="text-right p-3 text-muted-foreground font-medium">Range</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { label: "AQI", ...stats.aqi, u: "" },
                          { label: "Temperature", ...stats.temp, u: "°C" },
                          { label: "Humidity", ...stats.humidity, u: "%" },
                          { label: "Gas Level", ...stats.gas, u: "ppm" },
                          { label: "Dust PM", ...stats.dust, u: "µg/m³" },
                        ].map(row => (
                          <tr key={row.label} className="border-b border-border/30 last:border-0">
                            <td className="p-3 font-medium text-foreground">{row.label}</td>
                            <td className="p-3 text-right font-mono text-aqi-good">{row.min.toFixed(1)}{row.u}</td>
                            <td className="p-3 text-right font-mono text-aqi-bad">{row.max.toFixed(1)}{row.u}</td>
                            <td className="p-3 text-right font-mono text-muted-foreground">{(row.max - row.min).toFixed(1)}{row.u}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </motion.div>

                  {/* Charts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
                      <h3 className="text-sm font-medium text-muted-foreground mb-4">AQI Distribution</h3>
                      <div className="h-[250px]">
                        <ResponsiveContainer>
                          <AreaChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                            <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                            <Area type="monotone" dataKey="aqi" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1) / 0.2)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5">
                      <h3 className="text-sm font-medium text-muted-foreground mb-4">Environmental Comparison</h3>
                      <div className="h-[250px]">
                        <ResponsiveContainer>
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                            <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                            <Legend />
                            <Line type="monotone" dataKey="temperature" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="humidity" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5">
                      <h3 className="text-sm font-medium text-muted-foreground mb-4">Gas & Dust Levels</h3>
                      <div className="h-[250px]">
                        <ResponsiveContainer>
                          <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                            <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                            <Legend />
                            <Bar dataKey="gas" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="dust" fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-5">
                      <h3 className="text-sm font-medium text-muted-foreground mb-4">Data Points</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Total readings</span>
                          <span className="font-mono text-foreground">{filtered.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Time span</span>
                          <span className="font-mono text-foreground">
                            {filtered.length > 1
                              ? `${Math.round((new Date(filtered[filtered.length - 1].timestamp).getTime() - new Date(filtered[0].timestamp).getTime()) / 60000)} min`
                              : "—"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Peak AQI time</span>
                          <span className="font-mono text-foreground">
                            {filtered.length > 0
                              ? new Date(filtered.reduce((a, b) => a.aqi > b.aqi ? a : b).timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                              : "—"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">AQI {'>'} 100 readings</span>
                          <span className="font-mono text-foreground">{filtered.filter(r => r.aqi > 100).length}</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">No data available for the selected range.</p>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Analytics;
