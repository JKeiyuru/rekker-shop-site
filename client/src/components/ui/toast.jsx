import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva } from "class-variance-authority";
import { X, CheckCircle2, AlertTriangle } from "lucide-react"

import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props} />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

// Premium toast — dark ink surface, red accent, subtle blur
const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border p-4 pr-9 shadow-2xl shadow-black/20 backdrop-blur-xl transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default:
          "border-white/10 bg-ink/95 text-ink-foreground before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-primary",
        destructive:
          "destructive group border-primary/40 bg-ink/95 text-ink-foreground before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-primary",
        success:
          "border-white/10 bg-ink/95 text-ink-foreground before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-accent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const toastIconByVariant = {
  default: null,
  destructive: AlertTriangle,
  success: CheckCircle2,
}

const Toast = React.forwardRef(({ className, variant, children, ...props }, ref) => {
  const Icon = toastIconByVariant[variant || "default"];
  return (
    (<ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}>
      {Icon && (
        <Icon
          className={cn(
            "h-5 w-5 shrink-0",
            variant === "destructive" ? "text-primary" : "text-accent"
          )}
        />
      )}
      <div className="flex w-full flex-col gap-1">{children}</div>
    </ToastPrimitives.Root>)
  );
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 px-3 text-sm font-medium text-ink-foreground ring-offset-background transition-colors hover:bg-primary hover:border-primary hover:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      className
    )}
    {...props} />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2.5 top-2.5 rounded-full p-1 text-white/40 opacity-0 transition-opacity hover:bg-white/10 hover:text-white focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary group-hover:opacity-100",
      className
    )}
    toast-close=""
    {...props}>
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("font-display text-sm font-semibold tracking-tight text-ink-foreground", className)}
    {...props} />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm leading-snug text-white/60", className)}
    {...props} />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

export { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose, ToastAction };
