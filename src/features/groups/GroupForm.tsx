import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useGroup,
  useCreateGroup,
  useUpdateGroup,
} from "@/hooks/queries/useGroups";
import { Button, Input, Textarea, Switch } from "@/components/ui";

const groupSchema = z.object({
  name: z.string().min(1, "Обязательное поле"),
  telegramChatId: z.string().min(1, "Обязательное поле"),
  description: z.string().optional(),
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
      telegramChatId: "",
      description: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (group && isEditing) {
      reset({
        name: group.name,
        telegramChatId: group.telegramChatId,
        description: group.description || "",
        isActive: group.isActive,
      });
    }
  }, [group, isEditing, reset]);

  const onSubmit = async (data: GroupFormData) => {
    if (isEditing) {
      await updateMutation.mutateAsync({ id: groupId!, dto: data });
    } else {
      await createMutation.mutateAsync(data);
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

      <Input
        label="Telegram Chat ID"
        placeholder="-100xxxxxxxxxx"
        hint="ID группы или канала в Telegram"
        error={errors.telegramChatId?.message}
        {...register("telegramChatId")}
      />

      <Textarea label="Описание" {...register("description")} />

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
