"use client";

import {
  Check, X, Calculator, FileDown, Settings2, Info, XCircle,
  Plus, Trash2, User2, Wallet, BarChart3, FileText, Download
} from "lucide-react";
import React, { JSX, useMemo, useState } from "react";
// import {
//   LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
// } from "recharts";
// import { Check, X, Calculator, FileDown, Settings2, Info, XCircle, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { customers } from "@/components/data/customers"
import { Button } from "@/components/ui/button"
// import jsPDF from "jspdf"
// import html2canvas from "html2canvas"



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

// tambahan type baru
type RateSegment = {
  start: number;
  end: number;
  rate: number;
};

// ----- Component -----
export default function ApprovalDetailMockup(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  // cari customer berdasarkan ID
  const customer = customers.find(c => c.id === id);

  const name = customer?.name || "Tidak Diketahui";
  const email = customer?.email || "unknown@example.com";
  const phone = customer?.phone || "-";



  // const [loanAmount, setLoanAmount] = useState<number>(850_000_000);
  // const [tenor, setTenor] = useState<number>(240);
  const [startFloatAt, setStartFloatAt] = useState<number>(13);
  const [flatRate, setFlatRate] = useState<number>(5.99);
  const [floatRate, setFloatRate] = useState<number>(13.5);
  const [scheme, setScheme] = useState<Scheme>("flat-floating");
  // const [page, setPage] = useState<number>(1);
  // const pageSize = 12;
  const [hargaProperti, setHargaProperti] = useState(850_000_000);
  const [persenDP, setPersenDP] = useState(20);
  const [jangkaWaktu, setJangkaWaktu] = useState(20);
  const tenor = jangkaWaktu * 12;
  const loanAmount = hargaProperti * (1 - persenDP / 100);


  // ---- fitur baru: multi rate adjustment ----
  const [rateSegments, setRateSegments] = useState<RateSegment[]>([
    { start: 1, end: 12, rate: 5.99 },
    { start: 13, end: 240, rate: 13.5 },
  ]);
  // --------------------------------------------

  const colors = {
    blue: "#3FD8D4",
    gray: "#757575",
    orange: "#FF8500",
  } as const;

  function roundIDR(n: number): number {
    return Math.round(n);
  }

  // Schedule builders
  // function buildFlatSchedule(P: number, months: number, rateAnnual: number): Row[] {
  //   const rMonthly = rateAnnual / 100 / 12;
  //   const principalPart = P / months;
  //   const interestPart = P * rMonthly;
  //   let balance = P;
  //   const rows: Row[] = [];
  //   for (let m = 1; m <= months; m++) {
  //     const principalPaid = m === months ? balance : principalPart;
  //     const interestPaid = interestPart;
  //     const payment = principalPaid + interestPaid;
  //     balance = Math.max(0, balance - principalPaid);
  //     rows.push({
  //       month: m,
  //       principalComponent: principalPaid,
  //       interestComponent: interestPaid,
  //       payment,
  //       balance,
  //       rateApplied: rateAnnual,
  //     });
  //   }
  //   return rows;
  // }

  // function buildAnnuitySchedule(
  //   P: number,
  //   months: number,
  //   rateAnnual: number,
  //   startMonthIndex: number = 1
  // ): Row[] {
  //   const r = rateAnnual / 100 / 12;
  //   if (months <= 0) return [];
  //   const pay = r === 0 ? P / months : (P * r) / (1 - Math.pow(1 + r, -months));
  //   const rows: Row[] = [];
  //   let balance = P;
  //   for (let i = 1; i <= months; i++) {
  //     const interest = balance * r;
  //     const principal = Math.min(balance, pay - interest);
  //     balance = Math.max(0, balance - principal);
  //     rows.push({
  //       month: startMonthIndex + i - 1,
  //       principalComponent: principal,
  //       interestComponent: interest,
  //       payment: principal + interest,
  //       balance,
  //       rateApplied: rateAnnual,
  //     });
  //   }
  //   return rows;
  // }

  // ====== Perhitungan amortisasi berdasarkan segmen bunga ======
  function buildMultiSegmentSchedule(
    principal: number,
    segments: { start: number; end: number; rate: number }[]
  ): Row[] {
    const rows: Row[] = []
    let balance = principal

    for (let s = 0; s < segments.length; s++) {
      const seg = segments[s]
      const months = seg.end - seg.start + 1
      if (months <= 0 || balance <= 0) continue

      const r = seg.rate / 100 / 12

      // hitung ulang payment memakai saldo tersisa dari segmen sebelumnya
      const pay = (balance * r) / (1 - Math.pow(1 + r, -(months + (segments.length - s - 1) * 12)))

      for (let i = 0; i < months; i++) {
        const interest = balance * r
        const principalComp = pay - interest
        balance -= principalComp
        if (balance < 0) balance = 0

        rows.push({
          month: seg.start + i,
          principalComponent: principalComp,
          interestComponent: interest,
          payment: pay,
          balance,
          rateApplied: seg.rate,
        })
      }
    }

    return rows
  }

  // ====== Kalkulasi total ======
  const rows = useMemo(() => {
    if (rateSegments.length === 0) return []
    return buildMultiSegmentSchedule(loanAmount, rateSegments)
  }, [loanAmount, rateSegments, tenor])

  const totalPayment = useMemo(
    () => rows.reduce((sum, r) => sum + r.payment, 0),
    [rows]
  )
  const totalInterest = useMemo(
    () => rows.reduce((sum, r) => sum + r.interestComponent, 0),
    [rows]
  )
  const pageSize = 12
  const [page, setPage] = useState(1)
  const paged = rows.slice((page - 1) * pageSize, page * pageSize)
  const maxPage = Math.ceil(rows.length / pageSize)



  // function buildHybridSchedule(): Row[] {
  //   // kalau pakai fitur multi-rate, override
  //   if (rateSegments.length > 1) {
  //     return buildMultiSegmentSchedule();
  //   }

  //   if (scheme === "all-flat") return buildFlatSchedule(loanAmount, tenor, flatRate);
  //   if (scheme === "all-float") return buildAnnuitySchedule(loanAmount, tenor, floatRate, 1);

  //   const flatMonths = Math.max(1, Math.min(startFloatAt - 1, tenor - 1));
  //   const flatRows = buildFlatSchedule(loanAmount, flatMonths, flatRate);
  //   const balanceAfterFlat = flatRows[flatRows.length - 1]?.balance ?? loanAmount;
  //   const remaining = tenor - flatMonths;
  //   const floatRows = buildAnnuitySchedule(balanceAfterFlat, remaining, floatRate, flatMonths + 1);
  //   return [...flatRows, ...floatRows];
  // }

  // const rows: Row[] = useMemo<Row[]>(() => buildHybridSchedule(), [
  //   loanAmount, tenor, startFloatAt, flatRate, floatRate, scheme, rateSegments,
  // ]);

  // const totalPayment = useMemo(() => rows.reduce((s, r) => s + r.payment, 0), [rows]);
  // const totalInterest = useMemo(() => rows.reduce((s, r) => s + r.interestComponent, 0), [rows]);
  // const paged = rows.slice((page - 1) * pageSize, page * pageSize);
  // const maxPage = Math.ceil(rows.length / pageSize);

  const getCreditStatusColor = (status: string) => {
    switch (status) {
      case "Lancar": return "text-green-600 bg-green-100";
      case "Dalam Perhatian Khusus": return "text-yellow-600 bg-yellow-100";
      case "Kurang Lancar": return "text-orange-600 bg-orange-100";
      case "Diragukan": return "text-red-600 bg-red-100";
      case "Macet": return "text-red-700 bg-red-200";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const chartData = rows.map((r) => ({
    month: r.month,
    payment: Math.round(r.payment),
  }));

  return (

    <div className="approval-page min-h-screen bg-white text-gray-700 relative">


      {/* Header */}
      <header
        className="sticky top-0 z-10 border-b bg-white"
        style={{ borderColor: colors.blue }}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4 relative">
          <div className="flex items-center gap-3">
            <div className="h-30 w-30 rounded-xl overflow-hidden">
              <img
                src="/logo-satuatap.png"   // <== ganti sesuai lokasi gambarnya
                alt="Satu Atap Logo"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <h1 className="font-semibold text-lg text-black">
                Approval Detail KPR
              </h1>
              <p className="text-xs">Satu Atap Admin • Simulasi Suku Bunga</p>
            </div>
          </div>


          {/* Tombol Close di pojok kanan atas */}
          <button
            onClick={() => router.push("/dashboard")}
            className="absolute right-6 top-3 flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <XCircle className="h-6 w-6" /> Close
          </button>

        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Summary Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl shadow-sm border flex flex-col" style={{ borderColor: colors.gray + "33" }}>
            <div className="flex items-center gap-2 mb-1">
              <User2 className="h-7 w-7" color={colors.blue} />
              <p className="text-base font-semibold">Nasabah</p>
            </div>
            <h3 className="font-semibold text-black text-lg">{name}</h3>
            <p className="flex text-sm text-gray-600">{email} • {phone}</p>
          </div>
          <div className="p-5 rounded-2xl shadow-sm border flex flex-col" style={{ borderColor: colors.gray + "33" }}>
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="h-7 w-7" color={colors.blue} />
              <p className="text-xs">Plafon</p>
            </div>
            <h3 className="font-semibold text-black text-lg">Rp{loanAmount.toLocaleString("id-ID")}</h3>
            <p>Tenor {tenor} bulan</p>
          </div>
          <div className="p-5 rounded-2xl shadow-sm border flex flex-col" style={{ borderColor: colors.gray + "33" }}>
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="h-7 w-7" color={colors.blue} />
              <p className="text-xs">Ringkasan Simulasi</p>
            </div>
            <p>Total Bunga: <span className="font-semibold text-black">Rp{roundIDR(totalInterest).toLocaleString("id-ID")}</span></p>
            <p>Total Pembayaran: <span className="font-semibold text-black">Rp{roundIDR(totalPayment).toLocaleString("id-ID")}</span></p>
          </div>
        </section>

        {/* === Detail Customer === */}
        {customer && (
          <section className="border rounded-2xl p-5 bg-white shadow-sm" style={{ borderColor: colors.gray + "33" }}>
            <h2 className="font-semibold text-black text-lg mb-4 flex items-center gap-2">
              <User2 className="h-6 w-6 text-[#3FD8D4]" /> Detail Customer
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* KIRI - Data Profil */}
              <div className="border rounded-xl p-4 bg-card shadow-sm">
                <h3 className="font-semibold text-base mb-3 text-gray-900 dark:!text-white">
                  Data Profil
                </h3>
                <div></div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">Nama Lengkap</span>
                    <span className="font-medium text-right">{customer.name}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">Username</span>
                    <span className="font-medium text-right">{customer.username}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium text-right">{customer.email}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">Telepon</span>
                    <span className="font-medium text-right">{customer.phone}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">NIK</span>
                    <span className="font-medium text-right">{customer.nik}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">NPWP</span>
                    <span className="font-medium text-right">{customer.npwp}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">Tempat/Tgl Lahir</span>
                    <span className="font-medium text-right">
                      {customer.birth_place}, {customer.birth_date}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">Jenis Kelamin</span>
                    <span className="font-medium text-right">{customer.gender}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-medium text-right">{customer.marital_status}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">Alamat</span>
                    <span className="font-medium text-right w-[55%] text-right">
                      {customer.address}, {customer.sub_district}, {customer.district}, {customer.city}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">Provinsi</span>
                    <span className="font-medium text-right">{customer.province}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Kode Pos</span>
                    <span className="font-medium text-right">{customer.postal_code}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="text-muted-foreground">Credit Score (OJK)</span>
                    <span
                      className={`font-medium text-xs px-2 py-0.5 rounded-full ${getCreditStatusColor(
                        customer.credit_status
                      )}`}
                    >
                      {customer.credit_status} (Kode {customer.credit_score})
                    </span>
                  </div>
                </div>
              </div>

              {/* KANAN - Data Pekerjaan */}
              <div className="border rounded-xl p-4 bg-card shadow-sm">
                <h3 className="font-semibold text-base mb-3 text-gray-900 dark:!text-white">
                  Data Pekerjaan
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">Pekerjaan</span>
                    <span className="font-medium text-right">{customer.occupation}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">Pendapatan Bulanan</span>
                    <span className="font-medium text-right">Rp {customer.monthly_income}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">Nama Perusahaan</span>
                    <span className="font-medium text-right">{customer.company_name}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">Alamat Perusahaan</span>
                    <span className="font-medium text-right w-[55%] text-right">
                      {customer.company_address}, {customer.company_subdistrict}, {customer.company_district}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">Kota</span>
                    <span className="font-medium text-right">{customer.company_city}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">Provinsi</span>
                    <span className="font-medium text-right">{customer.company_province}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Kode Pos</span>
                    <span className="font-medium text-right">{customer.company_postal_code}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* === Dokumen Pendukung === */}
        {customer && (
          <section
            className="border rounded-2xl p-5 bg-white shadow-sm"
            style={{ borderColor: colors.gray + "33" }}
          >
            <h2 className="font-semibold text-black text-lg mb-4 flex items-center gap-2">
              <FileText className="h-6 w-6 text-[#3FD8D4]" /> Dokumen Pendukung
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* KTP */}
              <div className="border rounded-xl p-4 shadow-sm bg-gray-50 flex flex-col items-center">
                {customer.ktp ? (
                  <>
                    <img
                      src={customer.ktp}
                      alt="KTP"
                      className="w-full max-w-[400px] h-auto rounded-lg border object-cover"
                      style={{ borderColor: colors.gray + "33" }}
                    />
                    <Button
                      asChild
                      variant="outline"
                      className="mt-3 text-[#0B63E5] border-[#0B63E5]/60 hover:bg-[#0B63E5]/10 font-semibold shadow-sm"
                    >
                      <a href={customer.ktp} download>
                        <FileDown className="mr-2 h-4 w-4" /> Download KTP
                      </a>
                    </Button>

                  </>
                ) : (
                  <p className="text-sm text-gray-500 italic">Belum ada foto KTP</p>
                )}
              </div>

              {/* Slip Gaji */}
              <div className="border rounded-xl p-4 shadow-sm bg-gray-50 flex flex-col items-center">
                {customer.slip ? (
                  <>
                    <img
                      src={customer.slip}
                      alt="Slip Gaji"
                      className="w-full max-w-[400px] h-auto rounded-lg border object-cover"
                      style={{ borderColor: colors.gray + "33" }}
                    />
                    <Button
                      asChild
                      variant="outline"
                      className="mt-3 text-[#0B63E5] border-[#0B63E5]/60 hover:bg-[#0B63E5]/10 font-semibold shadow-sm"
                    >
                      <a href={customer.ktp} download>
                        <FileDown className="mr-2 h-4 w-4" /> Download Slip Gaji
                      </a>
                    </Button>
                  </>
                ) : (
                  <p className="text-sm text-gray-500 italic">Belum ada foto slip gaji</p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Control Panel */}
        <section className="grid lg:grid-cols-2 gap-6 items-start">
          {/* Pengaturan KPR */}
          <div
            className="rounded-2xl bg-white p-5 border max-w-[500px]"
            style={{ borderColor: colors.gray + "33" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Settings2 className="h-9 w-9" color={colors.blue} />
              <h2 className="font-semibold text-black text-base">Pengaturan KPR</h2>
            </div>

            {/* === SLIDER HARGA PROPERTI, DP, JANGKA WAKTU === */}
            <div className="space-y-6 mb-4">
              {/* Harga Properti */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-gray-700 font-medium">Harga Properti</label>
                  <span className="font-semibold text-gray-900">
                    Rp{hargaProperti.toLocaleString("id-ID")}
                  </span>
                </div>
                <input
                  type="range"
                  min={100_000_000}
                  max={5_000_000_000}
                  step={10_000_000}
                  value={hargaProperti}
                  onChange={(e) => setHargaProperti(Number(e.target.value))}
                  className="w-full accent-[#3FD8D4] cursor-pointer"
                />
              </div>

              {/* DP */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-gray-700 font-medium">Uang Muka (DP)</label>
                  <span className="font-semibold text-gray-900">
                    {persenDP}% (
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(hargaProperti * (persenDP / 100))}
                    )
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={80}
                  step={5}
                  value={persenDP}
                  onChange={(e) => setPersenDP(Number(e.target.value))}
                  className="w-full accent-[#3FD8D4] cursor-pointer"
                />
              </div>

              {/* Jangka Waktu */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-gray-700 font-medium">Jangka Waktu</label>
                  <span className="font-semibold text-gray-900">
                    {jangkaWaktu} tahun ({jangkaWaktu * 12} bulan)
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={30}
                  step={1}
                  value={jangkaWaktu}
                  onChange={(e) => setJangkaWaktu(Number(e.target.value))}
                  className="w-full accent-[#3FD8D4] cursor-pointer"
                />
              </div>
            </div>

            {/* === PENYESUAIAN MULTI-RATE === */}
            <div className="mb-4 border rounded-lg p-3" style={{ borderColor: colors.gray + "33" }}>
              <p className="text-sm font-medium mb-2 text-gray-700">Penyesuaian Multi-Rate</p>

              {rateSegments.map((seg, idx) => (
                <div key={idx} className="grid grid-cols-4 gap-2 mb-2 items-end">
                  <label className="text-xs">
                    Mulai
                    <input
                      type="number"
                      className="w-full border rounded px-2 py-1 mt-1 bg-white text-gray-900"
                      value={seg.start}
                      min={1}
                      max={tenor}
                      onChange={(e) => {
                        const val = Math.max(1, Math.min(+e.target.value, tenor))
                        setRateSegments((prev) =>
                          prev.map((s, i) => (i === idx ? { ...s, start: val } : s))
                        )
                      }}
                    />
                  </label>
                  <label className="text-xs">
                    Selesai
                    <input
                      type="number"
                      className="w-full border rounded px-2 py-1 mt-1 bg-white text-gray-900"
                      value={seg.end}
                      min={seg.start}
                      max={tenor}
                      onChange={(e) => {
                        const val = Math.max(seg.start, Math.min(+e.target.value, tenor))
                        setRateSegments((prev) =>
                          prev.map((s, i) => (i === idx ? { ...s, end: val } : s))
                        )
                      }}
                    />
                  </label>
                  <label className="text-xs">
                    Rate (%)
                    <input
                      type="number"
                      step="0.01"
                      className="w-full border rounded px-2 py-1 mt-1 bg-white text-gray-900"
                      value={seg.rate}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value || "0")
                        setRateSegments((prev) =>
                          prev.map((s, i) => (i === idx ? { ...s, rate: val } : s))
                        )
                      }}
                    />
                  </label>
                  <button
                    onClick={() => setRateSegments((prev) => prev.filter((_, i) => i !== idx))}
                    className="text-red-500 hover:text-red-600 flex items-center gap-1 justify-center"
                  >
                    <Trash2 className="h-4 w-4" /> Hapus
                  </button>
                </div>
              ))}

              <button
                onClick={() => {
                  const lastSeg = rateSegments[rateSegments.length - 1]
                  const lastEnd = lastSeg?.end || 0
                  if (lastEnd < tenor) {
                    const nextStart = lastEnd + 1
                    const nextEnd = Math.min(nextStart + 11, tenor)
                    const nextRate =
                      lastSeg.rate < 10 ? parseFloat((lastSeg.rate + 1).toFixed(2)) : lastSeg.rate

                    setRateSegments((prev) => [
                      ...prev,
                      { start: nextStart, end: nextEnd, rate: nextRate },
                    ])
                  }
                }}
                disabled={
                  rateSegments.length > 0 && rateSegments[rateSegments.length - 1].end >= tenor
                }
                className={`mt-2 flex items-center gap-2 text-sm rounded-lg px-3 py-1 border transition
                  ${
                    rateSegments.length > 0 &&
                    rateSegments[rateSegments.length - 1].end >= tenor
                      ? "opacity-50 cursor-not-allowed bg-gray-200 border-gray-300 text-gray-500"
                      : "text-white bg-[#FF8500] border-[#FF8500] hover:bg-[#e67300]"
                  }`}
              >
                <Plus className="h-4 w-4" /> Tambah Segmen
              </button>
            </div>
          </div>


          {/* Rincian Angsuran */}
          <div className="rounded-2xl bg-white p-5 border -ml-30" style={{ borderColor: colors.gray + "33" }}>
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-9 w-9" color={colors.blue} />
                <h2 className="font-semibold text-black text-base">Rincian Angsuran</h2>
              </div>
            </div>
            <div className="overflow-x-auto border rounded-lg" style={{ borderColor: colors.gray + "33" }}>
              <table className="min-w-full text-sm">
                <thead style={{ background: colors.blue + "11", color: colors.gray }}>
                  <tr>
                    <th className="px-4 py-2">Bulan</th>
                    <th className="px-4 py-2">Pokok</th>
                    <th className="px-4 py-2">Bunga</th>
                    <th className="px-4 py-2">Angsuran</th>
                    <th className="px-4 py-2">Sisa</th>
                    <th className="px-4 py-2">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((r) => (
                    <tr key={r.month} className="border-t" style={{ borderColor: colors.gray + "33" }}>
                      <td className="px-4 py-2">{r.month}</td>
                      <td className="px-4 py-2">Rp{roundIDR(r.principalComponent).toLocaleString("id-ID")}</td>
                      <td className="px-4 py-2">Rp{roundIDR(r.interestComponent).toLocaleString("id-ID")}</td>
                      <td className="px-4 py-2 font-medium text-black">Rp{roundIDR(r.payment).toLocaleString("id-ID")}</td>
                      <td className="px-4 py-2">Rp{roundIDR(r.balance).toLocaleString("id-ID")}</td>
                      <td className="px-4 py-2">{r.rateApplied.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center mt-4 text-sm">
              <span>Halaman {page} / {maxPage}</span>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 rounded border disabled:opacity-40"
                  style={{ borderColor: colors.blue, color: colors.blue }}
                >
                  Prev
                </button>
                <button
                  disabled={page === maxPage}
                  onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
                  className="px-3 py-1 rounded border disabled:opacity-40"
                  style={{ borderColor: colors.blue, color: colors.blue }}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="grid lg:grid-cols-3 gap-6">


          {/* Chart */}
          {/* <div className="lg:col-span-2 rounded-2xl bg-white p-5 border" style={{ borderColor: colors.gray + "33" }}>
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-semibold text-black text-base">Grafik Angsuran</h2>
              <button
                className="flex items-center gap-2 border rounded-lg px-3 py-2 text-sm"
                style={{ borderColor: colors.gray + "55", color: colors.gray }}
              >
                <FileDown className="h-4 w-4" /> Export
              </button>
            </div>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.gray + "55"} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke={colors.gray} />
                  <YAxis tick={{ fontSize: 12 }} stroke={colors.gray} />
                  <Tooltip formatter={(v: number | string) => `Rp${Number(v).toLocaleString("id-ID")}`} />
                  <Line type="monotone" dataKey="payment" stroke={colors.blue} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div> */}
        </section>


        {/* Actions */}
        <section className="flex flex-wrap gap-3 justify-end">
          <button
            onClick={() => router.push('/confirm?action=reject')}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl font-medium text-white shadow hover:bg-red-600 transition-colors"
            style={{ background: '#dc2626' }}
          >
            <X className="h-5 w-5" /> Reject
          </button>
          <button
            onClick={() => router.push('/confirm?action=approve')}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl font-medium text-white shadow hover:bg-green-600 transition-colors"
            style={{ background: '#16a34a' }}
          >
            <Check className="h-5 w-5" /> Approve
          </button>
        </section>

      </main>
    </div>
  );
}
