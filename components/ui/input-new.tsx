import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          // Base styles with !important to override any conflicting styles
          "flex h-11 w-full rounded-lg border border-purple-500/60 !bg-[#0a0a14] px-4 py-2 text-base !text-purple-100 placeholder:text-purple-400",
          // Smooth transitions
          "transition-all duration-300 ease-in-out",
          // Hover subtle neon glow
          "hover:border-purple-400 hover:shadow-[0_0_8px_rgba(168,85,247,0.5)]",
          // Focus slightly stronger glow - ensure background stays dark
          "focus:border-purple-500 focus:shadow-[0_0_12px_rgba(168,85,247,0.7)] focus:outline-none focus:!bg-[#0a0a14] focus:!text-purple-100",
          // Active/filled state - ensure background stays dark
          "active:!bg-[#0a0a14] active:!text-purple-100",
          // Disabled
          "disabled:cursor-not-allowed disabled:opacity-50",
          // Additional overrides for browser defaults
          "[color-scheme:dark] autofill:!bg-[#0a0a14] autofill:!text-purple-100",
          className
        )}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }