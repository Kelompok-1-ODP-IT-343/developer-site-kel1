"use client";
import { create } from "zustand";
import type { Customer, Stage } from "@/types";


const seed: Customer[] = [
  { 
    id: "1", 
    name: "Zhang Ahong", 
    phone: "081277898456", 
    email: "jane@microsoft.com", 
    stage: "draft",
    nik: "3201234567890001",
    job: "Software Engineer",
    company: "Microsoft Indonesia",
    income: 15000000,
    loanAmount: 500000000,
    tenor: 15,
    downPayment: 100000000,
    address: "Jl. Sudirman No. 123, Jakarta Pusat",
    submittedAt: "2024-01-15T10:30:00Z",
    documents: ["KTP", "Slip Gaji", "Rekening Koran"]
  },
  { 
    id: "2", 
    name: "Cecilion", 
    phone: "082147896644", 
    email: "ronald@adobe.com", 
    stage: "draft",
    nik: "3201234567890002",
    job: "UI/UX Designer",
    company: "Adobe Systems",
    income: 12000000,
    loanAmount: 400000000,
    tenor: 20,
    downPayment: 80000000,
    address: "Jl. Gatot Subroto No. 456, Jakarta Selatan",
    submittedAt: "2024-01-16T14:20:00Z",
    documents: ["KTP", "Slip Gaji", "NPWP"]
  },
  { 
    id: "3", 
    name: "Hotman Paris", 
    phone: "087898446884", 
    email: "marvin@tesla.com", 
    stage: "draft",
    nik: "3201234567890003",
    job: "Lawyer",
    company: "Hotman Paris & Partners",
    income: 25000000,
    loanAmount: 800000000,
    tenor: 10,
    downPayment: 200000000,
    address: "Jl. Thamrin No. 789, Jakarta Pusat",
    submittedAt: "2024-01-17T09:15:00Z",
    documents: ["KTP", "Slip Gaji", "Rekening Koran", "NPWP"]
  },
  { 
    id: "4", 
    name: "Baharuddin", 
    phone: "081277898456", 
    email: "jane@microsoft.com", 
    stage: "review",
    nik: "3201234567890004",
    job: "Project Manager",
    company: "Tech Solutions",
    income: 18000000,
    loanAmount: 600000000,
    tenor: 15,
    downPayment: 120000000,
    address: "Jl. Kuningan No. 321, Jakarta Selatan",
    submittedAt: "2024-01-10T11:45:00Z",
    documents: ["KTP", "Slip Gaji", "Rekening Koran"]
  },
  { 
    id: "5", 
    name: "Zulqarnain", 
    phone: "081277898456", 
    email: "jane@microsoft.com", 
    stage: "review",
    nik: "3201234567890005",
    job: "Data Analyst",
    company: "Analytics Corp",
    income: 14000000,
    loanAmount: 450000000,
    tenor: 20,
    downPayment: 90000000,
    address: "Jl. Senayan No. 654, Jakarta Pusat",
    submittedAt: "2024-01-12T16:30:00Z",
    documents: ["KTP", "Slip Gaji", "NPWP"]
  },
  { 
    id: "6", 
    name: "Lutpi", 
    phone: "082147896644", 
    email: "ronald@adobe.com", 
    stage: "review",
    nik: "3201234567890006",
    job: "Marketing Manager",
    company: "Creative Agency",
    income: 16000000,
    loanAmount: 550000000,
    tenor: 15,
    downPayment: 110000000,
    address: "Jl. Kemang No. 987, Jakarta Selatan",
    submittedAt: "2024-01-13T08:20:00Z",
    documents: ["KTP", "Slip Gaji", "Rekening Koran", "NPWP"]
  },
  { 
    id: "7", 
    name: "Kusumo", 
    phone: "087898446884", 
    email: "marvin@tesla.com", 
    stage: "approval",
    nik: "3201234567890007",
    job: "Senior Developer",
    company: "Tesla Indonesia",
    income: 20000000,
    loanAmount: 700000000,
    tenor: 12,
    downPayment: 140000000,
    address: "Jl. Menteng No. 147, Jakarta Pusat",
    submittedAt: "2024-01-08T13:10:00Z",
    documents: ["KTP", "Slip Gaji", "Rekening Koran", "NPWP", "Surat Keterangan Kerja"]
  },
  { 
    id: "8", 
    name: "Raina", 
    phone: "0811999333", 
    email: "raina@openai.com", 
    stage: "approved",
    nik: "3201234567890008",
    job: "AI Researcher",
    company: "OpenAI",
    income: 22000000,
    loanAmount: 650000000,
    tenor: 15,
    downPayment: 130000000,
    address: "Jl. Blok M No. 258, Jakarta Selatan",
    submittedAt: "2024-01-05T10:00:00Z",
    processedAt: "2024-01-18T15:30:00Z",
    documents: ["KTP", "Slip Gaji", "Rekening Koran", "NPWP"]
  },
  { 
    id: "9", 
    name: "Dono", 
    phone: "0812333444", 
    email: "dono@corp.id", 
    stage: "rejected",
    nik: "3201234567890009",
    job: "Sales Executive",
    company: "Corp Indonesia",
    income: 8000000,
    loanAmount: 300000000,
    tenor: 25,
    downPayment: 60000000,
    address: "Jl. Cikini No. 369, Jakarta Pusat",
    submittedAt: "2024-01-03T12:45:00Z",
    processedAt: "2024-01-17T09:20:00Z",
    documents: ["KTP", "Slip Gaji"]
  },
  { 
    id: "10", 
    name: "Sari Dewi", 
    phone: "0813555666", 
    email: "sari@bank.co.id", 
    stage: "draft",
    nik: "3201234567890010",
    job: "Bank Officer",
    company: "Bank Mandiri",
    income: 13000000,
    loanAmount: 420000000,
    tenor: 18,
    downPayment: 84000000,
    address: "Jl. Pancoran No. 741, Jakarta Selatan",
    submittedAt: "2024-01-18T07:30:00Z",
    documents: ["KTP", "Slip Gaji", "Rekening Koran"]
  },
  { 
    id: "11", 
    name: "Budi Santoso", 
    phone: "0814777888", 
    email: "budi@startup.id", 
    stage: "draft",
    nik: "3201234567890011",
    job: "Product Manager",
    company: "Tech Startup",
    income: 17000000,
    loanAmount: 580000000,
    tenor: 15,
    downPayment: 116000000,
    address: "Jl. Kelapa Gading No. 852, Jakarta Utara",
    submittedAt: "2024-01-19T11:15:00Z",
    documents: ["KTP", "Slip Gaji", "NPWP"]
  },
  { 
    id: "12", 
    name: "Maya Sari", 
    phone: "0815999000", 
    email: "maya@consulting.com", 
    stage: "review",
    nik: "3201234567890012",
    job: "Business Consultant",
    company: "McKinsey & Company",
    income: 24000000,
    loanAmount: 750000000,
    tenor: 12,
    downPayment: 150000000,
    address: "Jl. Pondok Indah No. 963, Jakarta Selatan",
    submittedAt: "2024-01-14T14:50:00Z",
    documents: ["KTP", "Slip Gaji", "Rekening Koran", "NPWP", "Surat Keterangan Kerja"]
  }
];


interface KPRState {
  customers: Customer[];
  byStage: (s: Stage) => Customer[];
  count: (s: Stage) => number;
  move: (id: string, to: Stage) => void;
  getById: (id: string) => Customer | undefined;
}


export const useKPR = create<KPRState>((set, get) => ({
  customers: seed,
  byStage: (s) => get().customers.filter((c) => c.stage === s),
  count: (s) => get().customers.filter((c) => c.stage === s).length,
  move: (id, to) =>
    set((st) => ({ 
      customers: st.customers.map((c) => 
        c.id === id 
          ? { ...c, stage: to, processedAt: new Date().toISOString() } 
          : c
      ) 
    })),
  getById: (id) => get().customers.find((c) => c.id === id),
}));