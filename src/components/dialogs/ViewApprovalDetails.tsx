"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export type HistoryRow = {
  id: string
  application_id: string
  customer_name: string
  property_name: string
  address: string
  price: number
  status: string // Changed to flexible string instead of limited union
  approval_date: string
}

export default function ViewApprovalDetails({
  open,
  onOpenChange,
  data,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: HistoryRow | null
}) {
  if (!data) return null

  const formatDate = (dateString: string) => {
    if (!dateString) return "-"
    const d = new Date(dateString)
    return d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Function to get status configuration based on status value
  const getStatusConfig = (status: string) => {
    const normalizedStatus = status.toLowerCase()

    switch (normalizedStatus) {
      case "approve":
      case "approved":
        return {
          text: "Approved",
          bgColor: "bg-green-200",
          textColor: "text-green-900"
        }
      case "reject":
      case "rejected":
        return {
          text: "Rejected",
          bgColor: "bg-rose-200",
          textColor: "text-rose-900"
        }
      case "submitted":
        return {
          text: "Submitted",
          bgColor: "bg-blue-200",
          textColor: "text-blue-900"
        }
      case "pending":
        return {
          text: "Pending",
          bgColor: "bg-yellow-200",
          textColor: "text-yellow-900"
        }
      case "processing":
        return {
          text: "Processing",
          bgColor: "bg-purple-200",
          textColor: "text-purple-900"
        }
      default:
        // For any other status, use a neutral gray style
        return {
          text: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(),
          bgColor: "bg-gray-200",
          textColor: "text-gray-900"
        }
    }
  }

  const statusConfig = getStatusConfig(data.status)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900 dark:!text-white">
            Detail Approval
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2 text-sm mt-3">
          <div className="flex justify-between border-b pb-1">
            <span className="text-muted-foreground">ID Pengajuan</span>
            <span className="font-medium">{data.application_id}</span>
          </div>
          {data.customer_name && data.customer_name !== "N/A" && (
            <div className="flex justify-between border-b pb-1">
              <span className="text-muted-foreground">Nama Customer</span>
              <span className="font-medium">{data.customer_name}</span>
            </div>
          )}
          <div className="flex justify-between border-b pb-1">
            <span className="text-muted-foreground">Nama Properti</span>
            <span className="font-medium">{data.property_name}</span>
          </div>
          <div className="flex justify-between border-b pb-1">
            <span className="text-muted-foreground">Alamat</span>
            <span className="font-medium text-right w-[55%]">{data.address}</span>
          </div>
          <div className="flex justify-between border-b pb-1">
            <span className="text-muted-foreground">Jumlah Pinjaman</span>
            <span className="font-medium">
              {data.price > 0 ? formatCurrency(data.price) : "-"}
            </span>
          </div>
          <div className="flex justify-between border-b pb-1 items-center">
            <span className="text-muted-foreground">Status</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusConfig.bgColor} ${statusConfig.textColor}`}
            >
              {statusConfig.text}
            </span>
          </div>
          <div className="flex justify-between border-b pb-1">
            <span className="text-muted-foreground">Tanggal Pengajuan</span>
            <span className="font-medium">{formatDate(data.approval_date)}</span>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={() => onOpenChange(false)}>Tutup</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
