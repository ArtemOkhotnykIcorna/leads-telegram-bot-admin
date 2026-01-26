import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useDirection,
  useCreateDirection,
  useUpdateDirection,
} from "@/hooks/queries/useDirections";
import { Button, Input, Textarea, Switch } from "@/components/ui";

const directionSchema = z.object({
  name: z.string().min(1, "Обязательное поле"),
  description: z.string().optional(),
  order: z.coerce.number().min(0).default(0),
  isActive: z.boolean().default(true),
});

type DirectionFormData = z.infer<typeof directionSchema>;

interface DirectionFormProps {
  directionId: string | null;
  onSuccess: () => void;
}

export function DirectionForm({ directionId, onSuccess }: DirectionFormProps) {
  const isEditing = !!directionId;
  const { data: direction } = useDirection(directionId || "");
  const createMutation = useCreateDirection();
  const updateMutation = useUpdateDirection();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DirectionFormData>({
    resolver: zodResolver(directionSchema),
    defaultValues: {
      name: "",
      description: "",
      order: 0,
      isActive: true,
    },
  });

  useEffect(() => {
    if (direction && isEditing) {
      reset({
        name: direction.name,
        description: direction.description || "",
        order: direction.order,
        isActive: direction.isActive,
      });
    }
  }, [direction, isEditing, reset]);

  const onSubmit = async (data: DirectionFormData) => {
    if (isEditing) {
      await updateMutation.mutateAsync({ id: directionId!, dto: data });
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

      <Textarea label="Описание" {...register("description")} />

      <Input
        label="Порядок сортировки"
        type="number"
        error={errors.order?.message}
        {...register("order")}
      />

      <div className="flex items-center justify-between">
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
