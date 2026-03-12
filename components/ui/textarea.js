import React from 'react'

export function Textarea({ className = '', ...props }) {
  const base = 'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]'
  return <textarea className={`${base} ${className}`} {...props} />
}


