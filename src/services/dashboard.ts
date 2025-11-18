import coreApi from "@/lib/coreApi";

export type DashboardRange = "7d" | "30d" | "90d" | "ytd";

export type DashboardSummary = {
  approved_count: number;
  rejected_count: number;
  pending_count: number;
  active_customers: number;
  growth: {
    approved: number;
    rejected: number;
    pending: number;
    customers: number;
  };
};

export type FunnelStatusItem = {
  stage: string;
  count: number;
  // Some API variants use `name` / `value` instead
  name?: string;
  value?: number;
};

export type SlaBucketItem = {
  label: string; // e.g. "0-2 hari", "3-5 hari", ">5 hari"
  count: number;
  // alternative keys seen in other responses
  bucket?: string;
  name?: string;
  value?: number;
};

export type SubmissionApprovedItem = {
  month: string; // e.g. "Mar 25"
  submitted: number;
  approved: number;
  // alternative keys
  submittedCount?: number;
  accepted?: number;
};

export type ValueIncomeItem = {
  month: string; // e.g. "Mar 25"
  submission_value: number;
  income: number;
  // alternative keys
  submissionValue?: number;
  submissionAmount?: number;
  obtainedAmount?: number;
};

export type StaffDashboardResponse = {
  summary: DashboardSummary;
  funnel_status: FunnelStatusItem[];
  sla_bucket: SlaBucketItem[];
  submission_vs_approved: SubmissionApprovedItem[];
  value_vs_income: ValueIncomeItem[];
  // camelCase variants sometimes returned by the API
  funnelStatus?: FunnelStatusItem[];
  slaBucket?: SlaBucketItem[];
  submissionVsApproved?: SubmissionApprovedItem[];
  valueVsIncome?: ValueIncomeItem[];
};

// Clean API wrapper: attach Authorization via interceptor; caller provides range enum
export async function getStaffDashboard(
  range: DashboardRange,
): Promise<StaffDashboardResponse> {
  try {
    const resp = await coreApi.get("/stat-staff/dashboard", {
      params: { range },
    });
    // Some endpoints return { success, message, data }, others return plain JSON
    const payload = resp?.data?.data ?? resp?.data;
    if (!payload || typeof payload !== "object") {
      throw new Error("Invalid dashboard response shape");
    }
    return payload as StaffDashboardResponse;
  } catch (err: unknown) {
    const msg =
      (err && typeof err === "object" && "response" in err && (err as any).response?.data?.message) ||
      (err && typeof err === "object" && "message" in err && (err as any).message) ||
      "Failed to fetch staff dashboard";
    throw new Error(`Dashboard fetch error: ${msg}`);
  }
}