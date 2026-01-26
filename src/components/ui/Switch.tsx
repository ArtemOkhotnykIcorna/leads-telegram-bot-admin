import { Switch as HeadlessSwitch } from "@headlessui/react";
import { cn } from "@/lib/cn";

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: "sm" | "md";
}

export function Switch({
  checked,
  onChange,
  label,
  disabled,
  size = "md",
}: SwitchProps) {
  const sizes = {
    sm: {
      switch: "h-5 w-9",
      dot: "h-3 w-3",
      translate: "translate-x-4",
    },
    md: {
      switch: "h-6 w-11",
      dot: "h-4 w-4",
      translate: "translate-x-5",
    },
  };

  return (
    <HeadlessSwitch.Group>
      <div className="flex items-center">
        <HeadlessSwitch
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className={cn(
            "relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent",
            "transition-colors duration-200 ease-in-out",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            checked ? "bg-blue-600" : "bg-gray-200",
            sizes[size].switch,
          )}
        >
          <span
            className={cn(
              "pointer-events-none inline-block transform rounded-full bg-white shadow ring-0",
              "transition duration-200 ease-in-out",
              checked ? sizes[size].translate : "translate-x-0",
              sizes[size].dot,
            )}
          />
        </HeadlessSwitch>
        {label && (
          <HeadlessSwitch.Label className="ml-3 text-sm font-medium text-gray-700 cursor-pointer">
            {label}
          </HeadlessSwitch.Label>
        )}
      </div>
    </HeadlessSwitch.Group>
  );
}
