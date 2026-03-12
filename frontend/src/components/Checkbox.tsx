interface CheckboxProps {
  checked: boolean
  label: string
  onChange?: () => void
  disabled?: boolean
}

export function Checkbox({ checked, label, onChange, disabled }: CheckboxProps) {
  const isInteractive = !!onChange

  const inner = (
    <div
      className={`w-5 h-5 rounded-full transition-colors duration-200 ease-out flex items-center justify-center ${
        checked ? 'bg-coral' : 'border-2 border-border'
      }`}
    >
      {checked && (
        <svg
          className="w-3 h-3 text-white"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M2 6L5 9L10 3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  )

  if (isInteractive) {
    return (
      <button
        type="button"
        className={`w-11 h-11 flex items-center justify-center bg-transparent border-none p-0 focus:outline-2 focus:outline-coral focus:outline-offset-2 ${
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
        }`}
        role="checkbox"
        aria-checked={checked}
        aria-label={label}
        onClick={onChange}
        disabled={disabled}
      >
        {inner}
      </button>
    )
  }

  return (
    <div
      className="w-11 h-11 flex items-center justify-center"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
    >
      {inner}
    </div>
  )
}
