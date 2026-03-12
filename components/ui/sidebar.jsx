import React from 'react'

export function SidebarProvider({ children }) {
  return children
}

export function Sidebar({ children, className = '' }) {
  return <aside className={`w-72 bg-white ${className}`}>{children}</aside>
}

export function SidebarHeader({ children, className = '' }) {
  return <div className={`p-4 ${className}`}>{children}</div>
}

export function SidebarFooter({ children, className = '' }) {
  return <div className={`p-4 ${className}`}>{children}</div>
}

export function SidebarContent({ children, className = '' }) {
  return <div className={className}>{children}</div>
}

export function SidebarGroup({ children }) { return <div>{children}</div> }
export function SidebarGroupLabel({ children, className = '' }) { return <div className={className}>{children}</div> }
export function SidebarGroupContent({ children }) { return <div>{children}</div> }
export function SidebarMenu({ children }) { return <ul>{children}</ul> }
export function SidebarMenuItem({ children }) { return <li>{children}</li> }
export function SidebarMenuButton({ children, className = '', asChild = false }) {
  if (asChild && React.isValidElement(children)) {
    const prev = children.props?.className || ''
    return React.cloneElement(children, { className: `${prev} ${className}`.trim() })
  }
  return <button className={className}>{children}</button>
}
export function SidebarTrigger({ className = '', ...props }) { return <button className={`inline-flex items-center ${className}`} {...props}>Menu</button> }


