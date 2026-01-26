import { forwardRef } from "react";
import { cn } from "@/lib/cn";

export interface CheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const checkboxId = id || props.name;

    return (
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            className={cn(
              "w-4 h-4 border-gray-300 rounded text-blue-600",
              "focus:ring-blue-500 focus:ring-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-red-500",
              className,
            )}
            {...props}
          />
        </div>
        {label && (
          <div className="ml-2 text-sm">
            <label
              htmlFor={checkboxId}
              className={cn(
                "font-medium",
                error ? "text-red-600" : "text-gray-700",
              )}
            >
              {label}
            </label>
          </div>
        )}
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";
