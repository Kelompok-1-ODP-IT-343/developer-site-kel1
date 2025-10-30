'use client';

import React, { useMemo, useState, useEffect, JSX } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Check, X, XCircle, Trash2,
  User2, Wallet, BarChart3, FileText, Eye, Settings2
} from 'lucide-react';
import ViewDocumentDialog from '@/components/dialogs/ViewDocumentDialog';
import ViewApprovalDetails from '@/components/dialogs/ViewApprovalDetails';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getKPRApplicationDetail, getCreditScore, approveKPRApplication, rejectKPRApplication } from '@/lib/coreApi';

/** ---------- Types from your API (minimal) ---------- */
type KPRApplicationData = {
  id?: number;
  applicationId?: number;
  applicantName?: string;
  fullName?: string;
  username?: string;
  applicantEmail?: string;
  email?: string;
  applicantPhone?: string;
  phone?: string;
  nik?: string;
  npwp?: string;
  birthPlace?: string;
  birthDate?: string;
  gender?: string;
  marital_status?: string;
  address?: string;
  sub_district?: string;
  district?: string;
  city?: string;
  province?: string;
  postal_code?: string;

  occupation?: string;
  monthly_income?: number | string;
  income?: number | string;
  company_name?: string;
  company_address?: string;
  company_subdistrict?: string;
  company_district?: string;
  company_city?: string;
  company_province?: string;
  company_postal_code?: string;

  credit_status?: string;
  credit_score?: string | number;

  // When you return nested structures:
  userInfo?: {
    fullName?: string;
    email?: string;
    phone?: string;
    nik?: string;
    npwp?: string;
    birthPlace?: string;
    gender?: string;
    maritalStatus?: string;
    address?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    occupation?: string;
    companyName?: string;
    monthlyIncome?: number;
  };

  documents?: Array<{
    documentId: number;
    documentType: string;
    documentName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    isVerified: boolean;
    uploadedAt: string;
  }>;
};

type CustomerDetail = {
  id: string;
  name: string;
  username?: string;
  email: string;
  phone?: string;
  nik?: string;
  npwp?: string;
  birth_place?: string;
  birth_date?: string;
  gender?: string;
  marital_status?: string;
  address?: string;
  sub_district?: string;
  district?: string;
  city?: string;
  province?: string;
  postal_code?: string;

  occupation?: string;
  monthly_income?: string | number;
  company_name?: string;
  company_address?: string;
  company_subdistrict?: string;
  company_district?: string;
  company_city?: string;
  company_province?: string;
  company_postal_code?: string;

  credit_status?: string;
  credit_score?: string | number;

  ktp?: string | null;
  slip?: string | null;
};

type Row = {
  month: number;
  principalComponent: number;
  interestComponent: number;
  payment: number;
  balance: number;
  rateApplied: number;
};

type RateSegment = {
  start: number;
  end: number;
  rate: number;
  label?: string;
};

