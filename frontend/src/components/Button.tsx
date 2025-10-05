import React from 'react'

interface ButtonProps {
  children: React.ReactNode
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark'
  size?: 'sm' | 'lg'
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  className?: string
}

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size,
  disabled = false,
  loading = false,
  onClick,
  className = ''
}: ButtonProps) {
  const baseClasses = 'btn'
  const variantClass = `btn-${variant}`
  const sizeClass = size ? `btn-${size}` : ''
  const disabledClass = (disabled || loading) ? 'disabled' : ''
  
  const allClasses = [baseClasses, variantClass, sizeClass, disabledClass, className]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type={type}
      className={allClasses}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? (
        <>
          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  )
}
