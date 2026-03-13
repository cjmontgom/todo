interface ToastProps {
  message: string
}

export function Toast({ message }: ToastProps) {
  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-text-primary text-white px-4 py-3 rounded-lg shadow-lg max-w-sm text-sm"
    >
      {message}
    </div>
  )
}
