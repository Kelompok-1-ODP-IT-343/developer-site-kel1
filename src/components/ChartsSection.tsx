"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { getDeveloperDashboardStats } from "@/lib/coreApi";


const COLORS = {
  blue: "#3FD8D4",
  gray: "#757575",
  orange: "#FF8500",
  lime: "#DDEE59",
  darkBorder: "rgba(255,255,255,0.1)",
  lightBorder: "rgba(117,117,117,0.2)",
};

// Data akan diambil dari backend melalui CoreAPI

export default function ChartsSection() {
  const [range, setRange] = useState<"7m" | "12m">("7m");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<{
    growthAndDemand: Array<{ month: string; total_requests: number; total_approved: number }>;
    outstandingLoan: Array<{ month: string; amount_miliar: number }>;
    processingFunnel: Array<{ stage: string; count: number }>;
    userRegistered: Array<{ month: string; count: number }>;
    timestamp?: string;
  }>({ growthAndDemand: [], outstandingLoan: [], processingFunnel: [], userRegistered: [], timestamp: undefined });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const stats = await getDeveloperDashboardStats(range);
        if (!alive) return;
        setPayload({
          growthAndDemand: stats.growthAndDemand || [],
          outstandingLoan: stats.outstandingLoan || [],
          processingFunnel: stats.processingFunnel || [],
          userRegistered: stats.userRegistered || [],
          timestamp: stats.timestamp,
        });
      } catch (e: any) {
        if (!alive) return;
        setError("Gagal memuat statistik");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [range]);

  const gdData = useMemo(() => payload.growthAndDemand, [payload]);
  const loanData = useMemo(() => payload.outstandingLoan, [payload]);
  const funnelData = useMemo(() => payload.processingFunnel, [payload]);
  const userRegData = useMemo(() => payload.userRegistered, [payload]);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Selector range */}
      <div className="lg:col-span-2 flex justify-end">
        <div className="inline-flex border rounded-lg overflow-hidden bg-white/50 dark:bg-neutral-900">
          {(["7m","12m"] as const).map((r) => (
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
      {/* Growth & Demand */}
      <ChartCard title="Growth & Demand">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={gdData}>
            <defs>
              <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.blue} stopOpacity={0.4} />
                <stop offset="95%" stopColor={COLORS.blue} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradOrange" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.orange} stopOpacity={0.4} />
                <stop offset="95%" stopColor={COLORS.orange} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={`${COLORS.gray}33`} />
            <XAxis dataKey="month" stroke={COLORS.gray} tick={{ fontSize: 12 }} />
            <YAxis stroke={COLORS.gray} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Area type="monotone" dataKey="total_approved" name="Approved" stroke={COLORS.orange} fill="url(#gradOrange)" />
            <Area type="monotone" dataKey="total_requests" name="Requests" stroke={COLORS.blue} fill="url(#gradBlue)" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Outstanding Loan */}
      <ChartCard title="Outstanding Loan (Miliar Rupiah)">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={loanData}>
            <CartesianGrid strokeDasharray="3 3" stroke={`${COLORS.gray}33`} />
            <XAxis dataKey="month" stroke={COLORS.gray} tick={{ fontSize: 12 }} />
            <YAxis stroke={COLORS.gray} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line type="monotone" dataKey="amount_miliar" stroke={COLORS.blue} strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Funnel */}
      <ChartCard title="Processing Funnel">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={funnelData}>
            <CartesianGrid strokeDasharray="3 3" stroke={`${COLORS.gray}33`} />
            <XAxis dataKey="stage" stroke={COLORS.gray} />

            {(() => {
              // ambil nilai max funnel dan tambah 50
              const maxValue = Math.max(...funnelData.map((d) => d.count), 0);
              const upperLimit = maxValue + 50;

              // buat ticks otomatis tiap 70 (atau sesuaikan)
              const step = 70;
              const ticks = [];
              for (let i = 0; i <= upperLimit; i += step) ticks.push(i);
              if (!ticks.includes(maxValue)) ticks.push(maxValue);
              if (!ticks.includes(upperLimit)) ticks.push(upperLimit);
              ticks.sort((a, b) => a - b);

              return (
                <YAxis
                  stroke={COLORS.gray}
                  domain={[0, upperLimit]}
                  allowDecimals={false}
                  ticks={ticks}
                />
              );
            })()}

            <Tooltip />
            <Bar dataKey="count" radius={[10,10,0,0]}>
              <Cell fill={COLORS.blue} />
              <Cell fill={COLORS.orange} />
              <Cell fill={COLORS.lime} />
              <Cell fill={"#9CA3AF"} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>


      {/* Register */}
      <ChartCard title="User Registered">
        <section className="rounded-lg border p-4">

          <div className="mx-auto aspect-square max-h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart
                data={userRegData}
              >
                <PolarGrid radialLines={false} />
                <PolarAngleAxis dataKey="month" />
                <Radar dataKey="count" stroke="#3FD8D4" strokeWidth={3} fillOpacity={0} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </section>
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
          style={{
            fontFamily: "'Inter', sans-serif",
            color: "hsl(var(--foreground))",
          }}
        >
          {title}
        </h3>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

