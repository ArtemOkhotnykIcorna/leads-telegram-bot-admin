import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useCountry,
  useCreateCountry,
  useUpdateCountry,
} from "@/hooks/queries/useCountries";
import { Button, Input, Switch } from "@/components/ui";

const countrySchema = z.object({
  name: z.string().min(1, "Обязательное поле"),
  code: z.string().min(2, "Минимум 2 символа").max(3, "Максимум 3 символа"),
  flag: z.string().optional(),
  order: z.coerce.number().min(0).default(0),
  isActive: z.boolean().default(true),
});

type CountryFormData = z.infer<typeof countrySchema>;

interface CountryFormProps {
  countryId: string | null;
  onSuccess: () => void;
}

export function CountryForm({ countryId, onSuccess }: CountryFormProps) {
  const isEditing = !!countryId;
  const { data: country } = useCountry(countryId || "");
  const createMutation = useCreateCountry();
  const updateMutation = useUpdateCountry();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CountryFormData>({
    resolver: zodResolver(countrySchema),
    defaultValues: {
      name: "",
      code: "",
      flag: "",
      order: 0,
      isActive: true,
    },
  });

  useEffect(() => {
    if (country && isEditing) {
      reset({
        name: country.name,
        code: country.code,
        flag: country.flag || "",
        order: country.order,
        isActive: country.isActive,
      });
    }
  }, [country, isEditing, reset]);

  const onSubmit = async (data: CountryFormData) => {
    if (isEditing) {
      await updateMutation.mutateAsync({ id: countryId!, dto: data });
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
        label="Код (ISO)"
        placeholder="UA, RU, US..."
        error={errors.code?.message}
        {...register("code")}
      />

      <Input label="Флаг (эмодзи)" placeholder="🇺🇦" {...register("flag")} />

      <Input
        label="Порядок сортировки"
        type="number"
        error={errors.order?.message}
        {...register("order")}
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
