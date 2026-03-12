import React from 'react'

export function Button({ children, className = '', variant = 'default', size = 'md', ...props }) {
  const base = 'inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors'
  const variants = {
    default: 'bg-gray-900 text-white hover:bg-gray-800',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-900'
  }
  const sizes = { sm: 'px-2 py-1 text-sm', md: '', lg: 'px-4 py-3' }
  return (
    <button className={`${base} ${variants[variant] || variants.default} ${sizes[size] || ''} ${className}`} {...props}>
      {children}
    </button>
  )
}


