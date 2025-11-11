"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import coreApi from "@/lib/coreApi"
import { useRouter } from "next/navigation"
import { Eye } from "lucide-react"

// Lazy load dialog agar tidak berat di awal
const ViewApprovalDetails = React.lazy(() => import("@/components/dialogs/ViewApprovalDetails"))

// Updated type based on API response
type KPRApplication = {
  id: number
  namaRumah: string
  statusPengajuan: string
  lokasiRumah: string
  aplikasiKode: string
  jumlahPinjaman: number
  tanggalPengajuan: string
  fotoProperti: string
}

type ApiResponse = {
  success: boolean
  message: string
  data: KPRApplication[]
  timestamp: string
  path: string | null
}

type HistoryRow = {
  id: string
  application_id: string
  customer_name: string
  property_name: string
  address: string
  price: number
  status: string
  approval_date: string
}

function formatDate(dateString: string) {
  if (!dateString) return "-"
  const d = new Date(dateString)
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount)
}

export default function ApprovalHistory() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [filter, setFilter] = React.useState("")
  const [selectedRow, setSelectedRow] = React.useState<HistoryRow | null>(null)
  const [openDialog, setOpenDialog] = React.useState(false)
  const [data, setData] = React.useState<KPRApplication[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Fetch data from API
  React.useEffect(() => {
    const fetchApprovalHistory = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await coreApi.get<ApiResponse>('/kpr-applications/developer/history')

        if (response.data.success) {
          setData(response.data.data)
        } else {
          setError(response.data.message || 'Failed to fetch approval history')
        }
      } catch (err: any) {
        console.error('Error fetching approval history:', err)
        setError(err.response?.data?.message || 'Failed to fetch approval history')
      } finally {
        setLoading(false)
      }
    }

    fetchApprovalHistory()
  }, [])

  // Transform API data to table format and exclude SUBMITTED status
  const transformedData: HistoryRow[] = React.useMemo(() => {
    return data
      .filter((item) => item.statusPengajuan.toUpperCase() !== 'SUBMITTED')
      .map((item) => ({
        id: item.id.toString(),
        application_id: item.aplikasiKode,
        customer_name: "N/A", // Not provided in API response
        property_name: item.namaRumah,
        address: item.lokasiRumah,
        price: item.jumlahPinjaman,
        status: item.statusPengajuan.toLowerCase(),
        approval_date: item.tanggalPengajuan,
      }))
  }, [data])

  const filteredData = React.useMemo(() => {
    return transformedData.filter((item) =>
      item.property_name.toLowerCase().includes(filter.toLowerCase()) ||
      item.application_id.toLowerCase().includes(filter.toLowerCase()) ||
      item.address.toLowerCase().includes(filter.toLowerCase())
    )
  }, [filter, transformedData])

  // ===== Kolom =====
  const columns: ColumnDef<HistoryRow>[] = [
    {
      id: "no",
      header: () => <div className="font-semibold text-center w-10">No</div>,
      cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
    },
    {
      accessorKey: "application_id",
      header: () => <div className="font-semibold">ID Pengajuan</div>,
      cell: ({ row }) => <div className="font-medium">{row.getValue("application_id")}</div>,
    },
    {
      accessorKey: "property_name",
      header: () => <div className="font-semibold">Nama Properti</div>,
      cell: ({ row }) => <div>{row.getValue("property_name")}</div>,
    },
    {
      accessorKey: "approval_date",
      header: () => <div className="font-semibold">Tanggal Pengajuan</div>,
      cell: ({ row }) => (
        <div className="font-medium">{formatDate(row.getValue("approval_date") as string)}</div>
      ),
    },
    {
      accessorKey: "status",
      header: () => <div className="font-semibold">Status</div>,
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        const getStatusConfig = (status: string) => {
          switch (status?.toUpperCase()) {
            case "PROPERTY_APPRAISAL":
              return {
                text: "Property Appraisal",
                bgColor: "bg-purple-200 hover:bg-purple-300",
                textColor: "text-purple-900",
                dotColor: "bg-purple-700"
              }
            case "DRAFT":
              return {
                text: "Draft",
                bgColor: "bg-gray-200 hover:bg-gray-300",
                textColor: "text-gray-900",
                dotColor: "bg-gray-700"
              }
            case "SUBMITTED":
              return {
                text: "Submitted",
                bgColor: "bg-blue-200 hover:bg-blue-300",
                textColor: "text-blue-900",
                dotColor: "bg-blue-700"
              }
            case "UNDER_REVIEW":
              return {
                text: "Under Review",
                bgColor: "bg-yellow-200 hover:bg-yellow-300",
                textColor: "text-yellow-900",
                dotColor: "bg-yellow-700"
              }
            case "APPROVED":
            case "APPROVE":
              return {
                text: "Approved",
                bgColor: "bg-green-200 hover:bg-green-300",
                textColor: "text-green-900",
                dotColor: "bg-green-700"
              }
            case "REJECTED":
            case "REJECT":
              return {
                text: "Rejected",
                bgColor: "bg-rose-200 hover:bg-rose-300",
                textColor: "text-rose-900",
                dotColor: "bg-rose-700"
              }
            case "CANCELLED":
              return {
                text: "Cancelled",
                bgColor: "bg-red-200 hover:bg-red-300",
                textColor: "text-red-900",
                dotColor: "bg-red-700"
              }
            case "DOCUMENT_VERIFICATION":
              return {
                text: "Document Verification",
                bgColor: "bg-indigo-200 hover:bg-indigo-300",
                textColor: "text-indigo-900",
                dotColor: "bg-indigo-700"
              }
            case "CREDIT_ANALYSIS":
              return {
                text: "Credit Analysis",
                bgColor: "bg-teal-200 hover:bg-teal-300",
                textColor: "text-teal-900",
                dotColor: "bg-teal-700"
              }
            case "APPROVAL_PENDING":
              return {
                text: "Approval Pending",
                bgColor: "bg-orange-200 hover:bg-orange-300",
                textColor: "text-orange-900",
                dotColor: "bg-orange-700"
              }
            case "DISBURSED":
              return {
                text: "Disbursed",
                bgColor: "bg-emerald-200 hover:bg-emerald-300",
                textColor: "text-emerald-900",
                dotColor: "bg-emerald-700"
              }
            default:
              return {
                text: status || "Unknown",
                bgColor: "bg-slate-200 hover:bg-slate-300",
                textColor: "text-slate-900",
                dotColor: "bg-slate-700"
              }
          }
        }

        const config = getStatusConfig(status)

        return (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setSelectedRow(row.original)
              setOpenDialog(true)
            }}
            className={`flex items-center gap-2 px-3 py-1 rounded-md font-semibold shadow-sm ${config.bgColor} ${config.textColor}`}
          >
            <span className={`h-2.5 w-2.5 rounded-full ${config.dotColor}`} />
            {config.text}
          </Button>
        )
      },
    },
    {
      id: "detail",
      header: () => <div className="font-semibold text-center">Detail</div>,
      cell: ({ row }) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const router = useRouter()
        return (
          <div className="text-center">
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push(`/dashboard/approval-history/detail/${row.original.id}`)}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              View Detail
            </Button>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
  })

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between py-4">
          <h2 className="text-lg font-semibold">Approval History</h2>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading approval history...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between py-4">
          <h2 className="text-lg font-semibold">Approval History</h2>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error: {error}</p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* --- Header Filter --- */}
      <div className="flex items-center justify-between py-4">
        <h2 className="text-lg font-semibold">Approval History</h2>
        <Input
          placeholder="Cari properti, kode aplikasi, atau alamat..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* --- Table --- */}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/80">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  Tidak ada data approval.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* --- Pagination --- */}
      <div className="flex justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>

      {/* --- Dialog Detail --- */}
      <React.Suspense fallback={null}>
        {selectedRow && (
          <ViewApprovalDetails
            open={openDialog}
            onOpenChange={setOpenDialog}
            data={{
              ...selectedRow,
              status: selectedRow.status,
            }}
          />
        )}
      </React.Suspense>
    </div>
  )
}
