"use client";

import { useEffect, useMemo, useState } from "react";

import {
  // LineChart imported but not used
  Line,
  BarChart,
  Bar,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  ComposedChart,
  AreaChart,
  Area,
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { getStaffDashboard, type DashboardRange, type StaffDashboardResponse } from "@/services/dashboard";

// Color palette: use existing brand colors
const COLORS = {
  blue: "#3FD8D4",
  orange: "#FF8500",
  lime: "#DDEE59",
  gray: "#757575",
  slate: "#f83218ff",
  blueLight: "#B7E5FF",
  blueMid: "#6FC0FF",
  blueDark: "#2F8BFF",
  blueDeep: "#1A54B1",
};

// Helpers

// Removed unused helpers: getLastNMonths, monthKey, pseudoDaysFromId

// Helpers to format API data into chart datasets
function toMultilineStage(stage: string) {
  // Convert "Property Appraisal" -> "Property\nAppraisal"
  return stage.replace(/\s+/g, "\n");
}

function normalizeSlaLabel(label: string) {
  return label.replace(/\s+/g, "").toLowerCase();
}

const SLA_COLOR_BY_LABEL: Record<string, string> = {
  "0-2hari": COLORS.lime,
  "3-5hari": COLORS.orange,
  ">5hari": COLORS.slate,
};

const FUNNEL_COLORS = [
  COLORS.blueLight,
  COLORS.blueMid,
  COLORS.blueDark,
  COLORS.blueDeep,
];

export default function ChartsSection() {
  const ranges: DashboardRange[] = ["7d", "30d", "90d", "ytd"];
  const [range, setRange] = useState<DashboardRange>("ytd");
  const [data, setData] = useState<StaffDashboardResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async (selected: DashboardRange) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await getStaffDashboard(selected);
      setData(resp);
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "message" in err
        ? (err as { message?: string }).message
        : undefined;
      setError(msg ?? "Gagal memuat data dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(range);
  }, [range]);

  const funnelRaw = useMemo(() => {
    // Support both snake_case and camelCase payloads from the API
    const items = data?.funnel_status ?? data?.funnelStatus ?? [];
    const out = items.map((it, idx) => ({
      // some payloads use `stage`, others use `name`
      name: toMultilineStage((it.stage ?? it.name) ?? String(it)),
      value: it.count ?? it.value ?? 0,
      fill: FUNNEL_COLORS[idx] ?? COLORS.blueDark,
    }));
    for (let i = 1; i < out.length; i++) {
      out[i].value = Math.min(out[i - 1].value, out[i].value);
    }
    return out;
  }, [data]);

  const slaData = useMemo(() => {
    const items = data?.sla_bucket ?? data?.slaBucket ?? [];
    return items.map((it) => {
      const label = it.label ?? it.bucket ?? it.name ?? "";
      return {
        bucket: label,
        value: it.count ?? it.value ?? 0,
        fill: SLA_COLOR_BY_LABEL[normalizeSlaLabel(label)] ?? COLORS.gray,
      };
    });
  }, [data]);

  const submissionApproved = useMemo(() => {
    const items = data?.submission_vs_approved ?? data?.submissionVsApproved ?? [];
    return items.map((it) => ({
      label: it.month,
      submitted: it.submitted ?? it.submittedCount ?? 0,
      accepted: it.approved ?? it.accepted ?? 0,
    }));
  }, [data]);

  const valueIncome = useMemo(() => {
    const items = data?.value_vs_income ?? data?.valueVsIncome ?? [];
    return items.map((it) => ({
      label: it.month,
      appliedAmount: it.submission_value ?? it.submissionValue ?? it.submissionAmount ?? 0,
      obtainedAmount: it.income ?? it.obtainedAmount ?? 0,
    }));
  }, [data]);

  const titleSuffix = range.toUpperCase();

  return (
    <div className="space-y-4">
      {/* Range selector + refresh */}
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
        <button
          onClick={() => load(range)}
          className="ml-2 px-3 py-1 text-sm font-medium rounded-lg border bg-white/50 dark:bg-neutral-900 hover:bg-white dark:hover:bg-neutral-800"
          aria-label="Refresh data"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 justify-items-center">

      {/* 1) Funnel Status Aplikasi */}
      <ChartCard title={`Funnel Status Aplikasi (${titleSuffix})`} fullWidth>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={funnelRaw} layout="vertical" margin={{ top: 24, bottom: 12, left: 24, right: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={`${COLORS.gray}33`} />
            <XAxis
              type="number"
              stroke={COLORS.gray}
              tick={{ fontSize: 12 }}
              domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.07)]}
              label={{ value: "Jumlah Aplikasi", position: "insideBottom", offset: -5 }}
            />
            <YAxis
              type="category"
              dataKey="name"
              interval={0} 
              tickMargin={4} 
              stroke={COLORS.gray}
              tick={<FunnelTick />}
              label={{ value: "Tahap", angle: -90, position: "left", offset: 12 }}
            />
            <Tooltip formatter={(v: number) => v.toLocaleString("id-ID")} />
            <Bar dataKey="value" radius={[0,10,10,0]}>
              {funnelRaw.map((stage) => (
                <Cell key={stage.name} fill={stage.fill} />
              ))}
              <LabelList dataKey="value" position="right" formatter={(v: number) => v.toLocaleString("id-ID")} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* 2) Aging & SLA Bucket (Approved) */}
      <ChartCard title={`Aging & SLA Bucket (Approved) (${titleSuffix})`} fullWidth>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={slaData} margin={{ top: 24, bottom: 12, left: 24, right: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={`${COLORS.gray}33`} />
            <XAxis
              dataKey="bucket"
              stroke={COLORS.gray}
              tick={{ fontSize: 12 }}
              padding={{ left: 0, right: 0 }}                  
              label={{ value: "Bucket SLA", position: "insideBottom", offset: -5 }}
            />
            <YAxis
              stroke={COLORS.gray}
              tick={{ fontSize: 12 }}
              allowDecimals={false}
              domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.07)]}
              label={{
                value: "Jumlah Approved",
                angle: -90,
                position: "insideLeft", // ← otomatis di tengah
                style: { textAnchor: "middle" }, 
                offset: 12

              }}
            />
            <Tooltip formatter={(v: number) => v.toLocaleString("id-ID")} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {slaData.map((d, i) => (
                <Cell key={`sla-${i}`} fill={d.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* 3) Pengajuan vs Diterima per Bulan (YTD) */}
      <ChartCard title={`Pengajuan vs Diterima per Bulan (${titleSuffix})`} fullWidth>
        {(() => {
          const chartConfig: ChartConfig = {
            submitted: { label: "Diajukan", color: COLORS.blue },
            accepted: { label: "Diterima", color: COLORS.orange },
          };

          return (
            <ChartContainer config={chartConfig} className="h-[280px] aspect-auto">
              <ComposedChart
                data={submissionApproved}
                margin={{ top: 24, bottom: 12, left: 24, right: 24 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={`${COLORS.gray}33`} />
                <XAxis
                  dataKey="label"
                  stroke={COLORS.gray}
                  tick={{ fontSize: 12 }}
                  padding={{ left: 0, right: 0 }}
                  label={{ value: "Bulan", position: "insideBottom", offset: -5, style: { textAnchor: "middle", fontSize: 14 }}}
                />
                <YAxis
                  stroke={COLORS.gray}
                  tick={{ fontSize: 12 }}
                  allowDecimals={false}
                  domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.07)]}
                  label={{ value: "Jumlah Aplikasi", angle: -90, position: "insideLeft", offset: 12, style: { textAnchor: "middle", fontSize: 14 } }}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />

                <Bar dataKey="submitted" fill="var(--color-submitted)" radius={[6, 6, 0, 0]}>
                  <LabelList position="top" offset={8} className="fill-foreground" fontSize={10} />
                </Bar>

                <Line
                  type="linear"
                  dataKey="accepted"
                  stroke="var(--color-accepted)"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
              </ComposedChart>
            </ChartContainer>
          );
        })()}
      </ChartCard>

      {/* 4) Nilai Pengajuan vs Pendapatan per Bulan (Rp) (YTD) */}
      <ChartCard title={`Nilai Pengajuan vs Pendapatan per Bulan (Rp) (${titleSuffix})`} fullWidth>
        {(() => {
          const chartConfig: ChartConfig = {
            appliedAmount: { label: "Diajukan (Rp)", color: COLORS.blue },
            obtainedAmount: { label: "Pendapatan (Rp)", color: COLORS.orange }, // beda warna supaya jelas
          };

          return (
            <ChartContainer config={chartConfig} className="h-[280px] aspect-auto">
              <AreaChart
                data={valueIncome}
                margin={{ top: 24, bottom: 12, left: 24, right: 24 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={`${COLORS.gray}33`} />
                <XAxis
                  dataKey="label"
                  stroke={COLORS.gray}
                  tick={{ fontSize: 12 }}
                  padding={{ left: 0, right: 0 }}
                  label={{ value: "Bulan", position: "insideBottom", offset: -5, style: { textAnchor: "middle", fontSize: 14 } }}
                />
                <YAxis
                  stroke={COLORS.gray}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v: number) => formatShortIdr(v)}
                  domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.07)]}
                  label={{ value: "Nilai (Rp)", angle: -90, position: "insideLeft", style: { textAnchor: "middle", fontSize: 14  } }}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                <Area
                  dataKey="appliedAmount"
                  type="monotone"
                  fill="var(--color-appliedAmount)"
                  fillOpacity={0.12}
                  stroke="var(--color-appliedAmount)"
                  strokeOpacity={0.6}
                  strokeWidth={2}
                />
                <Area
                  dataKey="obtainedAmount"
                  type="monotone"
                  fill="var(--color-obtainedAmount)"
                  fillOpacity={0.18}
                  stroke="var(--color-obtainedAmount)"
                  strokeOpacity={0.7}
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
            );
        })()}
        </ChartCard>
      </div>
      {loading && (
        <div className="text-xs text-gray-500 dark:text-gray-400">Memuat data…</div>
      )}
    </div>
  );
}

