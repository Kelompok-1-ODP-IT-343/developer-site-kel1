"use client";

import {
  LineChart,
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
import { customers } from "@/components/data/history";
import { properties } from "@/components/data/properties";

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
const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

function getLastNMonths(n: number) {
  const out: { key: string; label: string }[] = [];
  const d = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const dt = new Date(d.getFullYear(), d.getMonth() - i, 1);
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
    out.push({ key, label: `${monthNames[dt.getMonth()]} ${String(dt.getFullYear()).slice(-2)}` });
  }
  return out;
}

function monthKey(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function pseudoDaysFromId(id: string) {
  // Deterministic 0-9 days bucket from id chars
  const s = Array.from(id).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return s % 10; // 0..9
}

// Join helper
const propertyById = new Map(properties.map((p) => [p.id, p]));

// Build datasets
const monthsWindow = getLastNMonths(12);

const monthlyAgg = monthsWindow.map(({ key, label }) => {
  const apps = customers.filter((c) => monthKey(c.approval_date) === key);
  const submitted = apps.length; // using approval month as proxy for submission (mock data)
  const accepted = apps.filter((a) => a.status === "approve").length;
  const appliedAmount = apps.reduce((sum, a) => sum + (propertyById.get(a.property_id)?.price || 0), 0);
  const obtainedAmount = apps
    .filter((a) => a.status === "approve")
    .reduce((sum, a) => sum + (propertyById.get(a.property_id)?.price || 0), 0);
  return {
    key,
    label,
    submitted,
    accepted,
    appliedAmount,
    obtainedAmount,
  };
});

// SLA buckets from approved customers
const approved = customers.filter((c) => c.status === "approve");
const slaBuckets = { "0–2": 0, "3–5": 0, ">5": 0 } as Record<string, number>;
approved.forEach((c) => {
  const days = pseudoDaysFromId(c.id);
  if (days <= 2) slaBuckets["0–2"] += 1;
  else if (days <= 5) slaBuckets["3–5"] += 1;
  else slaBuckets[">5"] += 1;
});
const slaData = [
  { bucket: "0–2 hari", value: slaBuckets["0–2"], fill: COLORS.lime },
  { bucket: "3–5 hari", value: slaBuckets["3–5"], fill: COLORS.orange },
  { bucket: ">5 hari", value: slaBuckets[">5"], fill: COLORS.slate },
];

// Funnel stages (monotonic decreasing, last equals approved count)
const totalApps = customers.length;
const approvedCount = approved.length;
const stage1 = Math.max(approvedCount, totalApps);
const stage2 = Math.max(approvedCount, Math.round(totalApps * 0.75));
const stage3 = Math.max(approvedCount, Math.round(totalApps * 0.6));
const funnelRaw = [
  { name: "Property\nAppraisal", value: stage1, fill: COLORS.blueLight },
  { name: "Credit\nAnalysis", value: stage2, fill: COLORS.blueMid },
  { name: "Final\nApproval", value: stage3, fill: COLORS.blueDark },
  { name: "Approved", value: approvedCount, fill: COLORS.blueDeep },
];
// Ensure non-increasing
for (let i = 1; i < funnelRaw.length; i++) {
  funnelRaw[i].value = Math.min(funnelRaw[i - 1].value, funnelRaw[i].value);
}

export default function ChartsSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 justify-items-center">

      {/* 1) Funnel Status Aplikasi */}
      <ChartCard title="Funnel Status Aplikasi (YTD)">
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
      <ChartCard title="Aging & SLA Bucket (Approved) (YTD)">
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
      <ChartCard title="Pengajuan vs Diterima per Bulan (YTD)">
        {(() => {
          const chartConfig: ChartConfig = {
            submitted: { label: "Diajukan", color: COLORS.blue },
            accepted: { label: "Diterima", color: COLORS.orange },
          };

          return (
            <ChartContainer config={chartConfig} className="h-[280px]">
              <ComposedChart
                data={monthlyAgg}
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
      <ChartCard title="Nilai Pengajuan vs Pendapatan per Bulan (Rp) (YTD)">
        {(() => {
          const chartConfig: ChartConfig = {
            appliedAmount: { label: "Diajukan (Rp)", color: COLORS.blue },
            obtainedAmount: { label: "Pendapatan (Rp)", color: COLORS.orange }, // beda warna supaya jelas
          };

          return (
            <ChartContainer config={chartConfig} className="h-[280px]">
              <AreaChart
                data={monthlyAgg}
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
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
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
        <div className="mx-auto w-full max-w-[520px]">{children}</div>
      </div>
    </section>
  );
}

function formatIdr(n: number) {
  return n.toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
}

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

