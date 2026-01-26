import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useSource,
  useCreateSource,
  useUpdateSource,
} from "@/hooks/queries/useSources";
import { Button, Input, Textarea, Select, Switch } from "@/components/ui";

const sourceSchema = z.object({
  name: z.string().min(1, "Обязательное поле"),
  type: z.enum(["api", "telegram", "webhook", "manual"]),
  description: z.string().optional(),
  webhookUrl: z.string().url().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

type SourceFormData = z.infer<typeof sourceSchema>;

interface SourceFormProps {
  sourceId: string | null;
  onSuccess: () => void;
}

const sourceTypes = [
  { value: "api", label: "API" },
  { value: "telegram", label: "Telegram Bot" },
  { value: "webhook", label: "Webhook" },
  { value: "manual", label: "Ручной ввод" },
];

export function SourceForm({ sourceId, onSuccess }: SourceFormProps) {
  const isEditing = !!sourceId;
  const { data: source } = useSource(sourceId || "");
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
      type: "api",
      description: "",
      webhookUrl: "",
      isActive: true,
    },
  });

  const selectedType = watch("type");

  useEffect(() => {
    if (source && isEditing) {
      reset({
        name: source.name,
        type: source.type,
        description: source.description || "",
        webhookUrl: source.webhookUrl || "",
        isActive: source.isActive,
      });
    }
  }, [source, isEditing, reset]);

  const onSubmit = async (data: SourceFormData) => {
    const payload = {
      ...data,
      webhookUrl: data.webhookUrl || undefined,
    };

    if (isEditing) {
      await updateMutation.mutateAsync({ id: sourceId!, dto: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    onSuccess();
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Название"
        error={errors.name?.message}
        {...register("name")}
      />

      <Select
        label="Тип источника"
        options={sourceTypes}
        value={selectedType}
        onChange={(e) =>
          setValue("type", e.target.value as SourceFormData["type"])
        }
        error={errors.type?.message}
      />

      <Textarea label="Описание" {...register("description")} />

      {selectedType === "webhook" && (
        <Input
          label="Webhook URL"
          placeholder="https://..."
          error={errors.webhookUrl?.message}
          {...register("webhookUrl")}
        />
      )}

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Активен</span>
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
