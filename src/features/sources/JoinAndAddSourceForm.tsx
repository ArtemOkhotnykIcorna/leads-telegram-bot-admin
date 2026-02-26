import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import {
  useMtprotoJoinAndAdd,
  useParsingTemplates,
} from "@/hooks/queries/useSources";
import { useDirections } from "@/hooks/queries/useDirections";
import { Button, Input, Textarea, Select } from "@/components/ui";

const TELEGRAM_URL_RE = /^(https?:\/\/t\.me\/|@)[\w+]/i;

const joinSchema = z.object({
  url: z
    .string()
    .min(1, "Обязательное поле")
    .refine(
      (val) => TELEGRAM_URL_RE.test(val),
      "Укажите ссылку вида https://t.me/... или @username",
    ),
  directionIds: z.array(z.string()).optional(),
  description: z.string().optional(),
  parsingTemplateKey: z.string().optional(),
});

type JoinFormData = z.infer<typeof joinSchema>;

interface JoinAndAddSourceFormProps {
  onSuccess: () => void;
}

export function JoinAndAddSourceForm({
  onSuccess,
  initialUrl,
}: JoinAndAddSourceFormProps & { initialUrl?: string }) {
  const [selectedDirections, setSelectedDirections] = useState<string[]>([]);
  const { data: directions } = useDirections();
  const { data: templates } = useParsingTemplates();
  const joinMutation = useMtprotoJoinAndAdd();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<JoinFormData>({
    resolver: zodResolver(joinSchema),
    defaultValues: {
      url: initialUrl || "",
      directionIds: [],
      description: "",
      parsingTemplateKey: "universal",
    },
  });

  useEffect(() => {
    if (initialUrl !== undefined) {
      setValue("url", initialUrl);
    }
  }, [initialUrl, setValue]);

  const selectedTemplate = watch("parsingTemplateKey");

  const onSubmit = async (data: JoinFormData) => {
    await joinMutation.mutateAsync({
      url: data.url,
      directionIds:
        selectedDirections.length > 0 ? selectedDirections : undefined,
      description: data.description || undefined,
      parsingTemplateKey: data.parsingTemplateKey || undefined,
    });
    onSuccess();
  };

  const handleDirectionToggle = (directionId: string) => {
    const newSelection = selectedDirections.includes(directionId)
      ? selectedDirections.filter((id) => id !== directionId)
      : [...selectedDirections, directionId];
    setSelectedDirections(newSelection);
    setValue("directionIds", newSelection);
  };

  const isLoading = joinMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Ссылка на группу/канал */}
      <Input
        label="Ссылка на группу / канал *"
        placeholder="https://t.me/example или @example"
        error={errors.url?.message}
        disabled={isLoading}
        {...register("url")}
      />
      <p className="text-xs text-gray-500 -mt-3">
        Поддерживается: https://t.me/..., @username, invite-ссылки
        https://t.me/+...
      </p>

      {/* Направления */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Направления (опционально)
        </label>
        <div className="border rounded-lg divide-y max-h-44 overflow-y-auto">
          {directions?.map((direction) => (
            <label
              key={direction._id}
              className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedDirections.includes(direction._id)}
                onChange={() => handleDirectionToggle(direction._id)}
                disabled={isLoading}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <div className="flex-1">
                <span className="font-medium text-gray-900">
                  {direction.name}
                </span>
                {direction.country && (
                  <span className="ml-2 text-sm text-gray-500">
                    {direction.country.flag} {direction.country.name}
                  </span>
                )}
              </div>
            </label>
          ))}
          {!directions?.length && (
            <p className="p-3 text-sm text-gray-400">
              Нет доступных направлений
            </p>
          )}
        </div>
      </div>

      {/* Шаблон парсинга */}
      <div>
        <Select
          label="Шаблон парсинга"
          options={[
            { value: "universal", label: "Универсальный (по умолчанию)" },
            ...(templates
              ?.filter((t) => t.key !== "universal")
              .map((t) => ({ value: t.key, label: t.name })) || []),
          ]}
          value={selectedTemplate || "universal"}
          onChange={(e) => setValue("parsingTemplateKey", e.target.value)}
          disabled={isLoading}
        />
        {selectedTemplate && templates && (
          <p className="mt-1 text-xs text-gray-500">
            {templates.find((t) => t.key === selectedTemplate)?.description}
          </p>
        )}
      </div>

      {/* Описание */}
      <Textarea
        label="Описание (опционально)"
        placeholder="Описание источника..."
        rows={2}
        disabled={isLoading}
        {...register("description")}
      />

      {/* Кнопки */}
      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
          leftIcon={
            isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : undefined
          }
        >
          {isLoading ? "Подключаемся к группе..." : "Добавить источник"}
        </Button>
      </div>
    </form>
  );
}
