'use client';

import React, { useMemo, useState, useEffect, JSX } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Check, X, XCircle,
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
import {
  getKPRApplicationDetail,
  getCreditScore,
  approveKPRApplication,
  rejectKPRApplication
} from '@/lib/coreApi';

/** ---------- Types from your API (minimal) ---------- */
type ApprovalWorkflow = {
  workflowId: number;
  applicationId: number;
  stage: 'PROPERTY_APPRAISAL' | 'CREDIT_ANALYSIS' | 'FINAL_APPROVAL' | string;
  assignedTo?: number | null;
  assignedToName?: string | null;
  assignedToEmail?: string | null;
  assignedToRole?: string | null;
  status?: 'PENDING' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | string | null;
  priority?: string | null;
  dueDate?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  approvalNotes?: string | null;
  rejectionReason?: string | null;
};
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

// Removed unused Row and RateSegment types

// Removed unused CreditRecommendation types since we're not showing that section

export default function ApprovalHistoryDetailIntegrated(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();

  const id =
    (params?.id as string | undefined) ??
    (searchParams.get('id') ?? '');

  const applicationNumber = (searchParams.get('applicationNumber') ?? id) as string;

  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [scoreLoading, setScoreLoading] = useState(true);
  const [application, setApplication] = useState<any | null>(null);
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

  const workflows: ApprovalWorkflow[] = useMemo(() => {
    const arr = (application as any)?.approvalWorkflows as ApprovalWorkflow[] | undefined;
    return Array.isArray(arr) ? arr : [];
  }, [application]);

  const sortedWorkflows: ApprovalWorkflow[] = useMemo(() => {
    const arr = Array.isArray(workflows) ? [...workflows] : [];
    return arr.sort((a, b) => (a.workflowId ?? 0) - (b.workflowId ?? 0));
  }, [workflows]);

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
        const payload:
          | KPRApplicationData
          | (KPRApplicationData & { approvalWorkflows?: ApprovalWorkflow[]; kprRateInfo?: any; propertyInfo?: any })
          | undefined =
          api?.data?.data ?? api?.data ?? api;

        if (!active) return;

        if (!payload) {
          setCustomer(null);
          setLoadError('Data tidak ditemukan.');
          return;
        }
        const customerData = mapToCustomerDetail(id, payload as KPRApplicationData);
        setCustomer(customerData);
        setApplication(payload as any);

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

  const fetchCreditScore = async (userId: string) => {
    try {
      setScoreLoading(true);
      const data = await getCreditScore(userId);
      if (data.success && data.score) {
        setScore(Math.round(data.score));
      } else {
        setScore(650);
      }
    } catch {
      setScore(650);
    } finally {
      setScoreLoading(false);
    }
  };

  // ----- KPR controls (local UI only) -----
  const loanAmount = 850_000_000; // Simplified for this view
  const jangkaWaktu = 20;
  const tenor = jangkaWaktu * 12;

  const colors = { blue: '#3FD8D4', gray: '#757575', orange: '#FF8500' } as const;

  // helpers
  const formatIDR = (v?: number | string | null) => {
    if (v === null || v === undefined || v === '') return '-';
    const n = typeof v === 'string' ? Number(v) : v;
    if (Number.isNaN(n as number)) return String(v);
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n as number);
  };
  const formatPct = (v?: number | null) => (v === null || v === undefined ? '-' : `${v}%`);
  const formatDate = (s?: string | null) => {
    if (!s) return '-';
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(d);
  };

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

  const nameOrEmail = (wf?: ApprovalWorkflow | null) => {
    if (!wf) return '-';
    return (wf.assignedToName && wf.assignedToName.trim()) ? wf.assignedToName : (wf.assignedToEmail ?? '-');
  };

  const statusBadge = (status?: string | null) => {
    const s = (status ?? '').toUpperCase();
    if (s === 'APPROVED' || s === 'COMPLETED' || s === 'DONE') return 'bg-green-100 text-green-700 border-green-200';
    if (s === 'REJECTED') return 'bg-red-100 text-red-700 border-red-200';
    if (s === 'IN_PROGRESS') return 'bg-blue-100 text-blue-700 border-blue-200';
    return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  };

  type NodeState = 'done' | 'active' | 'pending';
  const nodeState = (index: number): NodeState => {
    if (index === 0) return sortedWorkflows.length > 0 ? 'done' : 'active';
    const wf = sortedWorkflows[index - 1];
    const st = (wf?.status ?? '').toUpperCase();
    if (['APPROVED', 'COMPLETED', 'DONE'].includes(st)) return 'done';
    const prevDone = index === 1 ? true : (['APPROVED', 'COMPLETED', 'DONE'].includes(((sortedWorkflows[index - 2]?.status) ?? '').toUpperCase()));
    if (prevDone && (st === 'PENDING' || st === 'IN_PROGRESS' || st === '')) return 'active';
    return 'pending';
  };

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
              <h1 className="font-semibold text-lg text-black">KPR Application Detail</h1>
              <p className="text-xs">Berikut Informasi Detail Aplikasi KPR</p>
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

        {/* ===== Summary Cards (rapi & seragam) ===== */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-fr">
          {/* Aplikasi */}
          <SummaryCard
            colors={colors}
            icon={<FileText className="h-6 w-6" color={colors.blue} />}
            title="Aplikasi"
          >
            <div className="text-sm space-y-1 text-gray-700">
              <p>
                <span className="text-gray-500">Nomor Aplikasi: </span>
                <span className="font-extrabold text-black">
                  {(application as any)?.applicationNumber ??
                    applicationNumber ??
                    (application as any)?.applicationId ??
                    '-'}
                </span>
              </p>
              <p>
                <span className="text-gray-500">Status: </span>
                <span className="font-extrabold text-black">
                  {(application as any)?.status ??
                    (application as any)?.applicationStatus ??
                    '-'}
                </span>
              </p>
            </div>
          </SummaryCard>

          {/* Nasabah */}
          <SummaryCard
            colors={colors}
            icon={<User2 className="h-7 w-7" color={colors.blue} />}
            title="Nasabah"
          >
            <h3 className="font-semibold text-black text-xl">{customer.name}</h3>
            <div className="text-sm text-gray-600 space-y-0.5">
              <p>{customer.email}</p>
              <p>{customer.phone ?? '-'}</p>
            </div>
          </SummaryCard>

          {/* Plafon */}
          <SummaryCard
            colors={colors}
            icon={<Wallet className="h-7 w-7" color={colors.blue} />}
            title="Plafon"
          >
            <h3 className="font-semibold text-black text-2xl">
              Rp{Math.round((application?.loanAmount ?? loanAmount) as number).toLocaleString('id-ID')}
            </h3>
            <p className="text-sm text-gray-600">
              Tenor {(() => {
                const lt = Number(application?.loanTermYears);
                if (!lt || Number.isNaN(lt)) return tenor;
                return lt > 50 ? lt : lt * 12;
              })()} bulan
            </p>
          </SummaryCard>

          {/* FICO® Score */}
          <SummaryCard
            colors={colors}
            icon={<BarChart3 className="h-7 w-7" color={colors.blue} />}
            title="FICO® Score"
          >
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
                    {score <= 560 ? 'Very Bad'
                      : score <= 650 ? 'Bad'
                      : score <= 700 ? 'Fair'
                      : score <= 750 ? 'Good' : 'Excellent'}
                  </text>
                </svg>
              </div>
            )}
          </SummaryCard>
        </section>

        {/* Approval Progress + Actions - MOVED UP */}
        <section className="border rounded-2xl p-5 bg-white shadow-sm space-y-6" style={{ borderColor: colors.gray + '33' }}>
          <h2 className="font-semibold text-black text-lg mb-2 flex items-center gap-2">
            <Settings2 className="h-6 w-6 text-[#3FD8D4]" /> Approval Progress
          </h2>

          {/* Futuristic stepper */}
          <div className="relative px-2 py-4">
            <div className="absolute left-8 right-8 top-8 h-1 bg-gradient-to-r from-gray-200 via-[#3FD8D4]/40 to-gray-200 rounded-full" />
            <div className="grid grid-cols-4 gap-4 relative">
              {[0,1,2,3].map((i) => {
                const state = nodeState(i);
                const base = 'flex flex-col items-center text-center';
                const isDone = state === 'done';
                const isActive = state === 'active';
                const dotCls = isDone ? 'bg-green-500 border-green-500' : isActive ? 'bg-[#3FD8D4] border-[#3FD8D4]' : 'bg-gray-200 border-gray-300';
                const ringCls = isActive ? 'ring-4 ring-[#3FD8D4]/30' : '';
                const title = i === 0 ? 'KPR Approval Assignment' : i === 1 ? 'Property Appraisal' : i === 2 ? 'Credit Analysis' : 'Final Approval';
                const wf = i > 0 ? sortedWorkflows[i - 1] : undefined;
                return (
                  <div key={i} className={`${base} px-2`}>
                    <div className={`w-6 h-6 rounded-full border ${dotCls} ${ringCls}`} />
                    <div className="mt-3 text-sm font-semibold text-gray-900">{title}</div>
                    <div className="mt-2 w-full max-w-[260px] rounded-xl border p-3 shadow-sm bg-white">
                      {i === 0 ? (
                        <div className="space-y-2 text-xs text-gray-700">
                          <div className="flex justify-between"><span className="text-muted-foreground">PIC</span><span className="font-medium">Super Admin</span></div>
                          <div className="border-t pt-2">
                            <div className="font-medium mb-1">Name Assign</div>
                            {sortedWorkflows.slice(0,3).map((w, idx) => (
                              <div key={w.workflowId} className="flex justify-between">
                                <span className="text-muted-foreground">Step {idx+1}</span>
                                <span className="font-medium truncate max-w-[60%] text-right">{nameOrEmail(w)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2 text-xs text-gray-700">
                          <div className="flex justify-between"><span className="text-muted-foreground">PIC</span><span className="font-medium truncate max-w-[60%] text-right">{nameOrEmail(wf)}</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span className="font-medium truncate max-w-[60%] text-right">{wf?.assignedToEmail ?? '-'}</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Status</span>
                            <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${statusBadge(wf?.status)}`}>{(wf?.status ?? 'PENDING')}</span>
                          </div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Note</span><span className="font-medium truncate max-w-[60%] text-right">{wf?.approvalNotes ?? wf?.rejectionReason ?? '-'}</span></div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
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

        {/* Data Pengajuan KPR & Data Properti */}
        <section className="border rounded-2xl p-5 bg-white shadow-sm" style={{ borderColor: colors.gray + '33' }}>
          <h2 className="font-semibold text-black text-lg mb-4 flex items-center gap-2">
            <FileText className="h-6 w-6 text-[#3FD8D4]" /> Data Pengajuan KPR
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Kiri: Data Pengajuan KPR */}
            <div className="border rounded-xl p-4 bg-card shadow-sm">
              <h3 className="font-semibold text-base mb-3 text-gray-900">Data Pengajuan</h3>
              <div className="space-y-2 text-sm">
                {[
                  ['Jenis Properti', (application as any)?.propertyType ?? '-'],
                  ['Nilai Properti', formatIDR((application as any)?.propertyValue)],
                  ['Alamat Properti', (application as any)?.propertyAddress ?? '-'],
                  ['Jenis Sertifikat', (application as any)?.propertyCertificateType ?? '-'],
                  ['Developer', (application as any)?.developerName ?? '-'],
                  ['Plafon (Loan Amount)', formatIDR((application as any)?.loanAmount)],
                  ['Tenor', (() => {
                    const lt = Number((application as any)?.loanTermYears);
                    if (!lt || Number.isNaN(lt)) return '-';
                    return `${lt} bulan`;
                  })()],
                  ['Suku Bunga', (application as any)?.interestRate != null ? `${((application as any)?.interestRate as number) * 100}%` : '-'],
                  ['DP (Down Payment)', formatIDR((application as any)?.downPayment)],
                  ['Rasio LTV', formatPct((application as any)?.ltvRatio)],
                  ['Tujuan', (application as any)?.purpose ?? '-'],
                  ['Diajukan', formatDate((application as any)?.submittedAt)],
                  ['Catatan', (application as any)?.notes ?? '-'],
                ].map(([label, value]) => (
                  <div key={label as string} className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium text-right max-w-[55%]">{value as string}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Kanan: Data Properti */}
            <div className="border rounded-xl p-4 bg-card shadow-sm">
              <h3 className="font-semibold text-base mb-3 text-gray-900">Data Properti</h3>
              {(() => {
                const p = (application as any)?.propertyInfo;
                if (!p) {
                  return <p className="text-sm text-muted-foreground">Informasi properti tidak tersedia.</p>;
                }
                return (
                  <div className="space-y-2 text-sm">
                    {[
                      ['Kode Properti', p.propertyCode ?? '-'],
                      ['Judul', p.title ?? '-'],
                      ['Deskripsi', p.description ?? '-'],
                      ['Alamat', p.address ?? '-'],
                      ['Kota', p.city ?? '-'],
                      ['Provinsi', p.province ?? '-'],
                      ['Kode Pos', p.postalCode ?? '-'],
                      ['Kecamatan', p.district ?? '-'],
                      ['Kelurahan', p.village ?? '-'],
                      ['Luas Tanah', p.landArea != null ? `${p.landArea} m²` : '-'],
                      ['Luas Bangunan', p.buildingArea != null ? `${p.buildingArea} m²` : '-'],
                      ['Kamar Tidur', p.bedrooms ?? '-'],
                      ['Kamar Mandi', p.bathrooms ?? '-'],
                      ['Lantai', p.floors ?? '-'],
                      ['Garasi', p.garage ?? '-'],
                      ['Tahun Dibangun', p.yearBuilt ?? '-'],
                      ['Harga', formatIDR(p.price)],
                      ['Harga/m²', formatIDR(p.pricePerSqm)],
                      ['Jenis Sertifikat', p.certificateType ?? '-'],
                      ['Nomor Sertifikat', p.certificateNumber ?? '-'],
                      ['PBB', formatIDR(p.pbbValue)],
                    ].map(([label, value]) => (
                      <div key={label as string} className="flex justify-between border-b pb-1">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-medium text-right max-w-[55%]">{value as string}</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
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

        {/* Approve Modal */}
        <Dialog open={showApproveModal} onOpenChange={(v) => setShowApproveModal(v)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Alasan Persetujuan Kredit</DialogTitle>
            </DialogHeader>
            <div className="mb-3 grid grid-cols-1 gap-2 rounded-xl border p-3 bg-gray-50">
              <SummaryRow label="KPR ID" value={`${(application as any)?.applicationNumber ?? id}`} />
              <SummaryRow label="KPR Price" value={formatIDR((application as any)?.loanAmount ?? loanAmount)} />
              <SummaryRow label="Tenor" value={`${(application as any)?.loanTermYears ?? jangkaWaktu} tahun`} />
              <SummaryRow label="KPR Rate" value={`${(application as any)?.kprRateInfo?.rateName ?? '-'}`} />
              <SummaryRow label="Property" value={`${(application as any)?.propertyInfo?.title ?? '-'}`} />
            </div>
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
                      property_name: "-",
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
            <div className="mb-3 grid grid-cols-1 gap-2 rounded-xl border p-3 bg-gray-50">
              <SummaryRow label="KPR ID" value={`${(application as any)?.applicationNumber ?? id}`} />
              <SummaryRow label="KPR Price" value={formatIDR((application as any)?.loanAmount ?? loanAmount)} />
              <SummaryRow label="Tenor" value={`${(application as any)?.loanTermYears ?? jangkaWaktu} tahun`} />
              <SummaryRow label="KPR Rate" value={`${(application as any)?.kprRateInfo?.rateName ?? '-'}`} />
              <SummaryRow label="Property" value={`${(application as any)?.propertyInfo?.title ?? '-'}`} />
            </div>
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
    </div>
  );
}

/* ---------- Reusable SummaryCard ---------- */
function SummaryCard({
  colors,
  icon,
  title,
  children,
}: {
  colors: { blue: string; gray: string; orange: string };
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="p-5 rounded-2xl shadow-sm border h-full flex flex-col items-center text-center"
      style={{ borderColor: colors.gray + '33' }}
    >
      {/* Header: icon + title perfectly centered */}
      <div className="flex items-center justify-center gap-2 h-8">
        {/* make icon not affect baseline */}
        <div className="[&_svg]:block shrink-0 flex items-center justify-center">
          {icon}
        </div>
        <span className="text-sm font-semibold text-gray-700 leading-none align-middle mb-0">
          {title}
        </span>
      </div>

      <div className="mt-3 w-full flex-1 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}

/* ---------- Helpers ---------- */

// Removed unused escapeHtml and toHtmlWithBold functions

function mapToCustomerDetail(id: string, d: KPRApplicationData): CustomerDetail {
  const ui = d.userInfo ?? {};

  const ktpDoc  = d.documents?.find(x => /KTP|IDENTITY/i.test(x.documentType ?? ''));
  const slipDoc = d.documents?.find(x => /SLIP|GAJI|INCOME/i.test(x.documentType ?? ''));

  return {
    id: String((ui as any).userId ?? d.id ?? d.applicationId ?? id),
    name: d.applicantName ?? d.fullName ?? ui.fullName ?? 'Tidak Diketahui',
    username: d.username ?? (ui as any).username ?? '-',
    email: d.applicantEmail ?? d.email ?? (ui as any).email ?? 'unknown@example.com',
    phone: d.applicantPhone ?? d.phone ?? (ui as any).phone ?? '-',
    nik: d.nik ?? (ui as any).nik ?? '-',
    npwp: d.npwp ?? (ui as any).npwp ?? '-',
    birth_place: d.birthPlace ?? (ui as any).birthPlace ?? '-',
    birth_date: (d as any).birthDate ?? (ui as any).birthDate ?? '-',
    gender: d.gender ?? (ui as any).gender ?? '-',
    marital_status: (d as any).marital_status ?? (ui as any).maritalStatus ?? '-',
    address: d.address ?? (ui as any).address ?? '-',
    sub_district: (d as any).sub_district ?? '-',
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

// Removed unused helper functions for cleaner bundling

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

// Removed unused InstallmentTable and buildMultiSegmentSchedule functions for cleaner bundling

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right max-w-[60%] truncate">{value}</span>
    </div>
  );
}