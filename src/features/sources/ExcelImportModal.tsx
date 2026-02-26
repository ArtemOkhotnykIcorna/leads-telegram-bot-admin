import { useState, useCallback, useRef, useMemo } from "react";
import {
  FileSpreadsheet,
  Plus,
  X,
  AlertCircle,
  ArrowLeft,
  Check,
  Loader2,
  Search,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Button, Badge, Input, Textarea, Select } from "@/components/ui";
import {
  useMtprotoJoinAndAdd,
  useParsingTemplates,
} from "@/hooks/queries/useSources";
import { useDirections } from "@/hooks/queries/useDirections";
import { read, utils } from "xlsx";

export interface ExcelGroupRow {
  name: string;
  url: string;
  description?: string;
}

interface ExcelImportModalProps {
  onClose: () => void;
}

const TELEGRAM_URL_RE = /^(https?:\/\/t\.me\/|@)[\w+]/i;

const joinSchema = z.object({
  url: z
    .string()
    .min(1, "Обязательное поле")
    .refine(
      (val) => TELEGRAM_URL_RE.test(val),
      "Укажите ссылку вида https://t.me/... или @username",
    ),
  directionIds: z.array(z.string()).optional(),
  description: z.string().optional(),
  parsingTemplateKey: z.string().optional(),
});

type JoinFormData = z.infer<typeof joinSchema>;

