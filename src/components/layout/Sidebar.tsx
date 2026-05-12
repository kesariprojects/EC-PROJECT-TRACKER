import React from 'react'
import { NavLink, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, 
  FolderKanban, 
  ListTodo, 
  BarChart3, 
  AlertTriangle, 
  X,
  Building2
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { useApp } from '../../providers/AppProvider'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

const navItems = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'Projects', to: '/projects', icon: FolderKanban },
  { label: 'Activities', to: '/activities', icon: ListTodo },
  { label: 'Analytics', to: '/analytics', icon: BarChart3 },
  { label: 'Alerts', to: '/alerts', icon: AlertTriangle }
]

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { projects, metrics } = useApp()
  const { projectId } = useParams()
  
  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>
      
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-card/95 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Building2 size={20} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">KIPL</p>
              <h1 className="font-semibold tracking-tight">EC Tracker</h1>
            </div>
          </div>
          <button
            className="rounded-lg p-2 hover:bg-accent lg:hidden"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon
            const to = projectId && item.to !== '/' && item.to !== '/projects' 
              ? `/projects/${projectId}${item.to === '/activities' ? '/activities' : item.to === '/analytics' ? '/analytics' : item.to === '/alerts' ? '/alerts' : ''}`
              : item.to
            
            return (
              <NavLink
                key={item.to}
                to={to}
                onClick={onClose}
                className={({ isActive }) => cn(
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>
        
        {/* Stats footer */}
        <div className="border-t border-border p-4">
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <p className="text-sm font-medium">Active Projects</p>
            <p className="mt-1 text-2xl font-semibold">{metrics.activeProjects}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {metrics.totalProjects} total projects tracked
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}
