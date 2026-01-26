import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useRoutingRule,
  useCreateRoutingRule,
  useUpdateRoutingRule,
} from "@/hooks/queries/useRouting";
import { useCountries } from "@/hooks/queries/useCountries";
import { useDirections } from "@/hooks/queries/useDirections";
import { useSources } from "@/hooks/queries/useSources";
import { useGroups } from "@/hooks/queries/useGroups";
import { Button, Input, Textarea, Switch, Checkbox } from "@/components/ui";

const routingSchema = z.object({
  name: z.string().min(1, "Обязательное поле"),
  description: z.string().optional(),
  priority: z.coerce.number().min(1).default(100),
  conditions: z.object({
    countries: z.array(z.string()).default([]),
    directions: z.array(z.string()).default([]),
    sources: z.array(z.string()).default([]),
  }),
  targetGroups: z.array(z.string()).min(1, "Выберите хотя бы одну группу"),
  isActive: z.boolean().default(true),
});

type RoutingFormData = z.infer<typeof routingSchema>;

interface RoutingFormProps {
  ruleId: string | null;
  onSuccess: () => void;
}

export function RoutingForm({ ruleId, onSuccess }: RoutingFormProps) {
  const isEditing = !!ruleId;
  const { data: rule } = useRoutingRule(ruleId || "");
  const { data: countries } = useCountries();
  const { data: directions } = useDirections();
  const { data: sources } = useSources();
  const { data: groups } = useGroups();

  const createMutation = useCreateRoutingRule();
  const updateMutation = useUpdateRoutingRule();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RoutingFormData>({
    resolver: zodResolver(routingSchema),
    defaultValues: {
      name: "",
      description: "",
      priority: 100,
      conditions: {
        countries: [],
        directions: [],
        sources: [],
      },
      targetGroups: [],
      isActive: true,
    },
  });

  useEffect(() => {
    if (rule && isEditing) {
      const conditions = rule.conditions || {};
      reset({
        name: rule.name,
        description: rule.description || "",
        priority: rule.priority,
        conditions: {
          countries: conditions.countries || [],
          directions: conditions.directions || [],
          sources: conditions.sources || [],
        },
        targetGroups: rule.targetGroups || [],
        isActive: rule.isActive,
      });
    }
  }, [rule, isEditing, reset]);

  const onSubmit = async (data: RoutingFormData) => {
    if (isEditing) {
      await updateMutation.mutateAsync({ id: ruleId!, dto: data });
    } else {
      await createMutation.mutateAsync(data);
    }
    onSuccess();
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const selectedCountries = watch("conditions.countries");
  const selectedDirections = watch("conditions.directions");
  const selectedSources = watch("conditions.sources");
  const selectedGroups = watch("targetGroups");

  const toggleArrayItem = (
    field:
      | "conditions.countries"
      | "conditions.directions"
      | "conditions.sources"
      | "targetGroups",
    value: string,
    current: string[],
  ) => {
    if (current.includes(value)) {
      setValue(
        field,
        current.filter((v) => v !== value),
      );
    } else {
      setValue(field, [...current, value]);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Название"
          error={errors.name?.message}
          {...register("name")}
        />
        <Input
          label="Приоритет"
          type="number"
          hint="Меньше = выше приоритет"
          error={errors.priority?.message}
          {...register("priority")}
        />
      </div>

      <Textarea label="Описание" {...register("description")} />

      <div className="border-t pt-4">
        <h4 className="font-medium text-gray-900 mb-3">Условия (фильтры)</h4>
        <p className="text-sm text-gray-500 mb-4">
          Если условия не выбраны, правило применяется ко всем лидам
        </p>

        {/* Countries */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Страны
          </label>
          <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto p-2 border rounded">
            {countries
              ?.filter((c) => c.isActive)
              .map((country) => (
                <Checkbox
                  key={country._id}
                  label={`${country.flag} ${country.name}`}
                  checked={selectedCountries.includes(country._id)}
                  onChange={() =>
                    toggleArrayItem(
                      "conditions.countries",
                      country._id,
                      selectedCountries,
                    )
                  }
                />
              ))}
          </div>
        </div>

        {/* Directions */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Направления
          </label>
          <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto p-2 border rounded">
            {directions
              ?.filter((d) => d.isActive)
              .map((direction) => (
                <Checkbox
                  key={direction._id}
                  label={direction.name}
                  checked={selectedDirections.includes(direction._id)}
                  onChange={() =>
                    toggleArrayItem(
                      "conditions.directions",
                      direction._id,
                      selectedDirections,
                    )
                  }
                />
              ))}
          </div>
        </div>

        {/* Sources */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Источники
          </label>
          <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto p-2 border rounded">
            {sources
              ?.filter((s) => s.isActive)
              .map((source) => (
                <Checkbox
                  key={source._id}
                  label={source.name}
                  checked={selectedSources.includes(source._id)}
                  onChange={() =>
                    toggleArrayItem(
                      "conditions.sources",
                      source._id,
                      selectedSources,
                    )
                  }
                />
              ))}
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="font-medium text-gray-900 mb-3">Целевые группы *</h4>
        {errors.targetGroups && (
          <p className="text-sm text-red-500 mb-2">
            {errors.targetGroups.message}
          </p>
        )}
        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded">
          {groups
            ?.filter((g) => g.isActive)
            .map((group) => (
              <Checkbox
                key={group._id}
                label={group.name}
                checked={selectedGroups.includes(group._id)}
                onChange={() =>
                  toggleArrayItem("targetGroups", group._id, selectedGroups)
                }
              />
            ))}
        </div>
      </div>

      <div className="flex items-center justify-between border-t pt-4">
        <span className="text-sm font-medium text-gray-700">Активно</span>
        <Switch
          checked={watch("isActive")}
          onChange={(checked) => setValue("isActive", checked)}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onSuccess}>
          Отмена
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {isEditing ? "Сохранить" : "Создать"}
        </Button>
      </div>
    </form>
  );
}