export default function ApprovalDetailIntegrated(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();

  // support both /kpr/[id] and /kpr/detail?id=...
  const id =
    (params?.id as string | undefined) ??
    (searchParams.get('id') ?? '');

  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [scoreLoading, setScoreLoading] = useState(true);
  const [docViewer, setDocViewer] = useState<{ open: boolean; title: string; url: string | null }>({
    open: false,
    title: '',
    url: null,
  });
  const [approvalDialog, setApprovalDialog] = useState<{ open: boolean; data: any | null }>({ open: false, data: null });
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; summary: string | null }>({ open: false, summary: null });
  const [actionLoading, setActionLoading] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [reasonInput, setReasonInput] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      if (!id) {
        setLoadError('Missing id in URL.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setLoadError(null);

        const api = await getKPRApplicationDetail(id);

        // Works for either AxiosResponse<{ success, message, data }> or plain object
        const payload: KPRApplicationData | undefined =
          api?.data?.data ??     // <- inner data for { success, message, data }
          api?.data ??           // <- plain { ... } returned as AxiosResponse
          api;
        if (!active) return;

        if (!payload) {
          setCustomer(null);
          setLoadError('Data tidak ditemukan.');
          return;
        }
        const customerData = mapToCustomerDetail(id, payload);
        setCustomer(customerData);

        // Fetch credit score after customer data is loaded
        if (customerData.id) {
          fetchCreditScore(customerData.id);
        }
      } catch (e: any) {
        setLoadError(e?.message || 'Gagal memuat data.');
        setCustomer(null);
      } finally {
        active && setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  // Fetch credit score from API
  const fetchCreditScore = async (userId: string) => {
    try {
      setScoreLoading(true);
      const data = await getCreditScore(userId);
      
      if (data.success && data.score) {
        setScore(Math.round(data.score));
      } else {
        // Fallback to default score if API doesn't return valid data
        setScore(650);
      }
    } catch (error) {
      console.error('Error fetching credit score:', error);
      // Fallback to default score on error
      setScore(650);
    } finally {
      setScoreLoading(false);
    }
  };

  // ----- KPR controls (local UI only) -----
  const [hargaProperti, setHargaProperti] = useState(850_000_000);
  const [persenDP, setPersenDP] = useState(20);
  const [jangkaWaktu, setJangkaWaktu] = useState(20);
  const tenor = jangkaWaktu * 12;
  const loanAmount = hargaProperti * (1 - persenDP / 100);

  const [rateSegments, setRateSegments] = useState<RateSegment[]>([
    { start: 1, end: 12, rate: 5.99 },
    { start: 13, end: 240, rate: 13.5 },
  ]);

  const rows = useMemo(() => buildMultiSegmentSchedule(loanAmount, rateSegments), [loanAmount, rateSegments]);

  const pageSize = 12;
  const [page, setPage] = useState(1);

  const colors = { blue: '#3FD8D4', gray: '#757575', orange: '#FF8500' } as const;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-sm text-muted-foreground">
        Loading detail...
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-2">
        <p className="text-red-600 font-medium">Error: {loadError}</p>
        <Button variant="outline" onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-2">
        <p className="text-muted-foreground">Data tidak tersedia.</p>
        <Button variant="outline" onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
      </div>
    );
  }

  const openDoc = (title: string, url: string | null) => setDocViewer({ open: true, title, url });
  const closeDoc = () => setDocViewer({ open: false, title: '', url: null });

  return (
    <div className="approval-page min-h-screen bg-white text-gray-700 relative">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-white" style={{ borderColor: colors.blue }}>
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4 relative">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl overflow-hidden">
              <img src="/logo-satuatap.png" alt="Satu Atap Logo" className="h-full w-full object-cover" />
            </div>
            <div>
              <h1 className="font-semibold text-lg text-black">Approval Detail KPR</h1>
              <p className="text-xs">Satu Atap Admin • Simulasi Suku Bunga</p>
            </div>
          </div>

          <button
            onClick={() => router.push('/dashboard')}
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
          <div className="p-5 rounded-2xl shadow-sm border flex flex-col" style={{ borderColor: colors.gray + '33' }}>
            <div className="flex items-center gap-2 mb-1">
              <User2 className="h-7 w-7" color={colors.blue} />
              <p className="text-base font-semibold">Nasabah</p>
            </div>
            <h3 className="font-semibold text-black text-lg">{customer.name}</h3>
            <p className="flex text-sm text-gray-600">{customer.email} • {customer.phone ?? '-'}</p>
          </div>

          <div className="p-5 rounded-2xl shadow-sm border flex flex-col" style={{ borderColor: colors.gray + '33' }}>
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="h-7 w-7" color={colors.blue} />
              <p className="text-xs">Plafon</p>
            </div>
            <h3 className="font-semibold text-black text-lg">Rp{Math.round(loanAmount).toLocaleString('id-ID')}</h3>
            <p>Tenor {tenor} bulan</p>
          </div>

          {/* FICO (from API) */}
          <div className="p-5 rounded-2xl shadow-sm border flex flex-col" style={{ borderColor: colors.gray + '33' }}>
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="h-7 w-7" color={colors.blue} />
              <p className="text-xs font-medium">FICO® Score</p>
            </div>
            <div className="flex justify-center">
              {scoreLoading ? (
                <div className="text-sm text-muted-foreground">Loading score...</div>
              ) : (
                <div className="relative w-40 h-20">
                  <svg viewBox="0 0 100 50" className="w-full h-full">
                    <path d="M10 50 A40 40 0 0 1 90 50" fill="none" stroke="#E5E7EB" strokeWidth="8" strokeLinecap="round" />
                    <path
                      d="M10 50 A40 40 0 0 1 90 50"
                      fill="none"
                      stroke={
                        score <= 560 ? '#EF4444' :
                        score <= 650 ? '#F97316' :
                        score <= 700 ? '#EAB308' :
                        score <= 750 ? '#3B82F6' : '#22C55E'
                      }
                      strokeWidth="8"
                      strokeDasharray={`${((score - 300) / 550) * 126} 126`}
                      strokeLinecap="round"
                    />
                    <text x="50" y="32" textAnchor="middle" fontSize="14" fontWeight="800" fill="#111827">{score}</text>
                    <text
                      x="50"
                      y="44"
                      textAnchor="middle"
                      fontSize="7"
                      fontWeight="600"
                      fill={
                        score <= 560 ? '#dc2626' :
                        score <= 650 ? '#ea580c' :
                        score <= 700 ? '#ca8a04' :
                        score <= 750 ? '#2563eb' : '#16a34a'
                      }
                    >
                      {score <= 560 ? 'Very Bad' :
                       score <= 650 ? 'Bad' :
                       score <= 700 ? 'Fair' :
                       score <= 750 ? 'Good' : 'Excellent'}
                    </text>
                  </svg>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Detail Customer */}
        <section className="border rounded-2xl p-5 bg-white shadow-sm" style={{ borderColor: colors.gray + '33' }}>
          <h2 className="font-semibold text-black text-lg mb-4 flex items-center gap-2">
            <User2 className="h-6 w-6 text-[#3FD8D4]" /> Detail Customer
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* KIRI */}
            <div className="border rounded-xl p-4 bg-card shadow-sm">
              <h3 className="font-semibold text-base mb-3 text-gray-900">Data Profil</h3>
              <div className="space-y-2 text-sm">
                {[
                  ['Nama Lengkap', customer.name],
                  ['Username', customer.username ?? '-'],
                  ['Email', customer.email],
                  ['Telepon', customer.phone ?? '-'],
                  ['NIK', customer.nik ?? '-'],
                  ['NPWP', customer.npwp ?? '-'],
                  ['Tempat/Tgl Lahir', `${customer.birth_place ?? '-'}, ${customer.birth_date ?? '-'}`],
                  ['Jenis Kelamin', customer.gender ?? '-'],
                  ['Status', customer.marital_status ?? '-'],
                  ['Alamat',
                    `${customer.address ?? '-'}, ${customer.sub_district ?? '-'}, ${customer.district ?? '-'}, ${customer.city ?? '-'}`
                  ],
                  ['Provinsi', customer.province ?? '-'],
                  ['Kode Pos', customer.postal_code ?? '-'],
                ].map(([label, value]) => (
                  <div key={label as string} className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium text-right max-w-[55%]">{value as string}</span>
                  </div>
                ))}

                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="text-muted-foreground">Credit Score (OJK)</span>
                  <span className={`font-medium text-xs px-2 py-0.5 rounded-full ${getCreditStatusColor(customer.credit_status)}`}>
                    {customer.credit_status ?? '-'} (Kode {customer.credit_score ?? '-'})
                  </span>
                </div>
              </div>
            </div>

            {/* KANAN */}
            <div className="border rounded-xl p-4 bg-card shadow-sm">
              <h3 className="font-semibold text-base mb-3 text-gray-900">Data Pekerjaan</h3>
              <div className="space-y-2 text-sm">
                {[
                  ['Pekerjaan', customer.occupation ?? '-'],
                  ['Pendapatan Bulanan', customer.monthly_income ? `Rp ${customer.monthly_income}` : '-'],
                  ['Nama Perusahaan', customer.company_name ?? '-'],
                  ['Alamat Perusahaan',
                    `${customer.company_address ?? '-'}, ${customer.company_subdistrict ?? '-'}, ${customer.company_district ?? '-'}`
                  ],
                  ['Kota', customer.company_city ?? '-'],
                  ['Provinsi', customer.company_province ?? '-'],
                  ['Kode Pos', customer.company_postal_code ?? '-'],
                ].map(([label, value]) => (
                  <div key={label as string} className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium text-right max-w-[55%]">{value as string}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Dokumen Pendukung */}
        <section className="border rounded-2xl p-5 bg-white shadow-sm" style={{ borderColor: colors.gray + '33' }}>
          <h2 className="font-semibold text-black text-lg mb-4 flex items-center gap-2">
            <FileText className="h-6 w-6 text-[#3FD8D4]" /> Dokumen Pendukung
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <DocRow title="Kartu Tanda Penduduk (KTP)" url={customer.ktp || null} onOpen={openDoc} colors={colors} />
            <DocRow title="Slip Gaji" url={customer.slip || null} onOpen={openDoc} colors={colors} />
          </div>
        </section>

        {/* Control Panel + Rincian Angsuran */}
        <section className="grid lg:grid-cols-2 gap-6 items-start">
          {/* Pengaturan KPR */}
          <div className="rounded-2xl bg-white p-5 border max-w-[500px]" style={{ borderColor: colors.gray + '33' }}>
            <div className="flex items-center gap-2 mb-3">
              <Settings2 className="h-9 w-9" color={colors.blue} />
              <h2 className="font-semibold text-black text-base">Pengaturan KPR</h2>
            </div>

            <div className="space-y-6 mb-4">
              <SliderRow
                label="Harga Properti"
                value={`Rp${hargaProperti.toLocaleString('id-ID')}`}
                min={100_000_000}
                max={5_000_000_000}
                step={10_000_000}
                sliderValue={hargaProperti}
                onChange={setHargaProperti}
              />

              <SliderRow
                label="Uang Muka (DP)"
                value={`${persenDP}% (${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(hargaProperti * (persenDP / 100))})`}
                min={10}
                max={80}
                step={5}
                sliderValue={persenDP}
                onChange={setPersenDP}
              />

              <SliderRow
                label="Jangka Waktu"
                value={`${jangkaWaktu} tahun (${jangkaWaktu * 12} bulan)`}
                min={1}
                max={30}
                step={1}
                sliderValue={jangkaWaktu}
                onChange={setJangkaWaktu}
              />
            </div>

            {/* Multi-rate editor */}
            <div className="mb-4 border rounded-lg p-3" style={{ borderColor: colors.gray + '33' }}>
              <p className="text-sm font-medium mb-2 text-gray-700">Penyesuaian Multi-Rate</p>

              {rateSegments.map((seg, idx) => (
                <div key={idx} className="grid grid-cols-4 gap-2 mb-2 items-end">
                  <NumberInput
                    tiny label="Mulai" value={seg.start} min={1} max={tenor}
                    onChange={(val) => setRateSegments((prev) => prev.map((s, i) => (i === idx ? { ...s, start: val } : s)))}
                  />
                  <NumberInput
                    tiny label="Selesai" value={seg.end} min={seg.start} max={tenor}
                    onChange={(val) => setRateSegments((prev) => prev.map((s, i) => (i === idx ? { ...s, end: val } : s)))}
                  />
                  <NumberInput
                    tiny label="Rate (%)" step="0.01" value={seg.rate}
                    onChange={(val) => setRateSegments((prev) => prev.map((s, i) => (i === idx ? { ...s, rate: val } : s)))}
                  />
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
                  const last = rateSegments[rateSegments.length - 1];
                  const lastEnd = last?.end ?? 0;
                  if (lastEnd < tenor) {
                    const nextStart = lastEnd + 1;
                    const nextEnd = Math.min(nextStart + 11, tenor);
                    const nextRate = last.rate < 10 ? parseFloat((last.rate + 1).toFixed(2)) : last.rate;
                    setRateSegments((prev) => [...prev, { start: nextStart, end: nextEnd, rate: nextRate }]);
                  }
                }}
                disabled={rateSegments.length > 0 && rateSegments[rateSegments.length - 1].end >= tenor}
                className={`mt-2 flex items-center gap-2 text-sm rounded-lg px-3 py-1 border transition
                  ${
                    rateSegments.length > 0 && rateSegments[rateSegments.length - 1].end >= tenor
                      ? 'opacity-50 cursor-not-allowed bg-gray-200 border-gray-300 text-gray-500'
                      : 'text-white bg-[#FF8500] border-[#FF8500] hover:bg-[#e67300]'
                  }`}
              >
                Tambah Segmen
              </button>
            </div>
          </div>

          {/* Rincian Angsuran */}
          <InstallmentTable
            colors={colors}
            rows={rows}
            page={page}
            setPage={setPage}
            pageSize={pageSize}
            roundIDR={(n) => Math.round(n)}
          />
        </section>

        {/* Actions (integrated approve/reject with reason modal) */}
        <section className="flex flex-wrap gap-3 justify-end">
          <button
            disabled={actionLoading}
            onClick={() => {
              setReasonInput("");
              setShowRejectModal(true);
            }}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl font-medium text-white shadow hover:bg-red-600 transition-colors"
            style={{ background: '#dc2626' }}
          >
            <X className="h-5 w-5" /> Reject
          </button>
          <button
            disabled={actionLoading}
            onClick={() => {
              setReasonInput("");
              setShowApproveModal(true);
            }}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl font-medium text-white shadow hover:bg-green-600 transition-colors"
            style={{ background: '#16a34a' }}
          >
            <Check className="h-5 w-5" /> Approve
          </button>
        </section>
      {/* Approve Modal */}
      <Dialog open={showApproveModal} onOpenChange={(v) => setShowApproveModal(v)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Alasan Persetujuan Kredit</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <textarea
              className="w-full border rounded p-2 min-h-[60px]"
              placeholder="Masukkan alasan persetujuan..."
              value={reasonInput}
              onChange={e => setReasonInput(e.target.value)}
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button
              disabled={actionLoading || !reasonInput.trim()}
              onClick={async () => {
                setActionLoading(true);
                try {
                  const result = await approveKPRApplication(id, reasonInput.trim());
                  setShowApproveModal(false);
                  setApprovalDialog({ open: true, data: {
                    application_id: id,
                    customer_name: customer?.name ?? "",
                    property_name: "-", // Fill with actual property if available
                    address: customer?.address ?? "",
                    price: loanAmount,
                    status: "Approved",
                    approval_date: new Date().toISOString(),
                    reason: reasonInput.trim(),
                    apiResult: result,
                  }});
                } catch (err: any) {
                  setShowApproveModal(false);
                  setApprovalDialog({ open: true, data: {
                    application_id: id,
                    customer_name: customer?.name ?? "",
                    property_name: "-",
                    address: customer?.address ?? "",
                    price: loanAmount,
                    status: "Error",
                    approval_date: new Date().toISOString(),
                    error: err?.message || "Gagal menyetujui pengajuan.",
                    reason: reasonInput.trim(),
                  }});
                } finally {
                  setActionLoading(false);
                }
              }}
            >{actionLoading ? "Memproses..." : "Approve"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={showRejectModal} onOpenChange={(v) => setShowRejectModal(v)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Alasan Penolakan Kredit</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <textarea
              className="w-full border rounded p-2 min-h-[60px]"
              placeholder="Masukkan alasan penolakan..."
              value={reasonInput}
              onChange={e => setReasonInput(e.target.value)}
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button
              disabled={actionLoading || !reasonInput.trim()}
              onClick={async () => {
                setActionLoading(true);
                try {
                  const result = await rejectKPRApplication(id, reasonInput.trim());
                  setShowRejectModal(false);
                  setRejectDialog({ open: true, summary: result?.message || "Pengajuan kredit telah ditolak." });
                } catch (err: any) {
                  setShowRejectModal(false);
                  setRejectDialog({ open: true, summary: err?.message || "Gagal menolak pengajuan." });
                } finally {
                  setActionLoading(false);
                }
              }}
            >{actionLoading ? "Memproses..." : "Reject"}</Button>
          </div>
        </DialogContent>
      </Dialog>
      </main>

      {/* Document viewer */}
      <ViewDocumentDialog open={docViewer.open} onOpenChange={(v) => (v ? null : closeDoc())} title={docViewer.title} imageUrl={docViewer.url} />

      {/* Approval details dialog */}
      {approvalDialog.open && (
        <ViewApprovalDetails
          open={approvalDialog.open}
          onOpenChange={(v) => {
            setApprovalDialog({ open: false, data: null });
            if (v === false) router.push("/dashboard");
          }}
          data={approvalDialog.data}
        />
      )}

      {/* Rejection summary dialog */}
      {rejectDialog.open && (
        <Dialog open={rejectDialog.open} onOpenChange={(v) => {
          setRejectDialog({ open: false, summary: null });
          if (v === false) router.push("/dashboard");
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Pengajuan Kredit Ditolak</DialogTitle>
            </DialogHeader>
            <div className="py-4 text-sm text-muted-foreground">{rejectDialog.summary}</div>
            <div className="flex justify-end pt-2">
              <Button onClick={() => {
                setRejectDialog({ open: false, summary: null });
                router.push("/dashboard");
              }}>Kembali ke Dashboard</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/*
        // If you don't have ViewDocumentDialog, use this quick fallback:
        <Dialog open={docViewer.open} onOpenChange={(v) => (v ? null : closeDoc())}>
          <DialogContent className="max-w-3xl">
            <DialogHeader><DialogTitle>{docViewer.title}</DialogTitle></DialogHeader>
            {docViewer.url ? (
              <img src={docViewer.url} alt={docViewer.title} className="w-full h-auto rounded" />
            ) : (
              <p className="text-sm text-muted-foreground">Dokumen belum tersedia.</p>
            )}
          </DialogContent>
        </Dialog>
      */}
    </div>
  );
}

/* ---------- Helpers ---------- */

function mapToCustomerDetail(id: string, d: KPRApplicationData): CustomerDetail {
  const ui = d.userInfo ?? {};

  const ktpDoc  = d.documents?.find(x => /KTP|IDENTITY/i.test(x.documentType ?? ''));
  const slipDoc = d.documents?.find(x => /SLIP|GAJI|INCOME/i.test(x.documentType ?? ''));

  return {
    id: String((ui as any).userId ?? d.id ?? d.applicationId ?? id),
    name: d.applicantName ?? d.fullName ?? ui.fullName ?? 'Tidak Diketahui',
    username: d.username ?? ui['username' as keyof typeof ui] as any ?? '-', // optional
    email: d.applicantEmail ?? d.email ?? (ui as any).email ?? 'unknown@example.com',   // <-- add ui.email
    phone: d.applicantPhone ?? d.phone ?? (ui as any).phone ?? '-',
    nik: d.nik ?? (ui as any).nik ?? '-',
    npwp: d.npwp ?? (ui as any).npwp ?? '-',
    birth_place: d.birthPlace ?? (ui as any).birthPlace ?? '-',
    birth_date: (d as any).birthDate ?? (ui as any).birthDate ?? '-',        // <-- add ui.birthDate
    gender: d.gender ?? (ui as any).gender ?? '-',
    marital_status: (d as any).marital_status ?? (ui as any).maritalStatus ?? '-', // keep both shapes
    address: d.address ?? (ui as any).address ?? '-',
    sub_district: (d as any).sub_district ?? '-', // (not present in sample; keep safe)
    district: (d as any).district ?? '-',
    city: d.city ?? (ui as any).city ?? '-',
    province: d.province ?? (ui as any).province ?? '-',
    postal_code: (d as any).postal_code ?? (ui as any).postalCode ?? '-',

    occupation: d.occupation ?? (ui as any).occupation ?? '-',
    monthly_income: d.monthly_income ?? d.income ?? (ui as any).monthlyIncome ?? '-',
    company_name: d.company_name ?? (ui as any).companyName ?? '-',
    company_address: (d as any).company_address ?? (ui as any).companyAddress ?? '-',
    company_subdistrict: (d as any).company_subdistrict ?? '-',
    company_district: (d as any).company_district ?? '-',
    company_city: (d as any).company_city ?? '-',
    company_province: (d as any).company_province ?? '-',
    company_postal_code: (d as any).company_postal_code ?? '-',

    credit_status: (d as any).credit_status ?? 'Lancar',
    credit_score: (d as any).credit_score ?? '01',

    ktp: ktpDoc?.filePath ?? null,
    slip: slipDoc?.filePath ?? null,
  };
}


function getCreditStatusColor(status?: string) {
  switch (status) {
    case 'Lancar': return 'text-green-600 bg-green-100';
    case 'Dalam Perhatian Khusus': return 'text-yellow-600 bg-yellow-100';
    case 'Kurang Lancar': return 'text-orange-600 bg-orange-100';
    case 'Diragukan': return 'text-red-600 bg-red-100';
    case 'Macet': return 'text-red-700 bg-red-200';
    default: return 'text-gray-600 bg-gray-100';
  }
}

function SliderRow({
  label, value, min, max, step, sliderValue, onChange,
}: {
  label: string; value: string; min: number; max: number; step: number;
  sliderValue: number; onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-gray-700 font-medium">{label}</label>
        <span className="font-semibold text-gray-900">{value}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={sliderValue}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#3FD8D4] cursor-pointer"
      />
    </div>
  );
}

function NumberInput({
  label, value, min, max, step, onChange, tiny = false,
}: {
  label: string; value: number; min?: number; max?: number; step?: string;
  onChange: (v: number) => void; tiny?: boolean;
}) {
  return (
    <label className={`text-xs ${tiny ? '' : 'block'}`}>
      {label}
      <input
        type="number"
        className="w-full border rounded px-2 py-1 mt-1 bg-white text-gray-900"
        value={value} min={min} max={max} step={step}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

function DocRow({ title, url, onOpen, colors }: { title: string; url: string | null; onOpen: (t: string, u: string | null) => void; colors: any }) {
  return (
    <div className="border rounded-xl p-5 shadow-sm bg-gray-50 flex items-center justify-between">
      <p className="font-semibold text-gray-800 text-base">{title}</p>
      <Button
        onClick={() => onOpen(title, url)}
        variant="outline"
        className="text-[#0B63E5] border-[#0B63E5]/60 hover:bg-[#0B63E5]/10 font-semibold shadow-sm"
      >
        <Eye className="mr-2 h-4 w-4" /> Lihat
      </Button>
    </div>
  );
}

function InstallmentTable({
  colors, rows, page, setPage, pageSize, roundIDR,
}: {
  colors: any;
  rows: Row[];
  page: number;
  setPage: (p: number) => void;
  pageSize: number;
  roundIDR: (n: number) => number;
}) {
  const maxPage = Math.max(1, Math.ceil(rows.length / pageSize));
  const paged = rows.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="rounded-2xl bg-white p-5 border -ml-30" style={{ borderColor: colors.gray + '33' }}>
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <FileText className="h-9 w-9" color={colors.blue} />
          <h2 className="font-semibold text-black text-base">Rincian Angsuran</h2>
        </div>
      </div>

      <div className="overflow-x-auto border rounded-lg" style={{ borderColor: colors.gray + '33' }}>
        <table className="min-w-full text-sm">
          <thead style={{ background: colors.blue + '11', color: colors.gray }}>
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
              <tr key={r.month} className="border-t" style={{ borderColor: colors.gray + '33' }}>
                <td className="px-4 py-2">{r.month}</td>
                <td className="px-4 py-2">Rp{roundIDR(r.principalComponent).toLocaleString('id-ID')}</td>
                <td className="px-4 py-2">Rp{roundIDR(r.interestComponent).toLocaleString('id-ID')}</td>
                <td className="px-4 py-2 font-medium text-black">
                  Rp{roundIDR(r.payment).toLocaleString('id-ID')}
                </td>
                <td className="px-4 py-2">Rp{roundIDR(r.balance).toLocaleString('id-ID')}</td>
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
            onClick={() => setPage(Math.max(1, page - 1))}
            className="px-3 py-1 rounded border disabled:opacity-40"
            style={{ borderColor: colors.blue, color: colors.blue }}
          >
            Prev
          </button>
          <button
            disabled={page === maxPage}
            onClick={() => setPage(Math.min(maxPage, page + 1))}
            className="px-3 py-1 rounded border disabled:opacity-40"
            style={{ borderColor: colors.blue, color: colors.blue }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function buildMultiSegmentSchedule(principal: number, segments: { start: number; end: number; rate: number }[]): Row[] {
  const rows: Row[] = [];
  let balance = principal;

  for (let s = 0; s < segments.length; s++) {
    const seg = segments[s];
    const months = seg.end - seg.start + 1;
    if (months <= 0 || balance <= 0) continue;

    const r = seg.rate / 100 / 12;
    const pay = r === 0 ? balance / months : (balance * r) / (1 - Math.pow(1 + r, -months));

    for (let i = 0; i < months; i++) {
      const interest = balance * r;
      const principalComp = Math.max(0, pay - interest);
      balance = Math.max(0, balance - principalComp);

      rows.push({
        month: seg.start + i,
        principalComponent: principalComp,
        interestComponent: interest,
        payment: principalComp + interest,
        balance,
        rateApplied: seg.rate,
      });
    }
  }
  return rows;
}
