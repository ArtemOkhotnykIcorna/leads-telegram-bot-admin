import { cn } from "@/lib/cn";

export interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full">{children}</table>
    </div>
  );
}

export interface TableHeadProps {
  children: React.ReactNode;
  className?: string;
}

export function TableHead({ children, className }: TableHeadProps) {
  return (
    <thead className={cn("bg-gray-50 border-b border-gray-200", className)}>
      {children}
    </thead>
  );
}

export interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function TableBody({ children, className }: TableBodyProps) {
  return (
    <tbody className={cn("divide-y divide-gray-200", className)}>
      {children}
    </tbody>
  );
}

export interface TableRowProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function TableRow({ children, className, onClick }: TableRowProps) {
  return (
    <tr
      className={cn(
        "hover:bg-gray-50 transition-colors",
        onClick && "cursor-pointer",
        className,
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

export interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  header?: boolean;
}

export function TableCell({ children, className, header }: TableCellProps) {
  const Component = header ? "th" : "td";
  return (
    <Component
      className={cn(
        "px-4 py-3 text-sm",
        header ? "text-left font-medium text-gray-500" : "text-gray-900",
        className,
      )}
    >
      {children}
    </Component>
  );
}
