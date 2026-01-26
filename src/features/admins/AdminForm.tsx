import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useAdmin,
  useCreateAdmin,
  useUpdateAdmin,
} from "@/hooks/queries/useAdmins";
import { Button, Input, Switch } from "@/components/ui";

const createSchema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(8, "Минимум 8 символов"),
  role: z.enum(["admin", "manager"]),
});

const updateSchema = z.object({
  email: z.string().email("Введите корректный email"),
  role: z.enum(["admin", "manager"]),
  isActive: z.boolean(),
});

type CreateFormData = z.infer<typeof createSchema>;
type UpdateFormData = z.infer<typeof updateSchema>;

interface AdminFormProps {
  adminId: string | null;
  onSuccess: () => void;
}

export function AdminForm({ adminId, onSuccess }: AdminFormProps) {
  const isEditing = !!adminId;
  const { data: admin } = useAdmin(adminId || "");
  const createMutation = useCreateAdmin();
  const updateMutation = useUpdateAdmin();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateFormData | UpdateFormData>({
    resolver: zodResolver(isEditing ? updateSchema : createSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "manager",
      isActive: true,
    },
  });

  useEffect(() => {
    if (admin && isEditing) {
      reset({
        email: admin.email,
        role: admin.role,
        isActive: admin.isActive,
      });
    }
  }, [admin, isEditing, reset]);

  const onSubmit = async (data: CreateFormData | UpdateFormData) => {
    if (isEditing) {
      await updateMutation.mutateAsync({
        id: adminId!,
        dto: data as UpdateFormData,
      });
    } else {
      await createMutation.mutateAsync(data as CreateFormData);
    }
    onSuccess();
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const watchIsActive = watch(
    "isActive" as keyof (CreateFormData | UpdateFormData),
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Email"
        type="email"
        error={errors.email?.message}
        {...register("email")}
      />

      {!isEditing && (
        <Input
          label="Пароль"
          type="password"
          error={
            (errors as { password?: { message?: string } }).password?.message
          }
          {...register("password")}
        />
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Роль
        </label>
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          {...register("role")}
        >
          <option value="manager">Менеджер</option>
          <option value="admin">Администратор</option>
        </select>
        <p className="mt-1 text-sm text-gray-500">
          Администратор имеет полный доступ ко всем функциям
        </p>
      </div>

      {isEditing && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Активен</span>
          <Switch
            checked={watchIsActive as unknown as boolean}
            onChange={(checked) =>
              setValue("isActive" as keyof UpdateFormData, checked)
            }
          />
        </div>
      )}

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
