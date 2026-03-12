import React, { useEffect, useMemo, useState } from 'react'

export function Select({ value, onValueChange, children }) {
  const [open, setOpen] = useState(false)
  const [internal, setInternal] = useState(value || '')
  useEffect(() => {
    if (value !== undefined) setInternal(value || '')
  }, [value])
  const getLabelFromChildren = (nodes, val) => {
    let label = ''
    React.Children.forEach(nodes, (node) => {
      if (label) return
      if (!React.isValidElement(node)) return
      if (node.type === SelectItem && node.props && node.props.value === val) {
        const extract = (c) => {
          if (c == null) return ''
          if (typeof c === 'string' || typeof c === 'number') return String(c)
          if (Array.isArray(c)) return c.map(extract).join('')
          if (React.isValidElement(c)) return extract(c.props?.children)
          return ''
        }
        label = extract(node.props.children)
        return
      }
      if (node.props && node.props.children) {
        const nested = getLabelFromChildren(node.props.children, val)
        if (nested) label = nested
      }
    })
    return label
  }
  const selectedLabel = useMemo(() => getLabelFromChildren(children, internal), [children, internal])
  const handleChange = (val) => {
    setInternal(val)
    onValueChange && onValueChange(val)
    setOpen(false)
  }
  return (
    <div className="relative">
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child
        if (child.type === SelectTrigger) {
          return React.cloneElement(child, { onClick: () => setOpen((o) => !o), value: internal, label: selectedLabel })
        }
        if (child.type === SelectContent) {
          return open ? React.cloneElement(child, { onSelect: handleChange }) : null
        }
        return child
      })}
    </div>
  )
}

export function SelectTrigger({ children, onClick, value, label }) {
  return (
    <button type="button" onClick={onClick} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-left">
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child
        if (child.type === SelectValue) {
          return React.cloneElement(child, { value, label })
        }
        return child
      })}
    </button>
  )
}

export function SelectValue({ placeholder = 'Select…', value, label }) {
  return <span className="text-gray-700">{label || value || placeholder}</span>
}

export function SelectContent({ children, onSelect }) {
  return (
    <div className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow">
      <ul className="max-h-60 overflow-auto">
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return child
          return React.cloneElement(child, { onSelect })
        })}
      </ul>
    </div>
  )
}

export function SelectItem({ value, children, onSelect }) {
  return (
    <li>
      <button type="button" className="w-full px-3 py-2 text-left hover:bg-gray-100" onClick={() => onSelect && onSelect(value)}>
        {children}
      </button>
    </li>
  )
}


