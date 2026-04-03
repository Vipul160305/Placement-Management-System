import { X, AlertTriangle } from "lucide-react";
import { useEffect } from "react";

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  subMessage?: string;
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
}

const ConfirmModal = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  subMessage,
  confirmLabel = "Confirm",
  danger = false,
  loading = false,
}: ConfirmModalProps) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${danger ? "bg-red-50" : "bg-amber-50"}`}>
                <AlertTriangle size={20} className={danger ? "text-red-500" : "text-amber-500"} />
              </div>
              <h3 className="text-base font-manrope font-bold text-gray-900">{title}</h3>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
              <X size={18} />
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-1">{message}</p>
          {subMessage && <p className="text-xs text-gray-400 mt-1">{subMessage}</p>}

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 w-full sm:w-auto disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`px-4 py-2 text-sm font-medium rounded-lg w-full sm:w-auto disabled:opacity-50 transition-colors ${
                danger
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-primary text-white hover:bg-primary/90"
              }`}
            >
              {loading ? "Please wait…" : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
