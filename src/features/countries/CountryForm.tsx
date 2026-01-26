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
  slug: z.string().min(2, "Минимум 2 символа").toLowerCase(),
  flag: z.string().optional(),
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
      slug: "",
      flag: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (country && isEditing) {
      reset({
        name: country.name,
        slug: "", // slug не возвращается бэкендом, оставляем пустым при редактировании
        flag: country.flag || "",
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
        label="Slug"
        placeholder="ukraine, russia, usa..."
        error={errors.slug?.message}
        {...register("slug")}
      />

      <Input label="Флаг (эмодзи)" placeholder="🇺🇦" {...register("flag")} />

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
