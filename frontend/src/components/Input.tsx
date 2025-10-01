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
  
  const baseClasses = 'form-control'
  const sizeClass = size ? `form-control-${size}` : ''
  const errorClass = error ? 'is-invalid' : ''
  
  const allClasses = [baseClasses, sizeClass, errorClass, className]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="mb-3">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
          {required && <span className="text-danger ms-1">*</span>}
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
        <div className="invalid-feedback">
          {error}
        </div>
      )}
    </div>
  )
}