function ChartCard({ title, children, fullWidth = false }: { title: string; children: React.ReactNode; fullWidth?: boolean }) {
  return (
    <section className="w-full rounded-2xl border bg-white dark:bg-neutral-950 dark:border-neutral-800 shadow-sm">
      <div className="px-5 py-3 border-b dark:border-neutral-800">
        <h3
          className="transition-colors duration-300"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 500,
            fontSize: "20px",
            lineHeight: "1.2",
            color: "hsl(var(--foreground))",
          }}
        >
          {title}
        </h3>
      </div>
      <div className="px-5 py-5 sm:px-6 sm:py-6">
        <div className={fullWidth ? "mx-auto w-full" : "mx-auto w-full max-w-[520px]"}>{children}</div>
      </div>
    </section>
  );
}

// Removed unused helper `formatIdr` to avoid lint warnings

function formatShortIdr(n: number) {
  // e.g. 1.2M, 850K in Indonesian style
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} M`; // Milyar shortcut
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} Jt`;
  if (abs >= 1_000) return `${(n / 1_000).toFixed(0)} Rb`;
  return String(n);
}

function FunnelTick({ x = 0, y = 0, payload }: { x?: number; y?: number; payload?: { value: string } }) {
  if (!payload) return null;
  const lines = String(payload.value).split("\n");
  const lineHeight = 12;
  const offset = ((lines.length - 1) * lineHeight) / 2;
  return (
    <g transform={`translate(${x},${y})`}>
      {lines.map((line, index) => (
        <text
          key={`${payload.value}-${index}`}
          x={-6}
          y={index * lineHeight - offset}
          textAnchor="end"
          dominantBaseline="central"
          fill={COLORS.gray}
          fontSize={10}
        >
          {line}
        </text>
      ))}
    </g>
  );
}

