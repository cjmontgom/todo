interface ErrorStateProps {
  onRetry: () => void
}

export function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-6">
      <p className="text-text-secondary text-center">
        Something went wrong. Let's try again.
      </p>
      <button
        onClick={onRetry}
        className="bg-coral text-white px-6 py-3 rounded-lg min-w-[44px] min-h-[44px] hover:opacity-90 transition-all duration-200 ease-out focus:outline-2 focus:outline-coral focus:outline-offset-2"
      >
        Retry
      </button>
    </div>
  )
}
