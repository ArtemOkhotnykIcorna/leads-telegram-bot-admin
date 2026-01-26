import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLinkPendingGroup } from "@/hooks/queries/useGroups";
import { useActiveDirections } from "@/hooks/queries/useDirections";
import { Button, Input, Select, Badge } from "@/components/ui";
import type { PendingGroup } from "@/types";

const linkSchema = z.object({
  directionId: z.string().min(1, "Выберите направление"),
  inviteLink: z
    .string()
    .url("Введите корректную ссылку")
    .optional()
    .or(z.literal("")),
});

type LinkFormData = z.infer<typeof linkSchema>;

interface LinkPendingGroupFormProps {
  pendingGroup: PendingGroup;
  onSuccess: () => void;
  onCancel: () => void;
}

export function LinkPendingGroupForm({
  pendingGroup,
  onSuccess,
  onCancel,
}: LinkPendingGroupFormProps) {
  const { data: directions } = useActiveDirections();
  const linkMutation = useLinkPendingGroup();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LinkFormData>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      directionId: "",
      inviteLink: "",
    },
  });

  const onSubmit = async (data: LinkFormData) => {
    await linkMutation.mutateAsync({
      id: pendingGroup._id,
      dto: {
        directionId: data.directionId,
        inviteLink: data.inviteLink || undefined,
      },
    });
    onSuccess();
  };

  const typeLabels = {
    group: "Группа",
    supergroup: "Супергруппа",
    channel: "Канал",
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Информация о группе */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Название</span>
          <span className="font-medium">{pendingGroup.title}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Chat ID</span>
          <code className="text-sm bg-gray-200 px-2 py-0.5 rounded">
            {pendingGroup.chatId}
          </code>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Тип</span>
          <Badge variant="info">{typeLabels[pendingGroup.type]}</Badge>
        </div>
        {pendingGroup.username && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Username</span>
            <span className="text-sm">@{pendingGroup.username}</span>
          </div>
        )}
      </div>

      {/* Форма */}
      <Select
        label="Направление"
        error={errors.directionId?.message}
        value={watch("directionId")}
        onChange={(e) => setValue("directionId", e.target.value)}
        options={[
          { value: "", label: "Выберите направление" },
          ...(directions?.map((d) => ({
            value: d._id,
            label: `${d.country?.flag || ""} ${d.name}`.trim(),
          })) || []),
        ]}
      />

      <Input
        label="Ссылка для вступления"
        placeholder="https://t.me/joinchat/..."
        hint="Опционально"
        error={errors.inviteLink?.message}
        {...register("inviteLink")}
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit" isLoading={linkMutation.isPending}>
          Привязать
        </Button>
      </div>
    </form>
  );
}
