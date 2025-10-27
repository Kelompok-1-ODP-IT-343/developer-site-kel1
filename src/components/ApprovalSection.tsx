//Data diambil dari API KPR Applications

"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getKPRApplicationsProgress } from "@/lib/coreApi"
import { useRouter } from "next/navigation"
import { Calculator, Settings2 } from "lucide-react"

// KPR Application interface based on API response
interface KPRApplication {
  id: number
  applicantName: string
  applicantEmail: string
  applicantPhone: string
  aplikasiKode: string
  namaProperti: string
  alamat: string
  harga: number
  tanggal: string
  jenis: string
}

interface ApiResponse {
  success: boolean
  message: string
  data: KPRApplication[]
  timestamp: string
  path: string | null
}

export default function ApprovalTable() {
  const router = useRouter()
  const [kprApplications, setKprApplications] = React.useState<KPRApplication[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Fetch KPR applications data
  React.useEffect(() => {
    const fetchKPRApplications = async () => {
      try {
        setLoading(true)
        const response: ApiResponse = await getKPRApplicationsProgress()
        if (response.success) {
          setKprApplications(response.data)
        } else {
          setError(response.message || "Failed to fetch KPR applications")
        }
      } catch (err) {
        console.error("Error fetching KPR applications:", err)
        setError("Failed to fetch KPR applications")
      } finally {
        setLoading(false)
      }
    }

    fetchKPRApplications()
  }, [])

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleActionClick = (application: KPRApplication) => {
    router.push(`/dashboard/detail/${application.id}`)
  }

  const columns: ColumnDef<KPRApplication>[] = [
    {
      accessorKey: "aplikasiKode",
      header: () => <div className="font-semibold">Application Code</div>,
      cell: ({ row }) => <div className="font-medium">{row.getValue("aplikasiKode")}</div>,
    },
    {
      accessorKey: "applicantName",
      header: () => <div className="font-semibold">Applicant Name</div>,
      cell: ({ row }) => <div className="capitalize">{row.getValue("applicantName")}</div>,
    },
    {
      accessorKey: "applicantEmail",
      header: () => <div className="font-semibold">Email</div>,
      cell: ({ row }) => <div className="lowercase">{row.getValue("applicantEmail")}</div>,
    },
    {
      accessorKey: "namaProperti",
      header: () => <div className="font-semibold">Property</div>,
      cell: ({ row }) => <div className="font-medium">{row.getValue("namaProperti")}</div>,
    },
    {
      accessorKey: "harga",
      header: () => <div className="font-semibold">Price</div>,
      cell: ({ row }) => (
        <div className="text-right font-medium">{formatCurrency(row.getValue("harga"))}</div>
      ),
    },
    {
      accessorKey: "jenis",
      header: () => <div className="font-semibold">KPR Type</div>,
      cell: ({ row }) => <div className="font-medium">{row.getValue("jenis")}</div>,
    },
    {
      accessorKey: "tanggal",
      header: () => <div className="font-semibold">Date</div>,
      cell: ({ row }) => (
        <div className="font-medium">{formatDate(row.getValue("tanggal"))}</div>
      ),
    },
    {
      id: "action",
      header: () => (
        <div className="text-center">
          <Calculator className="inline-block w-4 h-4 text-muted-foreground" />
        </div>
      ),
      cell: ({ row }) => {
        const application = row.original
        return (
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              aria-label="Simulate"
              onClick={() => handleActionClick(application)}
              className="flex items-center gap-2"
            >
              <Settings2 className="w-4 h-4" />
              Action
            </Button>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: kprApplications,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading KPR applications...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center py-8">
          <div className="text-red-500">Error: {error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter by applicant name or email..."
          className="max-w-sm"
          onChange={(e) => {
            const value = e.target.value.toLowerCase()
            const filtered = kprApplications.filter((app) =>
              app.applicantName.toLowerCase().includes(value) ||
              app.applicantEmail.toLowerCase().includes(value) ||
              app.aplikasiKode.toLowerCase().includes(value)
            )
            table.options.data = filtered.length ? filtered : kprApplications
          }}
        />
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <Table className="w-full border-collapse">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="bg-muted/80 divide-x divide-border"
              >
                {/* Kolom nomor */}
                <TableHead className="py-3 px-4 text-sm font-semibold text-foreground text-center w-[60px]">
                  No
                </TableHead>

                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={`
                      py-3 px-4 text-sm font-semibold text-foreground
                      ${header.column.id === "action" ? "text-center" : "text-center"}
                    `}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-muted/30 transition-colors duration-150 divide-x divide-border"
                >
                  {/* Kolom nomor urut */}
                  <TableCell className="py-3 px-4 text-sm font-medium text-center w-[60px]">
                    {index + 1}
                  </TableCell>

                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{
                        textAlign: cell.column.id === "action" ? "center" : "left",
                      }}
                      className={`
                        py-3 px-4 text-sm
                        ${
                          cell.column.id === "applicantEmail"
                            ? "text-muted-foreground"
                            : "font-medium"
                        }
                      `}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().length + 1}
                  className="h-24 text-center text-muted-foreground"
                >
                  No KPR applications found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
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
    </div>
  )
}
