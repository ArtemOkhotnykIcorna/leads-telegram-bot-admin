import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Hash, AtSign, MessageSquare } from "lucide-react";
import {
  useLinkPendingSource,
  useParsingTemplates,
} from "@/hooks/queries/useSources";
import { useDirections } from "@/hooks/queries/useDirections";
import { Button, Input, Textarea, Select } from "@/components/ui";
import type { PendingSource } from "@/types";

const linkSchema = z.object({
  directionIds: z.array(z.string()).min(1, "Выберите хотя бы одно направление"),
  slug: z.string().optional(),
  parsingTemplateKey: z.string().optional(),
  description: z.string().optional(),
});

type LinkFormData = z.infer<typeof linkSchema>;

interface LinkPendingSourceFormProps {
  source: PendingSource;
  onSuccess: () => void;
}

export function LinkPendingSourceForm({
  source,
  onSuccess,
}: LinkPendingSourceFormProps) {
  const [selectedDirections, setSelectedDirections] = useState<string[]>([]);
  const { data: directions } = useDirections();
  const { data: templates } = useParsingTemplates();
  const linkMutation = useLinkPendingSource();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LinkFormData>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      directionIds: [],
      slug: source.suggestedSlug || "",
      parsingTemplateKey: "universal",
      description: "",
    },
  });

  const selectedTemplate = watch("parsingTemplateKey");

  const onSubmit = async (data: LinkFormData) => {
    await linkMutation.mutateAsync({
      id: source._id,
      dto: {
        directionIds: data.directionIds,
        slug: data.slug || undefined,
        parsingTemplateKey: data.parsingTemplateKey || undefined,
        description: data.description || undefined,
      },
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

  // Иконка типа чата
  const getChatTypeIcon = () => {
    switch (source.chatType) {
      case "channel":
        return <Hash size={20} className="text-blue-500" />;
      case "supergroup":
      case "group":
        return <MessageSquare size={20} className="text-green-500" />;
      default:
        return <Hash size={20} className="text-gray-500" />;
    }
  };

  // Лейбл типа чата
  const getChatTypeLabel = () => {
    switch (source.chatType) {
      case "channel":
        return "Канал";
      case "supergroup":
        return "Супергруппа";
      case "group":
        return "Группа";
      default:
        return source.chatType;
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Информация об источнике */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-3">
          {getChatTypeIcon()}
          <div>
            <h3 className="font-medium text-gray-900">{source.title}</h3>
            <p className="text-sm text-gray-500">{getChatTypeLabel()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Chat ID:</span>
            <code className="ml-2 bg-gray-200 px-2 py-0.5 rounded text-xs">
              {source.chatId}
            </code>
          </div>
          {source.username && (
            <div className="flex items-center gap-1">
              <AtSign size={14} className="text-gray-400" />
              <span className="text-gray-700">{source.username}</span>
            </div>
          )}
        </div>
      </div>

      {/* Выбор направлений */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Направления *
        </label>
        <div className="border rounded-lg divide-y max-h-48 overflow-y-auto">
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
        </div>
        {errors.directionIds && (
          <p className="mt-1 text-sm text-red-600">
            {errors.directionIds.message}
          </p>
        )}
      </div>

      {/* Шаблон парсинга */}
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

      {/* Slug */}
      <div>
        <Input
          label="Slug (опционально)"
          placeholder="crypto-leads-ua"
          {...register("slug")}
        />
        {source.suggestedSlug && (
          <p className="mt-1 text-xs text-gray-500">
            💡 Предложено: {source.suggestedSlug}
          </p>
        )}
      </div>

      {/* Описание */}
      <Textarea
        label="Описание (опционально)"
        placeholder="Описание источника..."
        {...register("description")}
      />

      {/* Кнопки */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="secondary" onClick={onSuccess}>
          Отмена
        </Button>
        <Button type="submit" isLoading={linkMutation.isPending}>
          Подключить
        </Button>
      </div>
    </form>
  );
}
