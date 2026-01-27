import { useState } from "react";
import { Button, Select } from "@/components/ui";
import { useDirections } from "@/hooks/queries/useDirections";
import { useSources } from "@/hooks/queries/useSources";
import type { LeadsFilter, LeadStatus } from "@/types";

interface LeadFiltersProps {
  filters: LeadsFilter;
  onApply: (filters: LeadsFilter) => void;
  onReset: () => void;
}

// Статусы согласно API документации
const statusOptions: { value: LeadStatus | ""; label: string }[] = [
  { value: "", label: "Все статусы" },
  { value: "new", label: "Новые" },
  { value: "processing", label: "В обработке" },
  { value: "published", label: "Опубликованы" },
  { value: "failed", label: "Ошибки" },
  { value: "duplicate", label: "Дубликаты" },
  { value: "skipped", label: "Пропущены" },
];

export function LeadFilters({ filters, onApply, onReset }: LeadFiltersProps) {
  const [localFilters, setLocalFilters] = useState<LeadsFilter>(filters);

  const { data: directions } = useDirections();
  const { data: sources } = useSources();

  const directionOptions = [
    { value: "", label: "Все направления" },
    ...(directions?.map((d) => ({ value: d._id, label: d.name })) || []),
  ];

  const sourceOptions = [
    { value: "", label: "Все источники" },
    ...(sources?.map((s) => ({ value: s._id, label: s.name })) || []),
  ];

  const handleChange = (key: keyof LeadsFilter, value: string) => {
    setLocalFilters((prev: LeadsFilter) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const handleApply = () => {
    onApply(localFilters);
  };

  const handleReset = () => {
    setLocalFilters({});
    onReset();
  };

  return (
    <div className="space-y-4">
      <Select
        label="Статус"
        options={statusOptions}
        value={localFilters.status || ""}
        onChange={(e) => handleChange("status", e.target.value)}
      />

      <Select
        label="Источник"
        options={sourceOptions}
        value={localFilters.sourceId || ""}
        onChange={(e) => handleChange("sourceId", e.target.value)}
      />

      <Select
        label="Направление"
        options={directionOptions}
        value={localFilters.directionId || ""}
        onChange={(e) => handleChange("directionId", e.target.value)}
      />

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="ghost" onClick={handleReset}>
          Сбросить
        </Button>
        <Button onClick={handleApply}>Применить</Button>
      </div>
    </div>
  );
}
