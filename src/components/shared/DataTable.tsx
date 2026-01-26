import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { Pagination, Spinner, EmptyState, Button } from "@/components/ui";

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  isLoading?: boolean;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  /** Включить клиентскую пагинацию (по умолчанию true) */
  clientPagination?: boolean;
  /** Размер страницы для клиентской пагинации */
  pageSize?: number;
  emptyState?: {
    title?: string;
    description?: string;
    action?: React.ReactNode;
  };
}

export function DataTable<T>({
  data,
  columns,
  isLoading,
  pagination,
  clientPagination = true,
  pageSize = 20,
  emptyState,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <EmptyState
        title={emptyState?.title}
        description={emptyState?.description}
        action={emptyState?.action}
      />
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={cn(
                      "px-4 py-3 text-left text-sm font-medium text-gray-500",
                      header.column.getCanSort() &&
                        "cursor-pointer select-none",
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-2">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {header.column.getIsSorted() &&
                        (header.column.getIsSorted() === "asc" ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        ))}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 text-sm text-gray-900">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Серверная пагинация */}
      {pagination && (
        <div className="px-4 py-3 border-t border-gray-200">
          <Pagination
            page={pagination.page}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onPageChange={pagination.onPageChange}
          />
        </div>
      )}

      {/* Клиентская пагинация */}
      {!pagination && clientPagination && table.getPageCount() > 1 && (
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Показано {table.getState().pagination.pageIndex * pageSize + 1}-
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * pageSize,
              data.length,
            )}{" "}
            из {data.length}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft size={16} />
              Назад
            </Button>
            <span className="text-sm text-gray-700">
              Страница {table.getState().pagination.pageIndex + 1} из{" "}
              {table.getPageCount()}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Вперед
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
