import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useDirection,
  useCreateDirection,
  useUpdateDirection,
} from "@/hooks/queries/useDirections";
import { useActiveCountries } from "@/hooks/queries/useCountries";
import { Button, Input, Textarea, Switch, Select } from "@/components/ui";

const directionSchema = z.object({
  name: z.string().min(1, "Обязательное поле"),
  slug: z.string().min(1, "Обязательное поле"),
  description: z.string().optional(),
  countryId: z.string().min(1, "Выберите страну"),
  isActive: z.boolean().default(true),
  requiresSubscription: z.boolean().default(false),
});

type DirectionFormData = z.infer<typeof directionSchema>;

interface DirectionFormProps {
  directionId: string | null;
  onSuccess: () => void;
}

export function DirectionForm({ directionId, onSuccess }: DirectionFormProps) {
  const isEditing = !!directionId;
  const { data: direction } = useDirection(directionId || "");
  const { data: countries } = useActiveCountries();
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
      slug: "",
      description: "",
      countryId: "",
      isActive: true,
      requiresSubscription: false,
    },
  });

  useEffect(() => {
    if (direction && isEditing) {
      reset({
        name: direction.name,
        slug: direction.slug,
        description: direction.description || "",
        countryId: direction.countryId || direction.country?._id || "",
        isActive: direction.isActive,
        requiresSubscription: direction.requiresSubscription || false,
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

      <Input
        label="Slug"
        placeholder="crypto, realestate..."
        error={errors.slug?.message}
        {...register("slug")}
      />

      <Select
        label="Страна"
        error={errors.countryId?.message}
        value={watch("countryId")}
        onChange={(e) => setValue("countryId", e.target.value)}
        options={[
          { value: "", label: "Выберите страну" },
          ...(countries?.map((c) => ({
            value: c._id,
            label: `${c.flag} ${c.name}`,
          })) || []),
        ]}
      />

      <Textarea label="Описание" {...register("description")} />

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Активно</span>
        <Switch
          checked={watch("isActive")}
          onChange={(checked) => setValue("isActive", checked)}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          Требуется подписка
        </span>
        <Switch
          checked={watch("requiresSubscription")}
          onChange={(checked) => setValue("requiresSubscription", checked)}
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
