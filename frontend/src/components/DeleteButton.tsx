interface DeleteButtonProps {
  onClick: () => void
  disabled: boolean
  label: string
}

export function DeleteButton({ onClick, disabled, label }: DeleteButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="w-11 h-11 flex items-center justify-center text-text-secondary hover:text-coral-dark focus:outline-2 focus:outline-coral focus:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 ease-out"
    >
      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </button>
  )
}
