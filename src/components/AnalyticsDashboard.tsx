"use client";

import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Users,
  TrendingUp,
  TrendingDown,
  Hourglass
} from "lucide-react";
import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarRadiusAxis,
  Label,
} from "recharts";

const COLORS = {
  teal: "#3FD8D4",
  orange: "#FF8500",
  lime: "#DDEE59",
  red: "#ef4444",
  green: "#22c55e",
  ringBg: "#e5e7eb",
  darkRingBg: "#1f293799",
};

const MAX_BORROWERS = 20000;

export default function AnalyticsKpiRadial() {
  const [range, setRange] = useState<"7d" | "30d" | "90d" | "YTD">("30d");
  const ranges: Array<"7d" | "30d" | "90d" | "YTD"> = ["7d", "30d", "90d", "YTD"];

  type KpiItem = {
    title: string;
    subtitle: string;
    value: number;
    trend: number;
    icon: any;
    color: string;
    unit: string; // "" | "%" | "rb"
  };

  const kpiRanges: Record<typeof range, KpiItem[]> = {
    "7d": [
      { title: "Approve", subtitle: "Total Approved", value: 15, trend: +3.2, icon: CheckCircle2, color: COLORS.teal, unit: "" },
      { title: "Reject", subtitle: "Total Rejected", value: 4, trend: -0.8, icon: XCircle, color: COLORS.orange, unit: "" },
      { title: "Pending", subtitle: "Total Pending", value: 6, trend: +1.5, icon: Hourglass, color: COLORS.lime, unit: "" },
      { title: "Customers", subtitle: "Nasabah Aktif", value: 2500, trend: +1.2, icon: Users, color: COLORS.teal, unit: "rb" },
    ],
    "30d": [
      { title: "Approve", subtitle: "Total Approved", value: 82, trend: +5.2, icon: CheckCircle2, color: COLORS.teal, unit: "" },
      { title: "Reject", subtitle: "Total Rejected", value: 18, trend: -1.4, icon: XCircle, color: COLORS.orange, unit: "" },
      { title: "Pending", subtitle: "Total Pending", value: 27, trend: +3.1, icon: Hourglass, color: COLORS.lime, unit: "" },
      { title: "Customers", subtitle: "Nasabah Aktif", value: 8200, trend: +2.8, icon: Users, color: COLORS.teal, unit: "rb" },
    ],
    "90d": [
      { title: "Approve", subtitle: "Total Approved", value: 210, trend: +7.9, icon: CheckCircle2, color: COLORS.teal, unit: "" },
      { title: "Reject", subtitle: "Total Rejected", value: 45, trend: -2.2, icon: XCircle, color: COLORS.orange, unit: "" },
      { title: "Pending", subtitle: "Total Pending", value: 60, trend: +4.4, icon: Hourglass, color: COLORS.lime, unit: "" },
      { title: "Customers", subtitle: "Nasabah Aktif", value: 15200, trend: +3.4, icon: Users, color: COLORS.teal, unit: "rb" },
    ],
    "YTD": [
      { title: "Credit Analysis", subtitle: "Analisis Kredit", value: 780, trend: +9.8, icon: CheckCircle2, color: COLORS.teal, unit: "" }, // contoh judul agar label “Credit Analysis” muncul
      { title: "Reject", subtitle: "Total Rejected", value: 180, trend: -3.0, icon: XCircle, color: COLORS.orange, unit: "" },
      { title: "Pending", subtitle: "Total Pending", value: 110, trend: +5.5, icon: Hourglass, color: COLORS.lime, unit: "" },
      { title: "Customers", subtitle: "Nasabah Aktif", value: 19300, trend: +4.1, icon: Users, color: COLORS.teal, unit: "rb" },
    ],
  };

  const kpiData = kpiRanges[range];

  return (
    // NEW: bungkus dengan container tanpa padding kiri-kanan agar “Tahap” benar-benar nempel ke batas container
    <section className="w-full mx-auto max-w-7xl px-0 space-y-4">
      {/* NEW: Judul seksi “Tahap” flush-left */}
      <h2 className="text-sm font-semibold tracking-wide uppercase text-gray-500 dark:text-gray-400">
        Tahap
      </h2>

      {/* Toggle range */}
      <div className="flex justify-end">
        <div className="inline-flex border rounded-lg overflow-hidden bg-white/50 dark:bg-neutral-900">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 text-sm font-medium transition-colors ${
                range === r
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpiData.map((item) => (
          <KpiCard key={`${range}-${item.title}`} {...item} />
        ))}
      </div>
    </section>
  );
}

function KpiCard({
  title,
  subtitle,
  value,
  trend,
  icon: Icon,
  color,
  unit,
}: any) {
  const progress =
    unit === "%"
      ? value
      : unit === "rb"
      ? Math.min((value / MAX_BORROWERS) * 100, 100)
      : Math.min(value, 100); // jaga-jaga kalau value > 100

  const chartData = [
    { name: "progress", value: progress, fill: color },
    { name: "remainder", value: 100 - progress, fill: COLORS.darkRingBg },
  ];

  return (
    <div className="relative bg-white dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all duration-200 p-5 flex flex-col items-center">
      {/* Header */}
      <div className="flex w-full items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-gray-400 dark:text-gray-300" />
          <h3
            className="font-medium text-gray-700 dark:text-white"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "20px",
              lineHeight: "1.2",
            }}
          >
            {title}
          </h3>
        </div>

        <div
          className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
            trend >= 0
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {trend >= 0 ? (
            <>
              <TrendingUp className="h-3 w-3" /> {trend}%
            </>
          ) : (
            <>
              <TrendingDown className="h-3 w-3" /> {Math.abs(trend)}%
            </>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="w-full max-w-[200px] aspect-square">
        <ResponsiveContainer>
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="75%"
            outerRadius="100%"
            barSize={45}
            data={chartData}
            startAngle={90}
            endAngle={-270}
          >
            {/* background ring */}
            <RadialBar dataKey="value" cornerRadius={15} fill={COLORS.darkRingBg} data={[{ value: 100 }]} />
            {/* progress ring */}
            <RadialBar dataKey="value" cornerRadius={15} fill={color} data={[{ value: progress }]} />

            {/* NEW: tampilkan label judul KPI (mis. “Credit Analysis”) di atas angka */}
            <PolarRadiusAxis tick={false} axisLine={false} stroke="none">
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    const { cx, cy } = viewBox as { cx: number; cy: number };

                    const formatted =
                      unit === "%"
                        ? `${value}%`
                        : unit === "rb"
                        ? `${(value / 1000).toFixed(1)} rb`
                        : value.toLocaleString("id-ID");

                    return (
                      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
                        {/* NEW: label atas (judul KPI) */}
                        <tspan
                          x={cx}
                          y={cy - 20}
                          className="fill-gray-500 dark:fill-gray-400 text-[10px] tracking-wide uppercase"
                        >
                          {title}
                        </tspan>

                        {/* angka utama */}
                        <tspan x={cx} y={cy + 2} className="fill-black dark:fill-white text-3xl font-bold">
                          {formatted}
                        </tspan>

                        {/* subjudul */}
                        <tspan
                          x={cx}
                          y={cy + 22}
                          className="fill-gray-500 dark:fill-gray-400 text-xs"
                        >
                          {subtitle}
                        </tspan>
                      </text>
                    );
                  }
                  return null;
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
