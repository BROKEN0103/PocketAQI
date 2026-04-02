import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import type { SensorReading } from "@/hooks/useAirQualityData";
import { ChartCard } from "./ChartCard";

function formatTime(ts: string) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const commonAxisProps = {
  stroke: "hsl(var(--muted-foreground))",
  fontSize: 11,
  tickLine: false,
  axisLine: false,
};

const gridProps = {
  strokeDasharray: "3 3",
  stroke: "hsl(var(--border))",
};

export function AQITrendChart({ data }: { data: SensorReading[] }) {
  return (
    <ChartCard title="AQI Trend" index={0}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="timestamp" tickFormatter={formatTime} {...commonAxisProps} />
          <YAxis {...commonAxisProps} />
          <Tooltip
            contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
            labelFormatter={formatTime}
          />
          <Line type="monotone" dataKey="aqi" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} name="AQI" />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function TempHumidityChart({ data }: { data: SensorReading[] }) {
  return (
    <ChartCard title="Temperature vs Humidity" index={1}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="timestamp" tickFormatter={formatTime} {...commonAxisProps} />
          <YAxis {...commonAxisProps} />
          <Tooltip
            contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
            labelFormatter={formatTime}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line type="monotone" dataKey="temperature" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={false} name="Temp °C" />
          <Line type="monotone" dataKey="humidity" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} name="Humidity %" />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function GasLevelChart({ data }: { data: SensorReading[] }) {
  return (
    <ChartCard title="Gas Level Variation" index={2}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="timestamp" tickFormatter={formatTime} {...commonAxisProps} />
          <YAxis {...commonAxisProps} />
          <Tooltip
            contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
            labelFormatter={formatTime}
          />
          <Area type="monotone" dataKey="gasLevel" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3) / 0.2)" strokeWidth={2} name="Gas ppm" />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function DustChart({ data }: { data: SensorReading[] }) {
  const last12 = data.slice(-12);
  return (
    <ChartCard title="Dust Concentration (PM)" index={3}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={last12}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="timestamp" tickFormatter={formatTime} {...commonAxisProps} />
          <YAxis {...commonAxisProps} />
          <Tooltip
            contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
            labelFormatter={formatTime}
          />
          <Bar dataKey="dustPM" fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} name="PM µg/m³" />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
