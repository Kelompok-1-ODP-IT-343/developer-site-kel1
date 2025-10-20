//data masih pake dummy properties.ts

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
import { ChevronDown, Settings2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { properties, Property } from "@/components/data/properties"
import { useRouter } from "next/navigation"

// lazy load dialog biar ga render berat
const PropertyDetailsDialog = React.lazy(
  () => import("@/components/dialogs/PropertyDetailsDialog")
)

export default function PropertiesList() {
  const router = useRouter()
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [filter, setFilter] = React.useState("")
  const [selectedProperty, setSelectedProperty] = React.useState<Property | null>(null)
  const [showDialog, setShowDialog] = React.useState(false)

  // filter berdasarkan title
  const filteredData = React.useMemo(() => {
    const data = properties.filter((p) =>
      p.title.toLowerCase().includes(filter.toLowerCase())
    )
    return data.slice(0, 10)
  }, [filter])

  const handleDetails = (property: Property) => {
    setSelectedProperty(property)
    setShowDialog(true)
  }

  const handleActionClick = (property: Property) => {
    console.log("Navigating with ID:", property.id)
    // kirim ID properti lewat query parameter
    router.push(`/dashboard/inputbydev?id=${property.id}`)
  }

  const columns: ColumnDef<Property>[] = [
    {
      id: "no",
      header: () => <div className="font-semibold text-center w-10">No</div>,
      cell: ({ row }) => (
        <div className="text-center w-10">{row.index + 1}</div>
      ),
    },
    {
      accessorKey: "title",
      header: () => <div className="font-semibold">Nama Properti</div>,
      cell: ({ row }) => <div className="font-medium">{row.getValue("title")}</div>,
    },
    {
      accessorKey: "company_name",
      header: () => <div className="font-semibold">Developer</div>,
      cell: ({ row }) => <div>{row.getValue("company_name")}</div>,
    },
    {
      accessorKey: "address",
      header: () => <div className="font-semibold">Alamat</div>,
      cell: ({ row }) => (
        <div className="truncate max-w-xs text-muted-foreground">
          {row.getValue("address")}
        </div>
      ),
    },
    {
      accessorKey: "price",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-semibold"
        >
          Harga
          <ChevronDown className="ml-1 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const harga = row.getValue("price") as number
        return (
          <div className="text-left font-medium">
            Rp {harga.toLocaleString("id-ID")}
          </div>
        )
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const property = row.original
        return (
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              aria-label="Simulate"
              onClick={() => handleActionClick(property)}
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
      {/* Filter Input */}
      <div className="flex items-center py-4">
        <Input
          placeholder="Cari nama properti..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/80 h-2">
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
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Tidak ada data properti.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
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

      {/* Lazy Loaded Dialog */}
      {showDialog && (
        <React.Suspense fallback={null}>
          <PropertyDetailsDialog
            open={showDialog}
            onOpenChange={setShowDialog}
            property={selectedProperty}
          />
        </React.Suspense>
      )}
    </div>
  )
}
