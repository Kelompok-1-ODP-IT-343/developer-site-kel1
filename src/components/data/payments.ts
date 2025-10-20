export type PaymentDetail = {
  id: string
  customerName: string
  loanAmount: string
  tenor: string
  rateType: string
  monthlyInstallment: string
  nextPayment: string
  lastPaymentStatus: string
  dueDate: string
  bank: string
}

export const dummyPayments: PaymentDetail[] = [
  {
    id: "1",
    customerName: "Dheaz Kelvin",
    loanAmount: "Rp 800.000.000",
    tenor: "15 tahun",
    rateType: "Fixed 5.99% (12 bulan pertama)",
    monthlyInstallment: "Rp 7.200.000",
    nextPayment: "10 Nov 2025",
    lastPaymentStatus: "Paid on time",
    dueDate: "10 setiap bulan",
    bank: "BNI",
  },
  {
    id: "2",
    customerName: "Cecilion Depok",
    loanAmount: "Rp 600.000.000",
    tenor: "10 tahun",
    rateType: "Floating BI Rate + 3%",
    monthlyInstallment: "Rp 6.800.000",
    nextPayment: "5 Nov 2025",
    lastPaymentStatus: "Pending",
    dueDate: "5 setiap bulan",
    bank: "BNI",
  },
  {
    id: "4",
    customerName: "Ahong Admin",
    loanAmount: "Rp 1.200.000.000",
    tenor: "20 tahun",
    rateType: "Hybrid (5.5% → 13.5%)",
    monthlyInstallment: "Rp 10.900.000",
    nextPayment: "15 Nov 2025",
    lastPaymentStatus: "Paid",
    dueDate: "15 setiap bulan",
    bank: "BNI",
  },
]
