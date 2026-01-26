import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { AlertTriangle } from "lucide-react";
import { Button } from "./Button";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Подтверждение",
  message = "Вы уверены, что хотите выполнить это действие?",
  confirmText = "Подтвердить",
  cancelText = "Отмена",
  variant = "danger",
  isLoading,
}: ConfirmDialogProps) {
  const iconColors = {
    danger: "text-red-600 bg-red-100",
    warning: "text-yellow-600 bg-yellow-100",
    info: "text-blue-600 bg-blue-100",
  };

  const buttonVariants = {
    danger: "danger",
    warning: "primary",
    info: "primary",
  } as const;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform rounded-lg bg-white p-6 shadow-xl transition-all">
                <div className="flex items-start gap-4">
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${iconColors[variant]}`}
                  >
                    <AlertTriangle size={20} />
                  </div>
                  <div className="flex-1">
                    <Dialog.Title className="text-lg font-semibold text-gray-900">
                      {title}
                    </Dialog.Title>
                    <p className="mt-2 text-sm text-gray-500">{message}</p>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <Button variant="secondary" onClick={onClose}>
                    {cancelText}
                  </Button>
                  <Button
                    variant={buttonVariants[variant]}
                    onClick={onConfirm}
                    isLoading={isLoading}
                  >
                    {confirmText}
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
