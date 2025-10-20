export type Stage = "draft" | "review" | "approval" | "approved" | "rejected";

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  stage: Stage;
  nik?: string;
  job?: string;
  company?: string;
  income?: number;
  loanAmount?: number;
  tenor?: number;
  downPayment?: number;
  address?: string;
  submittedAt?: string;
  processedAt?: string;
  documents?: string[];
};