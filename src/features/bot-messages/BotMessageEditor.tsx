import { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Input,
  Textarea,
  Switch,
  Badge,
  Spinner,
} from "@/components/ui";
import {
  useUpdateBotMessage,
  useResetBotMessage,
} from "@/hooks/queries/useBotMessages";
import type {
  BotMessage,
  UpdateBotMessageDto,
} from "@/types/bot-message.types";
import { MESSAGE_VARIABLES_INFO } from "@/types/bot-message.types";
import toast from "react-hot-toast";
import { RotateCcw, Save, X, Eye, Code, Info } from "lucide-react";

interface BotMessageEditorProps {
  message: BotMessage;
  isOpen: boolean;
  onClose: () => void;
}

export function BotMessageEditor({
  message,
  isOpen,
  onClose,
}: BotMessageEditorProps) {
  const [formData, setFormData] = useState<UpdateBotMessageDto>({
    title: "",
    content: "",
    description: "",
    isActive: true,
  });
  const [showPreview, setShowPreview] = useState(false);

  const updateMutation = useUpdateBotMessage();
  const resetMutation = useResetBotMessage();

  // Инициализация формы при открытии
  useEffect(() => {
    if (message) {
      setFormData({
        title: message.title,
        content: message.content,
        description: message.description || "",
        isActive: message.isActive,
      });
    }
  }, [message]);

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({ id: message._id, data: formData });
      toast.success("Сообщение сохранено");
      onClose();
    } catch {
      toast.error("Ошибка при сохранении сообщения");
    }
  };

  const handleReset = async () => {
    if (!confirm("Сбросить сообщение к значению по умолчанию?")) return;

    try {
      await resetMutation.mutateAsync(message.key);
      toast.success("Сообщение сброшено к значению по умолчанию");
      onClose();
    } catch {
      toast.error("Ошибка при сбросе сообщения");
    }
  };

  // Превью с подстановкой переменных
  const getPreview = () => {
    let preview = formData.content || "";

    // Заменяем переменные на примеры
    const variableExamples: Record<string, string> = {
      name: "Иван",
      trialHours: "24",
      countryName: "Россия",
      groupName: "Лиды Москва",
      directionName: "Недвижимость",
      leadsCount: "150",
      inviteLink: "https://t.me/+ABC123",
      expiresDate: "15.02.2026",
      plansDescription: "Базовый - $10/мес, Премиум - $25/мес",
      planName: "Премиум",
      price: "$25.00",
    };

    message.variables.forEach((variable) => {
      const example = variableExamples[variable] || `[${variable}]`;
      preview = preview.replace(new RegExp(`{{${variable}}}`, "g"), example);
    });

    return preview;
  };

  const variablesInfo = MESSAGE_VARIABLES_INFO[message.key] || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Редактирование сообщения">
      <div className="space-y-6">
        {/* Ключ (только чтение) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ключ
          </label>
          <div className="flex items-center gap-2">
            <code className="px-3 py-2 bg-gray-100 rounded-md text-sm font-mono text-gray-600 flex-1">
              {message.key}
            </code>
            <Badge variant={message.isActive ? "success" : "default"}>
              {message.isActive ? "Активно" : "Неактивно"}
            </Badge>
          </div>
        </div>

        {/* Название */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Название
          </label>
          <Input
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="Название сообщения"
          />
        </div>

        {/* Текст сообщения */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Текст сообщения (Markdown)
            </label>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              {showPreview ? (
                <>
                  <Code size={14} /> Код
                </>
              ) : (
                <>
                  <Eye size={14} /> Превью
                </>
              )}
            </button>
          </div>

          {showPreview ? (
            <div className="p-4 bg-gray-50 border rounded-lg min-h-[200px] whitespace-pre-wrap">
              {getPreview()}
            </div>
          ) : (
            <Textarea
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              rows={8}
              placeholder="Текст сообщения бота..."
              className="font-mono text-sm"
            />
          )}

          {/* Доступные переменные */}
          {message.variables.length > 0 && (
            <div className="mt-2 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm font-medium text-blue-800 mb-2">
                <Info size={14} />
                Доступные переменные:
              </div>
              <div className="flex flex-wrap gap-2">
                {message.variables.map((variable) => {
                  const info = variablesInfo.find(
                    (v) => v.variable === variable,
                  );
                  return (
                    <button
                      key={variable}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          content: formData.content + `{{${variable}}}`,
                        })
                      }
                      className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-blue-200 rounded text-sm text-blue-700 hover:bg-blue-100 transition-colors"
                      title={info?.description || variable}
                    >
                      <code>{`{{${variable}}}`}</code>
                    </button>
                  );
                })}
              </div>
              {variablesInfo.length > 0 && (
                <div className="mt-2 text-xs text-blue-600">
                  {variablesInfo.map((v) => (
                    <div key={v.variable}>
                      • <code>{`{{${v.variable}}}`}</code> — {v.description}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Описание */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Описание (для админ-панели)
          </label>
          <Input
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Краткое описание назначения сообщения"
          />
        </div>

        {/* Статус */}
        <div className="flex items-center justify-between py-3 border-t">
          <div>
            <div className="font-medium text-gray-700">Активно</div>
            <div className="text-sm text-gray-500">
              Неактивные сообщения не будут отправляться ботом
            </div>
          </div>
          <Switch
            checked={formData.isActive ?? true}
            onChange={(checked) =>
              setFormData({ ...formData, isActive: checked })
            }
          />
        </div>

        {/* Markdown справка */}
        <div className="p-3 bg-gray-50 rounded-lg text-sm">
          <div className="font-medium text-gray-700 mb-2">
            Markdown форматирование:
          </div>
          <div className="grid grid-cols-2 gap-2 text-gray-600">
            <div>
              <code>*жирный*</code> → <strong>жирный</strong>
            </div>
            <div>
              <code>_курсив_</code> → <em>курсив</em>
            </div>
            <div>
              <code>`код`</code> → <code className="bg-gray-200 px-1">код</code>
            </div>
            <div>
              <code>[текст](url)</code> → ссылка
            </div>
          </div>
        </div>

        {/* Действия */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={resetMutation.isPending}
          >
            <RotateCcw size={16} className="mr-2" />
            Сбросить к дефолту
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              <X size={16} className="mr-2" />
              Отмена
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <Spinner size="sm" className="mr-2" />
              ) : (
                <Save size={16} className="mr-2" />
              )}
              Сохранить
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
