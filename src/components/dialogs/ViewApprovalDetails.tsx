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
  status: "approve" | "reject"
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

  const approved = data.status === "approve"

  const formatDate = (dateString: string) => {
    if (!dateString) return "-"
    const d = new Date(dateString)
    return d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

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
          <div className="flex justify-between border-b pb-1">
            <span className="text-muted-foreground">Nama Customer</span>
            <span className="font-medium">{data.customer_name}</span>
          </div>
          <div className="flex justify-between border-b pb-1">
            <span className="text-muted-foreground">Nama Properti</span>
            <span className="font-medium">{data.property_name}</span>
          </div>
          <div className="flex justify-between border-b pb-1">
            <span className="text-muted-foreground">Alamat</span>
            <span className="font-medium text-right w-[55%]">{data.address}</span>
          </div>
          <div className="flex justify-between border-b pb-1">
            <span className="text-muted-foreground">Harga</span>
            <span className="font-medium">
              {data.price > 0 ? `Rp ${data.price.toLocaleString("id-ID")}` : "-"}
            </span>
          </div>
          <div className="flex justify-between border-b pb-1 items-center">
            <span className="text-muted-foreground">Status</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                approved
                  ? "text-green-900 bg-green-200"
                  : "text-rose-900 bg-rose-200"
              }`}
            >
              {approved ? "Approved" : "Rejected"}
            </span>
          </div>
          <div className="flex justify-between border-b pb-1">
            <span className="text-muted-foreground">Tanggal Keputusan</span>
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
