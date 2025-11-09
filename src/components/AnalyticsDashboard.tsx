"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Percent,
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
import { getDeveloperDashboardStats } from "@/lib/coreApi";

const COLORS = {
  teal: "#3FD8D4",
  orange: "#FF8500",
  lime: "#DDEE59",
  red: "#ef4444",
  green: "#22c55e",
  ringBg: "#e5e7eb",
  darkRingBg: "#1f293799", // hitam keabu-abuan
};

const MAX_BORROWERS = 20000;


export default function AnalyticsKpiRadial() {
  const [range, setRange] = useState("7d");
  const ranges = ["7d", "30d", "90d", "YTD"];
  type KpiItem = {
    title: string;
    subtitle: string;
    value: number;
    trend: number;
    icon: any;
    color: string;
    unit: string;
  };
  const [kpiData, setKpiData] = useState<KpiItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const stats = await getDeveloperDashboardStats(range);
        if (!alive) return;
        const toNum = (v: any) => (typeof v === "number" && isFinite(v) ? v : 0);
        const kpi = stats.kpi || {};
        const next: KpiItem[] = [
          {
            title: "Approve",
            subtitle: "Total Approved",
            value: toNum(kpi?.approved?.value),
            trend: toNum(kpi?.approved?.percentage_change),
            icon: CheckCircle2,
            color: COLORS.teal,
            unit: "",
          },
          {
            title: "Reject",
            subtitle: "Total Rejected",
            value: toNum(kpi?.rejected?.value),
            trend: toNum(kpi?.rejected?.percentage_change),
            icon: XCircle,
            color: COLORS.orange,
            unit: "",
          },
          {
            title: "Pending",
            subtitle: "Total Pending",
            value: toNum(kpi?.pending?.value),
            trend: toNum(kpi?.pending?.percentage_change),
            icon: Hourglass,
            color: COLORS.lime,
            unit: "",
          },
          {
            title: "Customers",
            subtitle: "Nasabah Aktif",
            value: toNum(kpi?.customers?.value),
            trend: toNum(kpi?.customers?.percentage_change),
            icon: Users,
            color: COLORS.teal,
            unit: "rb",
          },
        ];
        setKpiData(next);
      } catch (e: any) {
        if (!alive) return;
        setError("Gagal memuat KPI");
        setKpiData([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [range]);


  return (
    <div className="space-y-6">
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
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {(loading && kpiData.length === 0) ? (
          <div className="col-span-4 text-sm text-muted-foreground">Memuat KPI…</div>
        ) : (
          kpiData.map((item) => <KpiCard key={item.title} {...item} />)
        )}
      </section>
    </div>
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
      : value;

  const chartData = [
    { name: "progress", value: progress, fill: color },
    { name: "remainder", value: 100 - progress, fill: COLORS.darkRingBg },
  ];

  return (
    <div className="relative bg-white dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between items-center">
      {/* Header */}
      <div className="flex w-full items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-gray-400 dark:text-gray-300" />
          <h3
            className="text-[12px] font-medium text-gray-600 dark:text-white"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: "20px", lineHeight: "1.2" , color: "var(--kpi-title-color)"}}
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
            innerRadius="75%"   // bisa dikurangi agar bagian dalam lebih kecil, mempertebal ring
            outerRadius="100%"
            barSize={45}        // naikkan dari 15 jadi 30 agar ring lebih tebal
            data={chartData}
            startAngle={90}
            endAngle={-270}
          >
            {/* Layer 1: background hitam */}
            <RadialBar
              dataKey="value"
              cornerRadius={15}
              fill={COLORS.darkRingBg}
              data={[{ value: 100 }]}
            />
            {/* Layer 2: progress berwarna */}
            <RadialBar
              dataKey="value"
              cornerRadius={15}
              fill={color}
              data={[{ value: progress }]}
            />
            <PolarRadiusAxis tick={false} axisLine={false} stroke="none">
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    const { cx, cy } = viewBox;
                    return (
                      <>
                        <text
                          x={cx}
                          y={cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={cx}
                            y={cy}
                            className="fill-black dark:fill-white text-3xl font-bold"
                          >
                            {unit === "%"
                              ? `${value}%`
                              : unit === "rb"
                              ? `${(value / 1000).toFixed(1)} rb`
                              : value.toLocaleString("id-ID")}
                          </tspan>
                          <tspan
                            x={cx}
                            y={(cy || 0) + 22}
                            className="fill-gray-500 dark:fill-gray-400 text-xs"
                          >
                            {subtitle}
                          </tspan>
                        </text>
                      </>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>

        </ResponsiveContainer>
      </div>
    </div>
  );
}
