import React from 'react'
import { useLocation, useParams, Link } from 'react-router-dom'
import { Menu, Moon, Sun, LogOut, ChevronRight, RefreshCw } from 'lucide-react'
import { useApp } from '../../providers/AppProvider'
import { Button } from '../ui'

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { isDark, toggleTheme, user, logout, getProject, refreshData, projectsLoading } = useApp()
  const location = useLocation()
  const { projectId } = useParams()
  
  const project = projectId ? getProject(projectId) : null
  
  const getPageTitle = () => {
    const path = location.pathname
    if (path === '/') return 'Dashboard'
    if (path === '/projects') return 'Projects'
    if (path === '/activities') return 'Activities'
    if (path === '/analytics') return 'Analytics'
    if (path === '/alerts') return 'Alerts'
    if (project) return project.project_name
    return 'EC Tracker'
  }
  
  const getBreadcrumbs = () => {
    const crumbs = []
    
    if (projectId && project) {
      crumbs.push({ label: 'Projects', to: '/projects' })
      crumbs.push({ label: project.project_name, to: `/projects/${projectId}` })
      
      if (location.pathname.includes('/activities')) {
        crumbs.push({ label: 'Activities', to: `/projects/${projectId}/activities` })
      } else if (location.pathname.includes('/analytics')) {
        crumbs.push({ label: 'Analytics', to: `/projects/${projectId}/analytics` })
      } else if (location.pathname.includes('/alerts')) {
        crumbs.push({ label: 'Alerts', to: `/projects/${projectId}/alerts` })
      }
    }
    
    return crumbs
  }
  
  const breadcrumbs = getBreadcrumbs()
  
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <button
            className="rounded-lg p-2 hover:bg-accent lg:hidden"
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          
          <div>
            {breadcrumbs.length > 0 ? (
              <nav className="flex items-center gap-1 text-sm">
                {breadcrumbs.map((crumb, index) => (
                  <React.Fragment key={crumb.to}>
                    {index > 0 && <ChevronRight size={14} className="text-muted-foreground" />}
                    <Link 
                      to={crumb.to}
                      className={index === breadcrumbs.length - 1 
                        ? 'font-medium text-foreground' 
                        : 'text-muted-foreground hover:text-foreground'
                      }
                    >
                      {crumb.label}
                    </Link>
                  </React.Fragment>
                ))}
              </nav>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">EC Project Progress Tracker</p>
                <h2 className="font-semibold tracking-tight">{getPageTitle()}</h2>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshData}
            className="hidden sm:flex"
            disabled={projectsLoading}
          >
            <RefreshCw size={16} className={projectsLoading ? 'animate-spin' : ''} />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </Button>
          
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-muted/30">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm font-medium">{user?.role || 'Admin'}</span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            aria-label="Logout"
          >
            <LogOut size={16} />
          </Button>
        </div>
      </div>
    </header>
  )
}
