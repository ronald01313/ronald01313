import { useToasts } from "../lib/toast";

export default function ToastContainer() {
  const { toasts, removeToast } = useToasts();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            pointer-events-auto min-w-[300px] max-w-md p-4 rounded-2xl shadow-2xl border flex items-center justify-between gap-4 transform transition-all duration-500 animate-in slide-in-from-right-full
            ${
              toast.type === "success"
                ? "bg-white dark:bg-zinc-900 border-green-100 dark:border-green-900/30 text-green-800 dark:text-green-400"
                : toast.type === "error"
                ? "bg-white dark:bg-zinc-900 border-red-100 dark:border-red-900/30 text-red-800 dark:text-red-400"
                : "bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200"
            }
          `}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">
              {toast.type === "success" ? "✅" : toast.type === "error" ? "⚠️" : "ℹ️"}
            </span>
            <p className="text-sm font-black uppercase tracking-tight leading-tight">
              {toast.message}
            </p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