export function ExcelImportModal(_props: ExcelImportModalProps) {
  // --- File parsing state ---
  const [rows, setRows] = useState<ExcelGroupRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  // --- Add-source sub-view state ---
  const [addingRow, setAddingRow] = useState<ExcelGroupRow | null>(null);
  const [addedUrls, setAddedUrls] = useState<Set<string>>(new Set());

  // --- hooks for JoinAndAdd form ---
  const [selectedDirections, setSelectedDirections] = useState<string[]>([]);
  const { data: directions } = useDirections();
  const { data: templates } = useParsingTemplates();
  const joinMutation = useMtprotoJoinAndAdd();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset: resetForm,
    formState: {},
  } = useForm<JoinFormData>({
    resolver: zodResolver(joinSchema),
    defaultValues: {
      url: "",
      directionIds: [],
      description: "",
      parsingTemplateKey: "universal",
    },
  });

  const selectedTemplate = watch("parsingTemplateKey");

  // ---------- File helpers ----------
  const normaliseUrl = (raw: string | undefined): string => {
    if (!raw) return "";
    let v = raw.trim();
    if (v.startsWith("@")) return `https://t.me/${v.slice(1)}`;
    if (!/^https?:\/\//i.test(v) && !v.startsWith("@")) {
      v = `https://t.me/${v}`;
    }
    return v;
  };

  const parseFile = useCallback((file: File) => {
    setError(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = read(data, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const raw: unknown[][] = utils.sheet_to_json(sheet, { header: 1 });

        if (raw.length < 2) {
          setError("Файл пуст или содержит только заголовки");
          return;
        }

        const header = (raw[0] as string[]).map((h) =>
          String(h ?? "")
            .toLowerCase()
            .trim(),
        );

        const urlIdx = header.findIndex(
          (h) =>
            h.includes("ссылка") ||
            h.includes("url") ||
            h.includes("link") ||
            h.includes("invite") ||
            h.includes("telegram"),
        );
        const nameIdx = header.findIndex(
          (h) =>
            h.includes("назван") ||
            h.includes("name") ||
            h.includes("группа") ||
            h.includes("канал") ||
            h.includes("title"),
        );
        const descIdx = header.findIndex(
          (h) =>
            h.includes("описани") ||
            h.includes("description") ||
            h.includes("desc") ||
            h.includes("коммент") ||
            h.includes("comment"),
        );

        const finalNameIdx = nameIdx >= 0 ? nameIdx : 0;
        const finalUrlIdx = urlIdx >= 0 ? urlIdx : nameIdx >= 0 ? 1 : 1;

        const parsed: ExcelGroupRow[] = [];

        for (let i = 1; i < raw.length; i++) {
          const r = raw[i] as string[];
          if (!r || r.length === 0) continue;

          const urlRaw = String(r[finalUrlIdx] ?? "").trim();
          if (!urlRaw) continue;

          parsed.push({
            name: String(r[finalNameIdx] ?? "").trim() || urlRaw,
            url: normaliseUrl(urlRaw),
            description:
              descIdx >= 0
                ? String(r[descIdx] ?? "").trim() || undefined
                : undefined,
          });
        }

        if (parsed.length === 0) {
          setError(
            "Не удалось найти ссылки на группы в файле. Убедитесь что файл содержит колонку со ссылками.",
          );
          return;
        }

        setRows(parsed);
      } catch {
        setError(
          "Не удалось прочитать файл. Убедитесь, что это .xlsx / .xls файл.",
        );
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  // ---------- drag & drop ----------
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) parseFile(file);
    },
    [parseFile],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) parseFile(file);
    },
    [parseFile],
  );

  const handleRemoveRow = (idx: number) => {
    setRows((prev) => prev.filter((_, i) => i !== idx));
  };

  // ---------- Add source handlers ----------
  const openAddForm = (row: ExcelGroupRow) => {
    setAddingRow(row);
    setSelectedDirections([]);
    resetForm({
      url: row.url,
      directionIds: [],
      description: row.description || "",
      parsingTemplateKey: "universal",
    });
  };

  const closeAddForm = () => {
    setAddingRow(null);
    joinMutation.reset();
  };

  const onSubmitAdd = async (data: JoinFormData) => {
    await joinMutation.mutateAsync({
      url: data.url,
      directionIds:
        selectedDirections.length > 0 ? selectedDirections : undefined,
      description: data.description || undefined,
      parsingTemplateKey: data.parsingTemplateKey || undefined,
    });
    setAddedUrls((prev) => new Set(prev).add(data.url));
    closeAddForm();
  };

  const handleDirectionToggle = (directionId: string) => {
    const newSelection = selectedDirections.includes(directionId)
      ? selectedDirections.filter((id) => id !== directionId)
      : [...selectedDirections, directionId];
    setSelectedDirections(newSelection);
    setValue("directionIds", newSelection);
  };

  const isLoading = joinMutation.isPending;
  const addedCount = useMemo(
    () => rows.filter((r) => addedUrls.has(r.url)).length,
    [rows, addedUrls],
  );

  // --- Search / filter ---
  const [searchQuery, setSearchQuery] = useState("");
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return rows;
    const q = searchQuery.toLowerCase();
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.url.toLowerCase().includes(q) ||
        (r.description && r.description.toLowerCase().includes(q)),
    );
  }, [rows, searchQuery]);

  // --- Virtualizer ---
  const ROW_HEIGHT = 44;
  const scrollRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: filteredRows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 20,
  });

  // ========== RENDER: Add source sub-view ==========
  if (addingRow) {
    return (
      <div className="space-y-5">
        {/* Назад */}
        <button
          type="button"
          onClick={closeAddForm}
          disabled={isLoading}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={16} />
          Назад к списку
        </button>

        {/* Инфо о группе */}
        <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
          <FileSpreadsheet size={18} className="text-green-600 flex-shrink-0" />
          <div className="min-w-0">
            <p className="font-medium text-gray-900 truncate">
              {addingRow.name}
            </p>
            <code className="text-xs text-blue-600">{addingRow.url}</code>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmitAdd)} className="space-y-5">
          {/* URL (readonly) */}
          <Input
            label="Ссылка на группу / канал"
            disabled
            {...register("url")}
          />

          {/* Направления */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Направления (опционально)
            </label>
            <div className="border rounded-lg divide-y max-h-44 overflow-y-auto">
              {directions?.map((direction) => (
                <label
                  key={direction._id}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedDirections.includes(direction._id)}
                    onChange={() => handleDirectionToggle(direction._id)}
                    disabled={isLoading}
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
              {!directions?.length && (
                <p className="p-3 text-sm text-gray-400">
                  Нет доступных направлений
                </p>
              )}
            </div>
          </div>

          {/* Шаблон парсинга */}
          <div>
            <Select
              label="Шаблон парсинга"
              options={[
                { value: "universal", label: "Универсальный (по умолчанию)" },
                ...(templates
                  ?.filter((t) => t.key !== "universal")
                  .map((t) => ({ value: t.key, label: t.name })) || []),
              ]}
              value={selectedTemplate || "universal"}
              onChange={(e) => setValue("parsingTemplateKey", e.target.value)}
              disabled={isLoading}
            />
            {selectedTemplate && templates && (
              <p className="mt-1 text-xs text-gray-500">
                {templates.find((t) => t.key === selectedTemplate)?.description}
              </p>
            )}
          </div>

          {/* Описание */}
          <Textarea
            label="Описание (опционально)"
            placeholder="Описание источника..."
            rows={2}
            disabled={isLoading}
            {...register("description")}
          />

          {/* Кнопки */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={closeAddForm}
              disabled={isLoading}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              leftIcon={
                isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : undefined
              }
            >
              {isLoading ? "Подключаемся к группе..." : "Добавить источник"}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // ========== RENDER: Dropzone ==========
  if (rows.length === 0) {
    return (
      <div className="space-y-4">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer
            ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"}
          `}
          onClick={() => document.getElementById("excel-file-input")?.click()}
        >
          <input
            id="excel-file-input"
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={handleFileInput}
          />
          <FileSpreadsheet size={40} className="mx-auto text-gray-400 mb-3" />
          <p className="text-sm font-medium text-gray-700">
            Перетащите Excel файл сюда или нажмите для выбора
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Поддерживаются .xlsx, .xls, .csv
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p className="font-medium">Ожидаемый формат файла:</p>
          <p>
            Колонки: <code className="bg-gray-100 px-1 rounded">Название</code>,{" "}
            <code className="bg-gray-100 px-1 rounded">Ссылка</code> (или URL /
            Link / Telegram), опционально{" "}
            <code className="bg-gray-100 px-1 rounded">Описание</code>
          </p>
        </div>
      </div>
    );
  }

  // ========== RENDER: Таблица групп ==========
  return (
    <div className="space-y-4">
      {/* Шапка */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileSpreadsheet size={18} className="text-green-600" />
          <span className="text-sm font-medium text-gray-700">{fileName}</span>
          <Badge variant="info">{rows.length} групп</Badge>
          {addedCount > 0 && (
            <Badge variant="success">{addedCount} добавлено</Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setRows([]);
            setFileName(null);
            setAddedUrls(new Set());
            setSearchQuery("");
          }}
        >
          Загрузить другой файл
        </Button>
      </div>

      {/* Поиск */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Поиск по названию или ссылке..."
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {searchQuery && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
            {filteredRows.length} из {rows.length}
          </span>
        )}
      </div>

      {/* Виртуализованная таблица */}
      <div className="border rounded-lg overflow-hidden">
        {/* Заголовок таблицы (статический) */}
        <div className="bg-gray-50 border-b">
          <div className="flex text-sm font-medium text-gray-600">
            <div className="w-12 px-4 py-2 flex-shrink-0">#</div>
            <div className="flex-1 min-w-0 px-4 py-2">Название</div>
            <div className="flex-1 min-w-0 px-4 py-2">Ссылка</div>
            <div className="w-40 px-4 py-2 flex-shrink-0 hidden lg:block">
              Описание
            </div>
            <div className="w-[180px] px-4 py-2 flex-shrink-0" />
          </div>
        </div>

        {/* Виртуализованный скролл-контейнер */}
        <div ref={scrollRef} className="max-h-[400px] overflow-auto">
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              position: "relative",
            }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const row = filteredRows[virtualRow.index];
              // Находим реальный индекс в rows для нумерации
              const realIndex = rows.indexOf(row);
              const isAdded = addedUrls.has(row.url);

              return (
                <div
                  key={virtualRow.index}
                  className={`flex items-center text-sm border-b last:border-b-0 ${
                    isAdded ? "bg-green-50" : "hover:bg-gray-50"
                  }`}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <div className="w-12 px-4 py-2 flex-shrink-0 text-gray-400">
                    {realIndex + 1}
                  </div>
                  <div className="flex-1 min-w-0 px-4 py-2 font-medium text-gray-900 truncate">
                    {row.name}
                  </div>
                  <div className="flex-1 min-w-0 px-4 py-2">
                    <code className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded inline-block max-w-full truncate">
                      {row.url}
                    </code>
                  </div>
                  <div className="w-40 px-4 py-2 flex-shrink-0 text-gray-500 truncate hidden lg:block">
                    {row.description || "—"}
                  </div>
                  <div className="w-[180px] px-4 py-2 flex-shrink-0 text-right whitespace-nowrap">
                    {isAdded ? (
                      <span className="inline-flex items-center gap-1 text-sm text-green-600 font-medium">
                        <Check size={14} />
                        Добавлено
                      </span>
                    ) : (
                      <div className="flex items-center gap-1 justify-end">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => openAddForm(row)}
                        >
                          <Plus size={14} className="mr-1" />В источники
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveRow(realIndex)}
                        >
                          <X size={14} className="text-gray-400" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
