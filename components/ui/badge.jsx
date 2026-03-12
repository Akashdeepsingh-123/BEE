import React from 'react'

export function Badge({ children, variant = 'default', className = '' }) {
  const styles = {
    default: 'bg-gray-100 text-gray-800',
    secondary: 'bg-blue-100 text-blue-800',
    outline: 'border border-gray-300 text-gray-800'
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[variant] || styles.default} ${className}`}>
      {children}
    </span>
  )
}


