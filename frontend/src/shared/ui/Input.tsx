import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({
  label,
  error,
  id,
  className = '',
  ...props
}: InputProps) {
  return (
    <div>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-semibold text-slate-600 mb-1.5"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border rounded-xl transition-all focus:outline-none focus:ring-2 ${
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
            : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100'
        } disabled:bg-slate-50 disabled:text-slate-500 ${className}`}
        {...props}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}
