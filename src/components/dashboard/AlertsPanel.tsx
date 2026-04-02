import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export function AlertsPanel({ alerts }: { alerts: string[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5 space-y-3"
    >
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <AlertTriangle className="h-4 w-4" />
        Alerts
      </div>
      <AnimatePresence mode="sync">
        {alerts.length === 0 ? (
          <motion.div
            key="no-alerts"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-sm text-aqi-good py-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            All parameters within safe limits
          </motion.div>
        ) : (
          alerts.map((alert, i) => (
            <motion.div
              key={alert}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2"
            >
              {alert}
            </motion.div>
          ))
        )}
      </AnimatePresence>
    </motion.div>
  );
}
