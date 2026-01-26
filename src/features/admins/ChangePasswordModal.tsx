import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useChangeAdminPassword } from "@/hooks/queries/useAdmins";
import { Button, Input, Modal } from "@/components/ui";
import type { Admin } from "@/types";

const passwordSchema = z
  .object({
    password: z.string().min(8, "Минимум 8 символов"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

interface ChangePasswordModalProps {
  admin: Admin;
  isOpen: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({
  admin,
  isOpen,
  onClose,
}: ChangePasswordModalProps) {
  const changePasswordMutation = useChangeAdminPassword();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: PasswordFormData) => {
    await changePasswordMutation.mutateAsync({
      id: admin._id,
      password: data.password,
    });
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Сменить пароль: ${admin.email}`}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Новый пароль"
          type="password"
          error={errors.password?.message}
          {...register("password")}
        />

        <Input
          label="Подтвердите пароль"
          type="password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Отмена
          </Button>
          <Button type="submit" isLoading={changePasswordMutation.isPending}>
            Сохранить
          </Button>
        </div>
      </form>
    </Modal>
  );
}
