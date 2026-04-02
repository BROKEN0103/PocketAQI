import { motion } from "framer-motion";
import { Cpu } from "lucide-react";
import type { SensorReading } from "@/hooks/useAirQualityData";

const sensors = [
  { key: "dustPM", label: "Dust (PM2.5)", unit: "µg/m³", precision: 1 },
  { key: "gasLevel", label: "Gas (MQ135)", unit: "ppm", precision: 0 },
  { key: "temperature", label: "Temperature", unit: "°C", precision: 1 },
  { key: "humidity", label: "Humidity", unit: "%", precision: 1 },
] as const;

export function SensorDetailsPanel({ data }: { data: SensorReading }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5 space-y-4"
    >
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Cpu className="h-4 w-4" />
        Sensor Details
      </div>
      <div className="space-y-3">
        {sensors.map(s => {
          const val = data[s.key];
          return (
            <div key={s.key} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <span className="font-mono text-sm font-semibold text-foreground">
                {val.toFixed(s.precision)} <span className="text-xs text-muted-foreground">{s.unit}</span>
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
