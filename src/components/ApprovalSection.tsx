// app/(dashboard)/approval-table.tsx
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
import { useRouter } from "next/navigation"
import { Calculator, Settings2 } from "lucide-react"

// ⬇️ your existing API
import { getKPRApplicationsProgress } from "@/lib/coreApi"

// ========= Helpers =========
type UnifiedRow = {
  id: number
  aplikasiKode: string            // ID Pengajuan
  applicantName: string
  applicantEmail?: string
  applicantPhone?: string
  namaProperti?: string
  tanggal?: string | null         // ISO string preferred
  status?: string                  // Status aplikasi
}

// Best-effort normalization from any API item to UnifiedRow
function normalizeItem(item: any): UnifiedRow {
  return {
    id: Number(item.id ?? item.applicationId ?? 0),
    aplikasiKode:
      item.aplikasiKode ??
      item.applicationNumber ??
      item.application_code ??
      "-",
    applicantName:
      item.applicantName ??
      item.name ??
      item.fullName ??
      "-",
    applicantEmail:
      item.applicantEmail ??
      item.email ??
      "",
    applicantPhone:
      item.applicantPhone ??
      item.phone ??
      item.phoneNumber ??
      "",
    namaProperti:
      item.namaProperti ??
      item.propertyName ??
      item.developerName ??
      item.propertyTitle ??
      "-",
    tanggal:
      item.tanggal ??
      item.submittedAt ??
      item.createdAt ??
      item.reviewedAt ??
      null,
    status:
      item.status ??
      item.applicationStatus ??
      "",
  }
}

function formatDate(dateString?: string | null) {
  if (!dateString) return "-"
  const d = new Date(dateString)
  if (isNaN(d.getTime())) return "-"
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

// ========= Component =========
export default function ApprovalTable() {
  const router = useRouter()
  const [raw, setRaw] = React.useState<any[]>([])
  const [rows, setRows] = React.useState<UnifiedRow[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [query, setQuery] = React.useState("")

  React.useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await getKPRApplicationsProgress()
        if (res?.success) {
          const list: any[] = Array.isArray(res.data) ? res.data : []
          setRaw(list)
          // Filter to show only PENDING status applications
          const normalizedList = list.map(normalizeItem)
          const pendingOnly = normalizedList.filter((item) => {
            const status = (item.status ?? "").toUpperCase()
            return status.includes("SUBMITTED")
          })
          setRows(pendingOnly)
        } else {
          setError(res?.message || "Failed to fetch KPR applications")
        }
      } catch (e) {
        console.error(e)
        setError("Failed to fetch KPR applications")
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  // Filter: email if available, else by aplikasiKode
  const filteredData = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((r) => {
      const email = (r.applicantEmail ?? "").toLowerCase()
      const kode = (r.aplikasiKode ?? "").toLowerCase()
      return email.includes(q) || kode.includes(q)
    })
  }, [rows, query])

  const handleActionClick = (row: UnifiedRow) => {
    // Pick one route style; adjust if your detail route differs:
    // Option A: detail by id
    router.push(`/dashboard/detail/${row.id}`)

    // Option B (alternative): simulation page with query param
    // router.push(`/dashboard/simulate?id=${row.id}`)
  }

  // === Columns (unified) ===
  const columns = React.useMemo<ColumnDef<UnifiedRow>[]>(
    () => [
      {
        accessorKey: "aplikasiKode",
        header: () => <div className="font-semibold">ID Pengajuan</div>,
        cell: ({ row }) => <div className="capitalize">{row.getValue("aplikasiKode")}</div>,
      },
      {
        accessorKey: "applicantName",
        header: () => <div className="font-semibold">Name</div>,
        cell: ({ row }) => <div className="capitalize">{row.getValue("applicantName")}</div>,
      },
      {
        accessorKey: "applicantPhone",
        header: () => <div className="font-semibold">Phone</div>,
        cell: ({ row }) => (
          <div className="text-center font-medium">
            {(row.getValue("applicantPhone") as string) || "-"}
          </div>
        ),
      },
      {
        accessorKey: "namaProperti",
        header: () => <div className="font-semibold">Nama Properti</div>,
        cell: ({ row }) => <div className="font-medium">{row.getValue("namaProperti") || "-"}</div>,
      },
      {
        accessorKey: "tanggal",
        header: () => <div className="font-semibold">Tanggal</div>,
        cell: ({ row }) => (
          <div className="text-center">{formatDate(row.getValue("tanggal") as string | null)}</div>
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
          const item = row.original
          return (
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                aria-label="Simulate"
                onClick={() => handleActionClick(item)}
                className="flex items-center gap-2"
              >
                <Settings2 className="w-4 h-4" />
                Action
              </Button>
            </div>
          )
        },
      },
    ],
    []
  )

  const table = useReactTable({
    data: filteredData,
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
      {/* Filter bar (email / ID Pengajuan) */}
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter by email or ID Pengajuan..."
          className="max-w-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
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
                  {/* Nomor urut */}
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
                        ${cell.column.id === "applicantEmail" ? "text-muted-foreground" : "font-medium"}
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
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
