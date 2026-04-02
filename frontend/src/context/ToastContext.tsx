import React, { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastItemData {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  addToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItemData[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType = "info", duration = 3000) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem = ({
  toast,
  onRemove,
}: {
  toast: ToastItemData;
  onRemove: () => void;
}) => {
  const config: Record<
    ToastType,
    { icon: typeof CheckCircle; className: string; iconColor: string }
  > = {
    success: {
      icon: CheckCircle,
      className: "bg-green-50 text-green-800 border-green-200",
      iconColor: "text-green-500",
    },
    error: {
      icon: AlertCircle,
      className: "bg-red-50 text-red-800 border-red-200",
      iconColor: "text-red-500",
    },
    warning: {
      icon: AlertTriangle,
      className: "bg-amber-50 text-amber-800 border-amber-200",
      iconColor: "text-amber-500",
    },
    info: {
      icon: Info,
      className: "bg-blue-50 text-blue-800 border-blue-200",
      iconColor: "text-blue-500",
    },
  };

  const { icon: Icon, className, iconColor } = config[toast.type] || config.info;

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg w-80 pointer-events-auto animate-in slide-in-from-right-8 fade-in duration-300 ${className}`}
    >
      <Icon className={iconColor} size={20} />
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={onRemove}
        className="text-current opacity-50 hover:opacity-100 transition-opacity"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};
