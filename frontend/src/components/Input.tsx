import React from 'react'

interface InputProps {
  id?: string
  name?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'
  placeholder?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  required?: boolean
  disabled?: boolean
  autoComplete?: string
  label?: string
  error?: string
  className?: string
  size?: 'sm' | 'lg'
}

export default function Input({
  id,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  onKeyDown,
  required = false,
  disabled = false,
  autoComplete,
  label,
  error,
  className = '',
  size
}: InputProps) {
  const inputId = id || name || `input-${Math.random().toString(36).substr(2, 9)}`
  
  const baseClasses = 'block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500'
  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    lg: 'px-4 py-3 text-lg'
  }
  const errorClasses = error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''
  const disabledClasses = disabled ? 'bg-gray-50 cursor-not-allowed' : ''
  
  const allClasses = [
    baseClasses,
    size ? sizeClasses[size] : '',
    errorClasses,
    disabledClasses,
    className
  ].filter(Boolean).join(' ')

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={inputId}
        name={name}
        type={type}
        className={allClasses}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
      />
      {error && (
        <div className="mt-1 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  )
}
