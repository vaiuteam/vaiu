"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  SortingState,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  /** Total number of matching records on the server (for pagination label). */
  totalCount?: number;
  /** Current 0-based page index (server-side). */
  pageIndex?: number;
  /** Page size used on the server. */
  pageSize?: number;
  /** Called when user clicks Previous / Next. */
  onPageChange?: (page: number) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  totalCount,
  pageIndex = 0,
  pageSize = 20,
  onPageChange,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );

  const isServerPaginated = typeof onPageChange === "function";
  const pageCount = isServerPaginated && totalCount != null
    ? Math.ceil(totalCount / pageSize)
    : undefined;

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  className=""
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell className="px-6" key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        {isServerPaginated && pageCount != null && (
          <span className="mr-auto text-sm text-muted-foreground">
            Page {pageIndex + 1} of {pageCount}
            {totalCount != null && ` (${totalCount} total)`}
          </span>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => isServerPaginated ? onPageChange(pageIndex - 1) : undefined}
          disabled={isServerPaginated ? pageIndex === 0 : true}
          className="bg-slate-200 text-black hover:bg-black"
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => isServerPaginated ? onPageChange(pageIndex + 1) : undefined}
          disabled={isServerPaginated
            ? (pageCount != null ? pageIndex >= pageCount - 1 : data.length < pageSize)
            : true}
          className="bg-slate-200 text-black"
        >
          Next
        </Button>
      </div>
    </>
  );
}
