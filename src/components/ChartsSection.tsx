"use client";

import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";


const COLORS = {
  blue: "#3FD8D4",
  gray: "#757575",
  orange: "#FF8500",
  lime: "#DDEE59",
  darkBorder: "rgba(255,255,255,0.1)",
  lightBorder: "rgba(117,117,117,0.2)",
};

const months = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul"];

const growthDemand = months.map((m,i)=>({
  name:m,
  approval:[40,65,85,78,102,130,145][i],
  reject:[10,18,25,32,22,14,20][i],
}));

const outstandingLoan = months.map((m,i)=>({ name:m, value:[180,260,420,500,610,690,770][i] }));

const funnel = [
  { name:"Draft", value:280 },
  { name:"Review", value:190 },
  { name:"Approval", value:140 },
  { name:"Reject", value:30 },
];

const repayment = [
  { name:"On-time", value:72, color:COLORS.lime },
  { name:"Late", value:18, color:COLORS.orange },
  { name:"Default", value:10, color:"#9CA3AF" },
];

export default function ChartsSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Growth & Demand */}
      <ChartCard title="Growth & Demand">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={growthDemand}>
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
            <XAxis dataKey="name" stroke={COLORS.gray} tick={{ fontSize: 12 }} />
            <YAxis stroke={COLORS.gray} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Area type="monotone" dataKey="approval" name="Approval" stroke={COLORS.orange} fill="url(#gradOrange)" />
            <Area type="monotone" dataKey="reject" name="Reject" stroke={COLORS.blue} fill="url(#gradBlue)" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Outstanding Loan */}
      <ChartCard title="Outstanding Loan (Miliar Rupiah)">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={outstandingLoan}>
            <CartesianGrid strokeDasharray="3 3" stroke={`${COLORS.gray}33`} />
            <XAxis dataKey="name" stroke={COLORS.gray} tick={{ fontSize: 12 }} />
            <YAxis stroke={COLORS.gray} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke={COLORS.blue} strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Funnel */}
      <ChartCard title="Processing Funnel">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={funnel}>
            <CartesianGrid strokeDasharray="3 3" stroke={`${COLORS.gray}33`} />
            <XAxis dataKey="name" stroke={COLORS.gray} />

            {(() => {
              // ambil nilai max funnel dan tambah 50
              const maxValue = Math.max(...funnel.map((d) => d.value));
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
            <Bar dataKey="value" radius={[10,10,0,0]}>
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
                data={[
                  { month: "January", pegawai: 186, nonPegawai: 160 },
                  { month: "February", pegawai: 185, nonPegawai: 170 },
                  { month: "March", pegawai: 207, nonPegawai: 180 },
                  { month: "April", pegawai: 173, nonPegawai: 160 },
                  { month: "May", pegawai: 160, nonPegawai: 190 },
                  { month: "June", pegawai: 174, nonPegawai: 204 },
                ]}
              >
                <PolarGrid radialLines={false} />
                <PolarAngleAxis dataKey="month" />
                <Radar
                  dataKey="pegawai"
                  stroke="#FF8500"
                  strokeWidth={3}
                  fillOpacity={0}
                />
                <Radar
                  dataKey="nonPegawai"
                  stroke="#3FD8D4"
                  strokeWidth={3}
                  fillOpacity={0}
                />
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

