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
} from "recharts";
import { customers } from "@/components/data/history";
import { properties } from "@/components/data/properties";

// Color palette: use existing brand colors
const COLORS = {
  blue: "#3FD8D4",
  orange: "#FF8500",
  lime: "#DDEE59",
  gray: "#757575",
  slate: "#9CA3AF",
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
  { name: "Property Appraisal", value: stage1 },
  { name: "Credit Analysis", value: stage2 },
  { name: "Final Approval", value: stage3 },
  { name: "Approved", value: approvedCount },
];
// Ensure non-increasing
for (let i = 1; i < funnelRaw.length; i++) {
  funnelRaw[i].value = Math.min(funnelRaw[i - 1].value, funnelRaw[i].value);
}

export default function ChartsSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1) Funnel Status Aplikasi */}
      <ChartCard title="Funnel Status Aplikasi">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={funnelRaw} layout="vertical" margin={{ left: 12, right: 12 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={`${COLORS.gray}33`} />
            <XAxis type="number" stroke={COLORS.gray} tick={{ fontSize: 12 }} />
            <YAxis type="category" dataKey="name" stroke={COLORS.gray} tick={{ fontSize: 12 }} width={120} />
            <Tooltip formatter={(v: number) => v.toLocaleString("id-ID")} />
            <defs>
              <linearGradient id="funnelGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={COLORS.blue} stopOpacity={0.85} />
                <stop offset="100%" stopColor={COLORS.lime} stopOpacity={0.85} />
              </linearGradient>
            </defs>
            <Bar dataKey="value" fill="url(#funnelGrad)" radius={[8, 8, 8, 8]}> 
              <LabelList dataKey="value" position="right" formatter={(v: number) => v.toLocaleString("id-ID")} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* 2) Aging & SLA Bucket (Approved) */}
      <ChartCard title="Aging & SLA Bucket (Approved)">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={slaData} margin={{ left: 8, right: 12 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={`${COLORS.gray}33`} />
            <XAxis dataKey="bucket" stroke={COLORS.gray} tick={{ fontSize: 12 }} />
            <YAxis stroke={COLORS.gray} tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip formatter={(v: number) => v.toLocaleString("id-ID")} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {slaData.map((d, i) => (
                <Cell key={`sla-${i}`} fill={d.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* 3) Banyak Rumah Diajukan (bar) + Disetujui (line) per Bulan */}
      <ChartCard title="Pengajuan vs Diterima per Bulan">
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={monthlyAgg} margin={{ left: 8, right: 12 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={`${COLORS.gray}33`} />
            <XAxis dataKey="label" stroke={COLORS.gray} tick={{ fontSize: 12 }} />
            <YAxis stroke={COLORS.gray} tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip />
            {/* Bar utama: banyak pengajuan per bulan */}
            <Bar dataKey="submitted" name="Diajukan" fill={COLORS.blue} radius={[6, 6, 0, 0]} />
            {/* Line overlay: banyak yang disetujui */}
            <Line type="linear" dataKey="accepted" name="Diterima" stroke={COLORS.orange} strokeWidth={3} dot={{ r: 3 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* 4) Pendapatan Diajukan vs Didapat per Bulan */}
      <ChartCard title="Nilai Pengajuan vs Pendapatan per Bulan (Rp)">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={monthlyAgg} margin={{ left: 8, right: 12 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={`${COLORS.gray}33`} />
            <XAxis dataKey="label" stroke={COLORS.gray} tick={{ fontSize: 12 }} />
            <YAxis stroke={COLORS.gray} tick={{ fontSize: 12 }} tickFormatter={(v) => formatShortIdr(v)} />
            <Tooltip formatter={(v: number) => formatIdr(v)} />
            {/* Satu warna modern (teal) untuk kedua garis + titik di setiap point */}
            <Line type="monotone" dataKey="appliedAmount" name="Diajukan (Rp)" stroke={COLORS.blue} strokeWidth={2.5} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="obtainedAmount" name="Pendapatan (Rp)" stroke={COLORS.blue} strokeOpacity={0.6} strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border bg-white dark:bg-neutral-950 dark:border-neutral-800 shadow-sm">
      <div className="px-5 py-3 border-b dark:border-neutral-800">
        <h3
          className="font-semibold transition-colors duration-300"
          style={{ fontFamily: "'Inter', sans-serif", color: "hsl(var(--foreground))" }}
        >
          {title}
        </h3>
      </div>
      <div className="p-4">{children}</div>
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

