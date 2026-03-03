import { CheckCircle, Info, X, XCircle } from "lucide-react";
import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface ToastItem {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastContextValue {
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "success") => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    },
    [],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 w-[90%] max-w-[400px]">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({
  toast,
  onRemove,
}: { toast: ToastItem; onRemove: (id: string) => void }) {
  const icons = {
    success: <CheckCircle size={18} className="text-gk-accent shrink-0" />,
    error: <XCircle size={18} className="text-gk-danger shrink-0" />,
    info: <Info size={18} className="text-blue-500 shrink-0" />,
  };

  const bgColors = {
    success: "bg-white border-l-4 border-gk-accent",
    error: "bg-white border-l-4 border-gk-danger",
    info: "bg-white border-l-4 border-blue-500",
  };

  return (
    <div
      className={`toast-enter flex items-center gap-3 px-4 py-3 rounded-xl shadow-card-hover ${bgColors[toast.type]}`}
    >
      {icons[toast.type]}
      <span className="text-sm font-medium text-gk-text flex-1">
        {toast.message}
      </span>
      <button
        type="button"
        onClick={() => onRemove(toast.id)}
        className="text-gk-text-secondary hover:text-gk-text"
      >
        <X size={16} />
      </button>
    </div>
  );
}
