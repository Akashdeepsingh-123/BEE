import React from 'react'

export function Table({ children }) {
  return <table className="w-full text-sm text-left text-gray-700">{children}</table>
}
export function TableHeader({ children }) {
  return <thead className="text-xs uppercase text-gray-500">{children}</thead>
}
export function TableBody({ children }) {
  return <tbody className="divide-y divide-gray-200">{children}</tbody>
}
export function TableRow({ children, className = '' }) {
  return <tr className={className}>{children}</tr>
}
export function TableHead({ children }) {
  return <th className="px-4 py-3 font-medium">{children}</th>
}
export function TableCell({ children, className = '' }) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>
}


