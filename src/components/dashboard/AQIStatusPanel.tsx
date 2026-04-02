import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { getAQICategory, getAQIBgClass } from "@/hooks/useAirQualityData";

export function AQIStatusPanel({ aqi }: { aqi: number }) {
  const category = getAQICategory(aqi);
  const bgClass = getAQIBgClass(aqi);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-5 space-y-4"
    >
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Shield className="h-4 w-4" />
        AQI Status
      </div>
      <div className="flex items-center gap-4">
        <motion.div
          key={Math.round(aqi)}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className={`${bgClass} text-primary-foreground rounded-xl px-5 py-3 text-center min-w-[80px]`}
        >
          <div className="text-3xl font-bold font-mono">{Math.round(aqi)}</div>
          <div className="text-xs font-semibold mt-1">{category.label}</div>
        </motion.div>
        <div className="flex-1">
          <div className="flex gap-1 mb-3">
            {["good", "moderate", "bad", "very-bad", "hazardous"].map((level, i) => (
              <div
                key={level}
                className={`h-1.5 flex-1 rounded-full bg-aqi-${level} ${
                  i <= [50, 100, 200, 300, 500].findIndex(t => aqi <= t) ? "opacity-100" : "opacity-20"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{category.suggestion}</p>
        </div>
      </div>
    </motion.div>
  );
}
