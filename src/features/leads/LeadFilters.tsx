import { useState } from "react";
import { Button, Input, Select } from "@/components/ui";
import { useCountries } from "@/hooks/queries/useCountries";
import { useDirections } from "@/hooks/queries/useDirections";
import { useSources } from "@/hooks/queries/useSources";
import type { LeadsFilter } from "@/types";

interface LeadFiltersProps {
  filters: LeadsFilter;
  onApply: (filters: LeadsFilter) => void;
  onReset: () => void;
}

const statusOptions = [
  { value: "", label: "Все статусы" },
  { value: "new", label: "Новый" },
  { value: "pending", label: "Ожидает" },
  { value: "processing", label: "В обработке" },
  { value: "sent", label: "Отправлен" },
  { value: "delivered", label: "Доставлен" },
  { value: "failed", label: "Ошибка" },
  { value: "rejected", label: "Отклонён" },
  { value: "duplicate", label: "Дубликат" },
];

export function LeadFilters({ filters, onApply, onReset }: LeadFiltersProps) {
  const [localFilters, setLocalFilters] = useState<LeadsFilter>(filters);

  const { data: countries } = useCountries();
  const { data: directions } = useDirections();
  const { data: sources } = useSources();

  const countryOptions = [
    { value: "", label: "Все страны" },
    ...(countries?.map((c) => ({
      value: c._id,
      label: `${c.flag || ""} ${c.name}`,
    })) || []),
  ];

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
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Поиск"
          placeholder="Телефон или имя..."
          value={localFilters.search || ""}
          onChange={(e) => handleChange("search", e.target.value)}
        />
      </div>

      <Select
        label="Статус"
        options={statusOptions}
        value={localFilters.status || ""}
        onChange={(e) => handleChange("status", e.target.value)}
      />

      <Select
        label="Страна"
        options={countryOptions}
        value={localFilters.countryId || ""}
        onChange={(e) => handleChange("countryId", e.target.value)}
      />

      <Select
        label="Направление"
        options={directionOptions}
        value={localFilters.directionId || ""}
        onChange={(e) => handleChange("directionId", e.target.value)}
      />

      <Select
        label="Источник"
        options={sourceOptions}
        value={localFilters.sourceId || ""}
        onChange={(e) => handleChange("sourceId", e.target.value)}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Дата от"
          type="date"
          value={localFilters.startDate || ""}
          onChange={(e) => handleChange("startDate", e.target.value)}
        />
        <Input
          label="Дата до"
          type="date"
          value={localFilters.endDate || ""}
          onChange={(e) => handleChange("endDate", e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="ghost" onClick={handleReset}>
          Сбросить
        </Button>
        <Button onClick={handleApply}>Применить</Button>
      </div>
    </div>
  );
}
