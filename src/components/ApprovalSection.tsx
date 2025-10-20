//Data masih diambil dari customers.ts

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
import { customers, Customer } from "@/components/data/customers"
// import { ArrowUpIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { Calculator, Settings2 } from "lucide-react"

export default function ApprovalTable() {
  const router = useRouter()

  const handleActionClick = (customer: Customer) => {
    router.push(`/dashboard/simulate?id=${customer.id}`)
  }


  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: "name",
      header: () => <div className="font-semibold">Name</div>,
      cell: ({ row }) => <div className="capitalize">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "email",
      header: () => <div className="font-semibold">Email</div>,
      cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
    },
    {
      accessorKey: "phone",
      header: () => <div className="font-semibold">Phone</div>,
      cell: ({ row }) => (
        <div className="text-center font-medium">{row.getValue("phone")}</div>
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
        const customer = row.original
        return (
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              aria-label="Simulate"
              onClick={() => handleActionClick(customer)}
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
    data: customers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter emails..."
          className="max-w-sm"
          onChange={(e) => {
            const value = e.target.value.toLowerCase()
            const filtered = customers.filter((c) =>
              c.email.toLowerCase().includes(value)
            )
            table.options.data = filtered.length ? filtered : customers
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
