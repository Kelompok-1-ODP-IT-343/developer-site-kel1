"use client";

import React, { JSX, useMemo, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { Check, X, Calculator, FileDown, Settings2, Info } from "lucide-react";
import { useRouter } from 'next/navigation';
import { Customer } from "@/components/data/customers";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// ----- Types -----
type Scheme = "flat-floating" | "all-flat" | "all-float";
type Row = {
  month: number;
  principalComponent: number;
  interestComponent: number;
  payment: number;
  balance: number;
  rateApplied: number;
};

// ----- Component -----
export default function SimulateDialog({
  open,
  onOpenChange,
  customer,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
}): JSX.Element | null {
  const router = useRouter();

  if (!customer) return null;

  // State (typed)
  const [loanAmount, setLoanAmount] = useState<number>(850_000_000);
  const [tenor, setTenor] = useState<number>(240);
  const [startFloatAt, setStartFloatAt] = useState<number>(13);
  const [flatRate, setFlatRate] = useState<number>(5.99);
  const [floatRate, setFloatRate] = useState<number>(13.5);
  const [scheme, setScheme] = useState<Scheme>("flat-floating");

  const [page, setPage] = useState<number>(1);
  const pageSize = 12;

  // Theme
  const colors = {
    blue: "#3FD8D4",
    gray: "#757575",
    orange: "#FF8500",
    lime: "#DDEE59",
  } as const;

  // Utils
  const roundIDR = (n: number): number => Math.round(n);

  // ----- Calculators -----
  function buildFlatSchedule(P: number, months: number, rateAnnual: number): Row[] {
    const rMonthly = rateAnnual / 100 / 12;
    const principalPart = P / months;
    const interestPart = P * rMonthly;
    let balance = P;
    const rows: Row[] = [];
    for (let m = 1; m <= months; m++) {
      const principalPaid = m === months ? balance : principalPart;
      const interestPaid = interestPart;
      const payment = principalPaid + interestPaid;
      balance = Math.max(0, balance - principalPaid);
      rows.push({
        month: m,
        principalComponent: principalPaid,
        interestComponent: interestPaid,
        payment,
        balance,
        rateApplied: rateAnnual,
      });
    }
    return rows;
  }

  function buildAnnuitySchedule(
    P: number,
    months: number,
    rateAnnual: number,
    startMonthIndex: number = 1
  ): Row[] {
    const r = rateAnnual / 100 / 12;
    if (months <= 0) return [];
    const pay = r === 0 ? P / months : (P * r) / (1 - Math.pow(1 + r, -months));
    const rows: Row[] = [];
    let balance = P;
    for (let i = 1; i <= months; i++) {
      const interest = balance * r;
      const principal = Math.min(balance, pay - interest);
      balance = Math.max(0, balance - principal);
      rows.push({
        month: startMonthIndex + i - 1,
        principalComponent: principal,
        interestComponent: interest,
        payment: principal + interest,
        balance,
        rateApplied: rateAnnual,
      });
    }
    return rows;
  }

  function buildHybridSchedule(): Row[] {
    if (scheme === "all-flat") return buildFlatSchedule(loanAmount, tenor, flatRate);
    if (scheme === "all-float") return buildAnnuitySchedule(loanAmount, tenor, floatRate, 1);

    const flatMonths = Math.max(1, Math.min(startFloatAt - 1, tenor - 1));
    const flatRows = buildFlatSchedule(loanAmount, flatMonths, flatRate);
    const balanceAfterFlat = flatRows[flatRows.length - 1]?.balance ?? loanAmount;
    const remaining = tenor - flatMonths;
    const floatRows = buildAnnuitySchedule(balanceAfterFlat, remaining, floatRate, flatMonths + 1);
    return [...flatRows, ...floatRows];
  }

  const rows: Row[] = useMemo<Row[]>(() => buildHybridSchedule(), [
    loanAmount, tenor, startFloatAt, flatRate, floatRate, scheme,
  ]);

  const totalPayment = useMemo(() => rows.reduce((s, r) => s + r.payment, 0), [rows]);
  const totalInterest = useMemo(() => rows.reduce((s, r) => s + r.interestComponent, 0), [rows]);

  const paged = rows.slice((page - 1) * pageSize, page * pageSize);
  const maxPage = Math.ceil(rows.length / pageSize);

  // Chart
  const chartData = rows.map((r) => ({
    month: r.month,
    payment: Math.round(r.payment),
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[1200px] h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Simulasi Bunga – {customer.name}</DialogTitle>
          <DialogDescription>
            Perhitungan detail bunga KPR berdasarkan skema flat / floating / hybrid.
          </DialogDescription>
        </DialogHeader>

        {/* ---- Seluruh konten aslimu tetap di sini ---- */}
        <div className="min-h-screen" style={{ backgroundColor: "#fefefe", color: colors.gray }}>
          {/* Header */}
          <header
            className="sticky top-0 z-10 border-b"
            style={{ borderColor: colors.blue, background: "white" }}
          >
            <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
              <div className="flex items-center gap-3">
                <div
                  style={{ background: colors.blue }}
                  className="h-9 w-9 rounded-xl text-white grid place-content-center font-bold"
                >
                  SA
                </div>
                <div>
                  <h1 className="font-semibold text-lg text-black">
                    Approval Detail KPR
                  </h1>
                  <p className="text-xs">
                    Nasabah: <b>{customer.name}</b> • {customer.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Info className="h-4 w-4" color={colors.blue} />
                <span>Audit trail aktif</span>
              </div>
            </div>
          </header>

          {/* Main */}
          <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
            {/* Summary Cards */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                className="p-5 rounded-2xl shadow-sm border"
                style={{ borderColor: colors.gray + "33" }}
              >
                <p className="text-xs uppercase">Nasabah</p>
                <h3 className="font-semibold text-black mt-1 text-lg">{customer.name}</h3>
                <p>ID: {customer.id}</p>
              </div>
              <div
                className="p-5 rounded-2xl shadow-sm border"
                style={{ borderColor: colors.gray + "33" }}
              >
                <p className="text-xs uppercase">Plafon</p>
                <h3 className="font-semibold text-black mt-1 text-lg">
                  Rp{loanAmount.toLocaleString("id-ID")}
                </h3>
                <p>Tenor {tenor} bulan</p>
              </div>
              <div
                className="p-5 rounded-2xl shadow-sm border"
                style={{ borderColor: colors.gray + "33" }}
              >
                <p className="text-xs uppercase">Ringkasan Simulasi</p>
                <p>
                  Total Bunga:{" "}
                  <span className="font-semibold text-black">
                    Rp{roundIDR(totalInterest).toLocaleString("id-ID")}
                  </span>
                </p>
                <p>
                  Total Pembayaran:{" "}
                  <span className="font-semibold text-black">
                    Rp{roundIDR(totalPayment).toLocaleString("id-ID")}
                  </span>
                </p>
              </div>
            </section>

            {/* semua bagian selanjutnya tetap dari kode aslimu (panel, chart, tabel, pagination, tombol approve/reject) */}
          </main>
        </div>
      </DialogContent>
    </Dialog>
  );
}
