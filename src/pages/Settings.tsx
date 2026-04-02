import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, Bell, Shield, Save, RotateCcw } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useAirQualityData } from "@/hooks/useAirQualityData";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface AlertThresholds {
  aqiWarning: number;
  aqiCritical: number;
  gasWarning: number;
  gasCritical: number;
  dustWarning: number;
  dustCritical: number;
  tempHigh: number;
  tempLow: number;
  humidityHigh: number;
  humidityLow: number;
}

interface NotificationPrefs {
  enableAlerts: boolean;
  soundEnabled: boolean;
  aqiAlerts: boolean;
  gasAlerts: boolean;
  dustAlerts: boolean;
  tempAlerts: boolean;
  humidityAlerts: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
}

const DEFAULT_THRESHOLDS: AlertThresholds = {
  aqiWarning: 100,
  aqiCritical: 200,
  gasWarning: 200,
  gasCritical: 300,
  dustWarning: 100,
  dustCritical: 150,
  tempHigh: 40,
  tempLow: 0,
  humidityHigh: 80,
  humidityLow: 20,
};

const DEFAULT_PREFS: NotificationPrefs = {
  enableAlerts: true,
  soundEnabled: false,
  aqiAlerts: true,
  gasAlerts: true,
  dustAlerts: true,
  tempAlerts: true,
  humidityAlerts: true,
  autoRefresh: true,
  refreshInterval: 5,
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function ThresholdInput({ label, value, onChange, unit, color }: {
  label: string; value: number; onChange: (v: number) => void; unit: string; color?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className={`font-mono text-sm h-9 ${color || ""}`}
        />
        <span className="text-xs text-muted-foreground whitespace-nowrap">{unit}</span>
      </div>
    </div>
  );
}

function NotifToggle({ label, checked, onChange, description }: {
  label: string; checked: boolean; onChange: (v: boolean) => void; description?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

const Settings = () => {
  const { lastUpdated, downloadCSV } = useAirQualityData();
  const { isDark, toggle } = useTheme();

  const [thresholds, setThresholds] = useState<AlertThresholds>(() =>
    loadFromStorage("airq-thresholds", DEFAULT_THRESHOLDS)
  );
  const [prefs, setPrefs] = useState<NotificationPrefs>(() =>
    loadFromStorage("airq-notif-prefs", DEFAULT_PREFS)
  );

  const updateThreshold = (key: keyof AlertThresholds, value: number) => {
    setThresholds(prev => ({ ...prev, [key]: value }));
  };

  const updatePref = (key: keyof NotificationPrefs, value: boolean | number) => {
    setPrefs(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    localStorage.setItem("airq-thresholds", JSON.stringify(thresholds));
    localStorage.setItem("airq-notif-prefs", JSON.stringify(prefs));
    toast.success("Settings saved successfully");
  };

  const handleReset = () => {
    setThresholds(DEFAULT_THRESHOLDS);
    setPrefs(DEFAULT_PREFS);
    localStorage.removeItem("airq-thresholds");
    localStorage.removeItem("airq-notif-prefs");
    toast.info("Settings reset to defaults");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <DashboardHeader lastUpdated={lastUpdated} isDark={isDark} onToggleTheme={toggle} onDownloadCSV={downloadCSV} />
          <main className="flex-1 overflow-auto">
            <div className="p-4 md:p-6 space-y-6 max-w-[900px] mx-auto">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5 text-primary" />
                  <h1 className="text-xl font-bold text-foreground">Settings</h1>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={handleReset}>
                    <RotateCcw className="h-4 w-4 mr-1" /> Reset
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="h-4 w-4 mr-1" /> Save
                  </Button>
                </div>
              </div>

              {/* Alert Thresholds */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 space-y-5">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <h2 className="text-base font-semibold text-foreground">Alert Thresholds</h2>
                </div>
                <p className="text-xs text-muted-foreground">Configure warning and critical levels for each metric.</p>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-foreground mb-3">Air Quality Index</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <ThresholdInput label="Warning Level" value={thresholds.aqiWarning} onChange={v => updateThreshold("aqiWarning", v)} unit="AQI" />
                      <ThresholdInput label="Critical Level" value={thresholds.aqiCritical} onChange={v => updateThreshold("aqiCritical", v)} unit="AQI" />
                    </div>
                  </div>

                  <div className="border-t border-border/50 pt-4">
                    <h3 className="text-sm font-medium text-foreground mb-3">Gas Level</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <ThresholdInput label="Warning Level" value={thresholds.gasWarning} onChange={v => updateThreshold("gasWarning", v)} unit="ppm" />
                      <ThresholdInput label="Critical Level" value={thresholds.gasCritical} onChange={v => updateThreshold("gasCritical", v)} unit="ppm" />
                    </div>
                  </div>

                  <div className="border-t border-border/50 pt-4">
                    <h3 className="text-sm font-medium text-foreground mb-3">Dust Concentration</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <ThresholdInput label="Warning Level" value={thresholds.dustWarning} onChange={v => updateThreshold("dustWarning", v)} unit="µg/m³" />
                      <ThresholdInput label="Critical Level" value={thresholds.dustCritical} onChange={v => updateThreshold("dustCritical", v)} unit="µg/m³" />
                    </div>
                  </div>

                  <div className="border-t border-border/50 pt-4">
                    <h3 className="text-sm font-medium text-foreground mb-3">Temperature</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <ThresholdInput label="High Threshold" value={thresholds.tempHigh} onChange={v => updateThreshold("tempHigh", v)} unit="°C" />
                      <ThresholdInput label="Low Threshold" value={thresholds.tempLow} onChange={v => updateThreshold("tempLow", v)} unit="°C" />
                    </div>
                  </div>

                  <div className="border-t border-border/50 pt-4">
                    <h3 className="text-sm font-medium text-foreground mb-3">Humidity</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <ThresholdInput label="High Threshold" value={thresholds.humidityHigh} onChange={v => updateThreshold("humidityHigh", v)} unit="%" />
                      <ThresholdInput label="Low Threshold" value={thresholds.humidityLow} onChange={v => updateThreshold("humidityLow", v)} unit="%" />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Notification Preferences */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="h-4 w-4 text-primary" />
                  <h2 className="text-base font-semibold text-foreground">Notification Preferences</h2>
                </div>

                <NotifToggle
                  label="Enable Alerts"
                  description="Master switch for all notifications"
                  checked={prefs.enableAlerts}
                  onChange={v => updatePref("enableAlerts", v)}
                />
                <div className="border-t border-border/50" />
                <NotifToggle label="Sound Notifications" description="Play sound on critical alerts" checked={prefs.soundEnabled} onChange={v => updatePref("soundEnabled", v)} />
                <div className="border-t border-border/50" />
                <NotifToggle label="AQI Alerts" checked={prefs.aqiAlerts} onChange={v => updatePref("aqiAlerts", v)} />
                <NotifToggle label="Gas Level Alerts" checked={prefs.gasAlerts} onChange={v => updatePref("gasAlerts", v)} />
                <NotifToggle label="Dust Alerts" checked={prefs.dustAlerts} onChange={v => updatePref("dustAlerts", v)} />
                <NotifToggle label="Temperature Alerts" checked={prefs.tempAlerts} onChange={v => updatePref("tempAlerts", v)} />
                <NotifToggle label="Humidity Alerts" checked={prefs.humidityAlerts} onChange={v => updatePref("humidityAlerts", v)} />

                <div className="border-t border-border/50 pt-4">
                  <NotifToggle label="Auto Refresh" description="Automatically fetch new data" checked={prefs.autoRefresh} onChange={v => updatePref("autoRefresh", v)} />
                  {prefs.autoRefresh && (
                    <div className="mt-2 ml-0">
                      <Label className="text-xs text-muted-foreground">Refresh interval</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          type="number"
                          min={1}
                          max={60}
                          value={prefs.refreshInterval}
                          onChange={e => updatePref("refreshInterval", Number(e.target.value))}
                          className="w-20 font-mono text-sm h-9"
                        />
                        <span className="text-xs text-muted-foreground">seconds</span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Settings;
