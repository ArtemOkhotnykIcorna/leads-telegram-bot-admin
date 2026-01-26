import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useSource,
  useCreateSource,
  useUpdateSource,
  useParsingTemplates,
} from "@/hooks/queries/useSources";
import { useDirections } from "@/hooks/queries/useDirections";
import { Button, Input, Textarea, Select } from "@/components/ui";

const sourceSchema = z.object({
  name: z.string().min(1, "Обязательное поле"),
  slug: z.string().optional(),
  type: z.literal("telegram_group"),
  description: z.string().optional(),
  telegramChatId: z.string().optional(),
  telegramUsername: z.string().optional(),
  directionIds: z.array(z.string()).min(1, "Выберите хотя бы одно направление"),
  parsingTemplateKey: z.string().optional(),
  isActive: z.boolean().default(true),
});

type SourceFormData = z.infer<typeof sourceSchema>;

interface SourceFormProps {
  sourceId: string | null;
  onSuccess: () => void;
}

export function SourceForm({ sourceId, onSuccess }: SourceFormProps) {
  const [selectedDirections, setSelectedDirections] = useState<string[]>([]);
  const isEditing = !!sourceId;
  const { data: source } = useSource(sourceId || "");
  const { data: directions } = useDirections();
  const { data: templates } = useParsingTemplates();
  const createMutation = useCreateSource();
  const updateMutation = useUpdateSource();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SourceFormData>({
    resolver: zodResolver(sourceSchema),
    defaultValues: {
      name: "",
      slug: "",
      type: "telegram_group",
      description: "",
      telegramChatId: "",
      telegramUsername: "",
      directionIds: [],
      parsingTemplateKey: "universal",
      isActive: true,
    },
  });

  const selectedTemplate = watch("parsingTemplateKey");

  useEffect(() => {
    if (source && isEditing) {
      // Обрабатываем directionIds - могут быть как объекты, так и строки
      const dirIds =
        source.directionIds?.map((d) =>
          typeof d === "object" && d !== null ? d._id : d,
        ) || [];
      setSelectedDirections(dirIds);
      reset({
        name: source.name,
        slug: source.slug,
        type: "telegram_group",
        description: source.description || "",
        telegramChatId: source.telegramChatId || "",
        telegramUsername: source.telegramUsername || "",
        directionIds: dirIds,
        parsingTemplateKey: "universal",
        isActive: source.isActive,
      });
    }
  }, [source, isEditing, reset]);

  const onSubmit = async (data: SourceFormData) => {
    const payload = {
      name: data.name,
      slug: data.slug || undefined,
      type: "telegram_group" as const,
      description: data.description || undefined,
      telegramChatId: data.telegramChatId || undefined,
      telegramUsername: data.telegramUsername || undefined,
      directionIds: data.directionIds,
      isActive: data.isActive,
    };

    if (isEditing) {
      await updateMutation.mutateAsync({
        id: sourceId!,
        dto: {
          name: payload.name,
          description: payload.description,
          directionIds: payload.directionIds,
          isActive: payload.isActive,
        },
      });
    } else {
      await createMutation.mutateAsync(payload);
    }
    onSuccess();
  };

  const handleDirectionToggle = (directionId: string) => {
    const newSelection = selectedDirections.includes(directionId)
      ? selectedDirections.filter((id) => id !== directionId)
      : [...selectedDirections, directionId];

    setSelectedDirections(newSelection);
    setValue("directionIds", newSelection);
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Название"
        error={errors.name?.message}
        {...register("name")}
      />

      {!isEditing && (
        <Input
          label="Slug (опционально)"
          placeholder="crypto-leads-ua"
          {...register("slug")}
        />
      )}

      {/* Telegram поля */}
      {!isEditing && (
        <>
          <Input
            label="Telegram Chat ID"
            placeholder="-1001234567890"
            {...register("telegramChatId")}
          />
          <Input
            label="@username (опционально)"
            placeholder="@channel_name"
            {...register("telegramUsername")}
          />
        </>
      )}

      {/* Выбор направлений */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Направления *
        </label>
        <div className="border rounded-lg divide-y max-h-40 overflow-y-auto">
          {directions?.map((direction) => (
            <label
              key={direction._id}
              className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedDirections.includes(direction._id)}
                onChange={() => handleDirectionToggle(direction._id)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="font-medium text-gray-900">
                {direction.name}
              </span>
              {direction.country && (
                <span className="text-sm text-gray-500">
                  {direction.country.flag}
                </span>
              )}
            </label>
          ))}
        </div>
        {errors.directionIds && (
          <p className="mt-1 text-sm text-red-600">
            {errors.directionIds.message}
          </p>
        )}
      </div>

      {/* Шаблон парсинга (только для создания) */}
      {!isEditing && (
        <div>
          <Select
            label="Шаблон парсинга"
            options={[
              { value: "", label: "Не выбран" },
              ...(templates?.map((t) => ({
                value: t.key,
                label: t.name,
              })) || []),
            ]}
            value={selectedTemplate || ""}
            onChange={(e) => setValue("parsingTemplateKey", e.target.value)}
          />
          {selectedTemplate && templates && (
            <p className="mt-1 text-xs text-gray-500">
              {templates.find((t) => t.key === selectedTemplate)?.description}
            </p>
          )}
        </div>
      )}

      <Textarea
        label="Описание"
        placeholder="Описание источника..."
        {...register("description")}
      />

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Активен</span>
        <input
          type="checkbox"
          {...register("isActive")}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
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
