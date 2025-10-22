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

import { customers } from "@/components/data/history"
import { properties } from "@/components/data/properties"

// Lazy load dialog agar tidak berat di awal
const ViewApprovalDetails = React.lazy(() => import("@/components/dialogs/ViewApprovalDetails"))

type HistoryRow = {
  id: string
  application_id: string
  customer_name: string
  property_name: string
  address: string
  price: number
  status: "approve" | "reject"
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

export default function ApprovalHistory() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [filter, setFilter] = React.useState("")
  const [selectedRow, setSelectedRow] = React.useState<HistoryRow | null>(null)
  const [openDialog, setOpenDialog] = React.useState(false)

  // 🔗 Gabungkan data customer dan property
  const joinedData: HistoryRow[] = React.useMemo(() => {
    return customers.map((cust) => {
      const prop = properties.find((p) => p.id === cust.property_id)
      return {
        id: cust.id,
        application_id: cust.application_id || `APP-${cust.id.padStart(3, "0")}`,
        customer_name: cust.name,
        property_name: prop?.title || "Properti tidak ditemukan",
        address: prop ? `${prop.address}, ${prop.city}` : "-",
        price: prop?.price || 0,
        status: cust.status,
        approval_date: cust.approval_date,
      }
    })
  }, [])

  const filteredData = React.useMemo(() => {
    return joinedData.filter((item) =>
      item.customer_name.toLowerCase().includes(filter.toLowerCase())
    )
  }, [filter, joinedData])

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
      accessorKey: "customer_name",
      header: () => <div className="font-semibold">Nama Customer</div>,
      cell: ({ row }) => <div>{row.getValue("customer_name")}</div>,
    },
    {
      accessorKey: "property_name",
      header: () => <div className="font-semibold">Nama Properti</div>,
      cell: ({ row }) => <div>{row.getValue("property_name")}</div>,
    },
    {
      accessorKey: "address",
      header: () => <div className="font-semibold">Alamat</div>,
      cell: ({ row }) => <div>{row.getValue("address")}</div>,
    },
    {
      accessorKey: "price",
      header: () => <div className="font-semibold">Harga</div>,
      cell: ({ row }) => {
        const price = row.getValue("price") as number
        return (
          <div className="font-medium">
            {price > 0 ? `Rp ${price.toLocaleString("id-ID")}` : "-"}
          </div>
        )
      },
    },
    {
      accessorKey: "approval_date",
      header: () => <div className="font-medium">Tanggal</div>,
      cell: ({ row }) => (
        <div className="font-semibold">{formatDate(row.getValue("approval_date") as string)}</div>
      ),
    },
    {
      accessorKey: "status",
      header: () => <div className="font-semibold">Status</div>,
      cell: ({ row }) => {
        const status = row.getValue("status") as "approve" | "reject"
        const approved = status === "approve"
        return (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setSelectedRow(row.original)
              setOpenDialog(true)
            }}
            className={`flex items-center gap-2 px-3 py-1 rounded-md font-semibold shadow-sm ${
              approved
                ? "text-green-900 bg-green-200 hover:bg-green-300"
                : "text-rose-900 bg-rose-200 hover:bg-rose-300"
            }`}
          >
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                approved ? "bg-green-700" : "bg-rose-700"
              }`}
            />
            {approved ? "Approved" : "Rejected"}
          </Button>
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

  return (
    <div className="w-full">
      {/* --- Header Filter --- */}
      <div className="flex items-center justify-between py-4">
        <h2 className="text-lg font-semibold">Approval History</h2>
        <Input
          placeholder="Cari nama customer..."
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
            data={selectedRow}
          />
        )}
      </React.Suspense>
    </div>
  )
}
