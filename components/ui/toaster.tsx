"use client"

import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  const getToastIcon = (variant?: string) => {
    switch (variant) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-[#13ec9c]" />
      case "destructive":
        return <AlertCircle className="h-5 w-5 text-[#ef4444]" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-[#fbbf24]" />
      case "info":
        return <Info className="h-5 w-5 text-[#3b82f6]" />
      default:
        return <CheckCircle2 className="h-5 w-5 text-[#13ec9c]" />
    }
  }

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, variant, ...props }) => (
        <Toast key={id} variant={variant} {...props}>
          <div className="grid gap-1 flex-1">
            {title && (
              <ToastTitle className="flex items-center gap-2">
                {getToastIcon(variant)}
                {title}
              </ToastTitle>
            )}
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
          {action}
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}
