"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { ArrowUpDown, Settings2, ChevronDown, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { customers, Customer } from "@/components/data/customers"
import ViewCustomerDialog from "@/components/dialogs/ViewCustomerDialogs"

export default function CustomerTableDemo() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null)
  const [showDialog, setShowDialog] = React.useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = React.useState(false)
  const [selectedPaymentId, setSelectedPaymentId] = React.useState<string | null>(null)

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setShowDialog(true)
  }

  const columns: ColumnDef<Customer>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: () => <div className="font-semibold">Name</div>,
      cell: ({ row }) => <div className="capitalize">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-semibold p-0 m-0 h-0"
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
    },
    {
      accessorKey: "phone",
      header: () => <div className="font-semibold">Phone</div>,
      cell: ({ row }) => {
        const phone = row.getValue("phone") as string
        return <div className="text-center font-medium">{phone}</div>
      },
    },
    {
      id: "actions",
      header: () => <div className="font-semibold text-center">Action</div>,
      enableHiding: false,
      cell: ({ row }) => {
        const customer = row.original
        return (
          <div className="flex justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-9 w-9 rounded-lg border-muted-foreground/20 hover:bg-muted"
                >
                  <Settings2 className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleViewCustomer(customer)}>
                  View Customer Detail
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(customer.id)}
                >
                  Copy Detail
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => console.log("Delete", customer.id)}
                  className="text-red-500 focus:text-red-600"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: customers,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
  })

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter emails..."
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <Table className="w-full border-collapse">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                // className="bg-muted/80 divide-x divide-border" // 🔹 header abu & garis vertikal
                className="bg-muted/80 divide-x divide-border h-2"
              >
                {/* Kolom nomor */}
                <TableHead className="py-2 px-3 text-sm font-semibold text-foreground text-center w-[60px]">
                  No
                </TableHead>

                {headerGroup.headers
                  // 🔹 Hilangkan header checkbox/select
                  .filter((header) => header.column.id !== "select")
                  .map((header) => (
                    <TableHead
                      key={header.id}
                      className="py-2 px-3 text-sm font-semibold text-foreground text-center"
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table
                .getRowModel()
                .rows.map((row, index) => (
                  <TableRow
                    key={row.id}
                    className="hover:bg-muted/30 transition-colors duration-150 divide-x divide-border"
                  >
                    {/* Kolom nomor urut */}
                    <TableCell className="py-3 px-4 text-sm font-medium text-center w-[60px]">
                      {index + 1}
                    </TableCell>

                    {row
                      .getVisibleCells()
                      // 🔹 Hilangkan sel checkbox/select
                      .filter((cell) => cell.column.id !== "select")
                      .map((cell) => (
                        <TableCell
                          key={cell.id}
                          style={{
                            textAlign: cell.column.id === "actions" ? "center" : "left",
                          }}
                          className={`
                            py-3 px-4 text-sm
                            ${
                              cell.column.id === "email"
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>



      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
        </div>
        <div className="space-x-2">
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

      <ViewCustomerDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        customer={selectedCustomer}
      />

      {/* <PaymentDetailsDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        customerId={selectedPaymentId}
      /> */}
    </div>
  )
}
