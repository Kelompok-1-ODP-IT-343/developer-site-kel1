// Data diambil dari API KPR Applications
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

interface KPRApplication {
  id: number
  applicantName: string
  applicantEmail: string
  applicantPhone: string
  // field lain tetap ada tapi tidak ditampilkan
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
  const [rawData, setRawData] = React.useState<KPRApplication[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [query, setQuery] = React.useState("")

  React.useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        const res: ApiResponse = await getKPRApplicationsProgress()
        if (res?.success) setRawData(res.data ?? [])
        else setError(res?.message || "Failed to fetch KPR applications")
      } catch (e) {
        console.error(e)
        setError("Failed to fetch KPR applications")
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const handleActionClick = (row: KPRApplication) => {
    router.push(`/dashboard/detail/${row.id}`)
  }

  // Filter seperti versi customers (berdasarkan email)
  const filteredData = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rawData
    return rawData.filter((app) => app.applicantEmail?.toLowerCase().includes(q))
  }, [rawData, query])

  // === KOLUM: Samakan dengan versi customers ===
  const columns = React.useMemo<ColumnDef<KPRApplication>[]>(
    () => [
      {
        accessorKey: "applicantName",
        header: () => <div className="font-semibold">Name</div>,
        cell: ({ row }) => <div className="capitalize">{row.getValue("applicantName")}</div>,
      },
      {
        accessorKey: "applicantEmail",
        header: () => <div className="font-semibold">Email</div>,
        cell: ({ row }) => <div className="lowercase">{row.getValue("applicantEmail")}</div>,
      },
      {
        accessorKey: "applicantPhone",
        header: () => <div className="font-semibold">Phone</div>,
        cell: ({ row }) => (
          <div className="text-center font-medium">{row.getValue("applicantPhone")}</div>
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
          const app = row.original
          return (
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                aria-label="Simulate"
                onClick={() => handleActionClick(app)}
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
      {/* Filter bar seperti customers */}
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter emails..."
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
