import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
  label: string;
  value: string;
  unit: string;
  icon: LucideIcon;
  colorClass?: string;
  index?: number;
}

export function KPICard({ label, value, unit, icon: Icon, colorClass = "text-primary", index = 0 }: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="kpi-card"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
        <div className={`p-2 rounded-lg bg-secondary ${colorClass}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <motion.div
        key={value}
        initial={{ scale: 1.05, opacity: 0.7 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex items-baseline gap-1"
      >
        <span className={`text-2xl font-bold font-mono ${colorClass}`}>{value}</span>
        <span className="text-sm text-muted-foreground">{unit}</span>
      </motion.div>
    </motion.div>
  );
}
