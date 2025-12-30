"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface Toast {
  id: string
  title: string
  description?: string
  variant?: "default" | "success" | "error" | "warning"
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const addToast = React.useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { ...toast, id }])

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 5000)
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within ToastProvider")
  }
  return context
}

const variantStyles = {
  default: "bg-zinc-800 border-zinc-700",
  success: "bg-green-900/50 border-green-500/50",
  error: "bg-red-900/50 border-red-500/50",
  warning: "bg-amber-900/50 border-amber-500/50",
}

const variantIcons = {
  default: "💬",
  success: "✓",
  error: "✕",
  warning: "⚠",
}

function ToastContainer({
  toasts,
  removeToast
}: {
  toasts: Toast[]
  removeToast: (id: string) => void
}) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-in slide-in-from-right-full duration-300",
            variantStyles[toast.variant || "default"]
          )}
        >
          <span className="text-lg">
            {variantIcons[toast.variant || "default"]}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium text-sm">{toast.title}</p>
            {toast.description && (
              <p className="text-zinc-400 text-sm mt-0.5">{toast.description}</p>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
