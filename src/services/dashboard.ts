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
};

export type SlaBucketItem = {
  label: string; // e.g. "0-2 hari", "3-5 hari", ">5 hari"
  count: number;
};

export type SubmissionApprovedItem = {
  month: string; // e.g. "Mar 25"
  submitted: number;
  approved: number;
};

export type ValueIncomeItem = {
  month: string; // e.g. "Mar 25"
  submission_value: number;
  income: number;
};

export type StaffDashboardResponse = {
  summary: DashboardSummary;
  funnel_status: FunnelStatusItem[];
  sla_bucket: SlaBucketItem[];
  submission_vs_approved: SubmissionApprovedItem[];
  value_vs_income: ValueIncomeItem[];
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
  } catch (err: any) {
    // Provide safe, contextual error without leaking sensitive info
    const msg = err?.response?.data?.message || err?.message || "Failed to fetch staff dashboard";
    throw new Error(`Dashboard fetch error: ${msg}`);
  }
}