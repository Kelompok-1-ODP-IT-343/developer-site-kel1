"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Users,
  TrendingUp,
  TrendingDown,
  Hourglass,
} from "lucide-react";
import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarRadiusAxis,
  Label,
} from "recharts";

import { getStaffDashboard, type DashboardRange, type StaffDashboardResponse } from "@/services/dashboard";

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
  const UI_RANGES: { label: string; value: DashboardRange }[] = [
    { label: "7d", value: "7d" },
    { label: "30d", value: "30d" },
    { label: "90d", value: "90d" },
    { label: "YTD", value: "ytd" },
  ];
  const [range, setRange] = useState<DashboardRange>("30d");
  const [data, setData] = useState<StaffDashboardResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  type KpiItem = {
    title: string;
    subtitle: string;
    value: number;
    trend: number;
    icon: any;
    color: string;
    unit: string;
  };

  // Fetch summary by range
  const load = async (selected: DashboardRange) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await getStaffDashboard(selected);
      setData(resp);
    } catch (err: any) {
      const msg = err?.message || "Gagal memuat data KPI";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(range);
  }, [range]);

  // Map API summary to KPI cards; support snake_case and camelCase
  const kpiData: KpiItem[] = useMemo(() => {
    const s = data?.summary as any;
    const approved = s?.approved_count ?? s?.approvedCount ?? 0;
    const rejected = s?.rejected_count ?? s?.rejectedCount ?? 0;
    const pending = s?.pending_count ?? s?.pendingCount ?? 0;
    const customers = s?.active_customers ?? s?.activeCustomers ?? 0;
    const growth = s?.growth || {};

    return [
      {
        title: "Approve",
        subtitle: "Total Approved",
        value: approved,
        trend: Number(growth?.approved ?? 0),
        icon: CheckCircle2,
        color: COLORS.teal,
        unit: "",
      },
      {
        title: "Reject",
        subtitle: "Total Rejected",
        value: rejected,
        trend: Number(growth?.rejected ?? 0),
        icon: XCircle,
        color: COLORS.orange,
        unit: "",
      },
      {
        title: "Pending",
        subtitle: "Total Pending",
        value: pending,
        trend: Number(growth?.pending ?? 0),
        icon: Hourglass,
        color: COLORS.lime,
        unit: "",
      },
      {
        title: "Customers",
        subtitle: "Nasabah Aktif",
        value: customers,
        trend: Number(growth?.customers ?? 0),
        icon: Users,
        color: COLORS.teal,
        // show raw unit (satuan) instead of thousands
        unit: "",
      },
    ];
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Toggle range + refresh */}
      <div className="flex justify-end">
        <div className="inline-flex border rounded-lg overflow-hidden bg-white/50 dark:bg-neutral-900">
          {UI_RANGES.map((r) => (
            <button
              key={r.label}
              onClick={() => setRange(r.value)}
              className={`px-3 py-1 text-sm font-medium transition-colors ${
                range === r.value
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => load(range)}
          className="ml-2 px-3 py-1 text-sm font-medium rounded-lg border bg-white/50 dark:bg-neutral-900 hover:bg-white dark:hover:bg-neutral-800"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
      )}

      {/* KPI cards grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpiData.map((item) => (
          <KpiCard key={item.title} {...item} />
        ))}
      </section>
      {loading && (
        <div className="text-xs text-gray-500 dark:text-gray-400">Memuat KPI…</div>
      )}
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
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              fontSize: "20px",
              lineHeight: "1.2",
              color: "var(--kpi-title-color)",
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
            innerRadius="75%" // bisa dikurangi agar bagian dalam lebih kecil, mempertebal ring
            outerRadius="100%"
            barSize={45} // naikkan dari 15 jadi 30 agar ring lebih tebal
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
