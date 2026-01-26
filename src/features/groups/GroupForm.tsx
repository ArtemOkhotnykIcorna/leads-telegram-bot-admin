import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useGroup,
  useCreateGroup,
  useUpdateGroup,
} from "@/hooks/queries/useGroups";
import { useActiveDirections } from "@/hooks/queries/useDirections";
import { Button, Input, Switch, Select } from "@/components/ui";

const groupSchema = z.object({
  name: z.string().min(1, "Обязательное поле"),
  chatId: z.string().optional(),
  directionId: z.string().min(1, "Выберите направление"),
  inviteLink: z
    .string()
    .url("Введите корректную ссылку")
    .optional()
    .or(z.literal("")),
  isActive: z.boolean().default(true),
});

type GroupFormData = z.infer<typeof groupSchema>;

interface GroupFormProps {
  groupId: string | null;
  onSuccess: () => void;
}

export function GroupForm({ groupId, onSuccess }: GroupFormProps) {
  const isEditing = !!groupId;
  const { data: group } = useGroup(groupId || "");
  const { data: directions } = useActiveDirections();
  const createMutation = useCreateGroup();
  const updateMutation = useUpdateGroup();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<GroupFormData>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: "",
      chatId: "",
      directionId: "",
      inviteLink: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (group && isEditing) {
      reset({
        name: group.name,
        chatId: group.chatId || "",
        directionId: group.directionId?._id || "",
        inviteLink: group.inviteLink || "",
        isActive: group.isActive,
      });
    }
  }, [group, isEditing, reset]);

  const onSubmit = async (data: GroupFormData) => {
    const dto = {
      ...data,
      inviteLink: data.inviteLink || undefined,
      chatId: data.chatId || undefined,
    };

    if (isEditing) {
      await updateMutation.mutateAsync({ id: groupId!, dto });
    } else {
      await createMutation.mutateAsync(dto);
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
        label="Telegram Chat ID"
        placeholder="-100xxxxxxxxxx"
        hint="Опционально. Заполняется автоматически при добавлении бота в группу"
        error={errors.chatId?.message}
        {...register("chatId")}
      />

      <Input
        label="Ссылка для вступления"
        placeholder="https://t.me/joinchat/..."
        hint="Опционально"
        error={errors.inviteLink?.message}
        {...register("inviteLink")}
      />

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Активна</span>
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
