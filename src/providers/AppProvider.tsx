import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import type { Project, Activity, DashboardMetrics, User } from '../types'
import { generateProjectCode, isOverdue, isUpcoming } from '../lib/utils'

// Mock data store keys
const PROJECTS_KEY = 'ec-tracker-projects'
const ACTIVITIES_KEY = 'ec-tracker-activities'
const SESSION_KEY = 'ec-tracker-session'
const THEME_KEY = 'ec-tracker-theme'

interface AppContextType {
  // Theme
  isDark: boolean
  toggleTheme: () => void
  
  // Auth
  user: User | null
  isAuthenticated: boolean
  isAuthLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  
  // Projects
  projects: Project[]
  projectsLoading: boolean
  createProject: (project: Omit<Project, 'id' | 'code' | 'created_at' | 'progress' | 'completion_percentage' | 'completed_tasks' | 'pending_tasks' | 'overdue_tasks' | 'activities'>) => Promise<Project>
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  getProject: (id: string) => Project | undefined
  
  // Activities
  activities: Activity[]
  activitiesLoading: boolean
  createActivity: (activity: Omit<Activity, 'id' | 'created_at'>) => Promise<Activity>
  updateActivity: (id: string, updates: Partial<Activity>) => Promise<void>
  deleteActivity: (id: string) => Promise<void>
  getProjectActivities: (projectId: string) => Activity[]
  
  // Metrics
  metrics: DashboardMetrics
  refreshData: () => void
}

const AppContext = createContext<AppContextType | null>(null)

function safeParseJSON<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : fallback
  } catch {
    return fallback
  }
}

function saveJSON<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    console.error('Failed to save to localStorage:', e)
  }
}

// Seed data for demo
const seedProjects: Project[] = [
  {
    id: 'proj-1',
    code: 'YRBH01',
    client_name: 'Bhumi Homes',
    project_name: 'Bhumi Heights EC Application',
    owner_name: 'Chinmay',
    category: 'Residential',
    location: 'Mumbai',
    details: 'Environmental clearance application for 25-story residential complex with 200 units.',
    mep_name: 'YR Engineering',
    architect_name: 'BH Architects',
    status: 'In Progress',
    progress: 35,
    completion_percentage: 35,
    completed_tasks: 7,
    pending_tasks: 11,
    overdue_tasks: 2,
    activities: 20,
    created_at: '2026-01-15T10:00:00Z'
  },
  {
    id: 'proj-2',
    code: 'SMPL02',
    client_name: 'Sunrise Mall Pvt Ltd',
    project_name: 'Sunrise Commercial Complex',
    owner_name: 'Rahul',
    category: 'Commercial',
    location: 'Pune',
    details: 'EC application for mixed-use commercial complex with retail and office spaces.',
    mep_name: 'SM MEP Solutions',
    architect_name: 'PL Design Studio',
    status: 'In Progress',
    progress: 60,
    completion_percentage: 60,
    completed_tasks: 12,
    pending_tasks: 6,
    overdue_tasks: 1,
    activities: 20,
    created_at: '2026-02-01T10:00:00Z'
  },
  {
    id: 'proj-3',
    code: 'GIHI03',
    client_name: 'Green Infrastructure',
    project_name: 'Highway Interchange Project',
    owner_name: 'Priya',
    category: 'Infrastructure',
    location: 'Nashik',
    details: 'Environmental compliance for new highway interchange connecting NH48 and state highway.',
    mep_name: 'GI Consultants',
    architect_name: 'Highway Designs Inc',
    status: 'Not Started',
    progress: 0,
    completion_percentage: 0,
    completed_tasks: 0,
    pending_tasks: 20,
    overdue_tasks: 0,
    activities: 20,
    created_at: '2026-04-20T10:00:00Z'
  },
  {
    id: 'proj-4',
    code: 'MPHO04',
    client_name: 'Medicare Plus',
    project_name: 'Multi-Specialty Hospital',
    owner_name: 'Amit',
    category: 'Healthcare',
    location: 'Nagpur',
    details: 'EC clearance for 500-bed multi-specialty hospital with research facility.',
    mep_name: 'MP Healthcare MEP',
    architect_name: 'Hospital Architects',
    status: 'Completed',
    progress: 100,
    completion_percentage: 100,
    completed_tasks: 20,
    pending_tasks: 0,
    overdue_tasks: 0,
    activities: 20,
    created_at: '2025-08-10T10:00:00Z'
  }
]

const seedActivities: Activity[] = seedProjects.flatMap((project, projIndex) => {
  const steps = [
    'Project Allocation',
    'Sharing Checklist',
    'Kick-off Meeting with Client, MEP and Architect',
    'Data Collation from Client, MEP and Architect',
    'Application for EC',
    'Check Demand Note for MPCB for Scrutiny Fee Payment',
    'Client Intimation & Uploading of Payment on Site',
    'Intimation for MPCB Site Visit and Report',
    'MPCB Report Uploading on Parivesh',
    'PPT Preparation',
    'Mock PPT with All Stakeholders',
    'Listing on SEAC-2 Agenda',
    'Intimation for Scrutiny Fee Payment as soon as Agenda',
    'Submissions to SEAC-2 Committee',
    'SEAC-2 Hearing',
    'Compliance/PPT - SEAC II in case of ADS/Absent/Deferred Case',
    'MOM SEAC-2',
    'SEIAA Compliance Submissions',
    'SEIAA MOM',
    'Final EC'
  ]
  
  const completedCount = project.completed_tasks
  const assignees = ['Client', 'MEP', 'Architect', 'KIPL Team']
  
  return steps.map((step, index) => {
    const baseDate = new Date(project.created_at)
    baseDate.setDate(baseDate.getDate() + index * 5)
    
    let status: Activity['status'] = 'Not Started'
    let started_at: string | null = null
    let completed_at: string | null = null
    
    if (index < completedCount) {
      status = 'Completed'
      started_at = baseDate.toISOString()
      const endDate = new Date(baseDate)
      endDate.setDate(endDate.getDate() + 3)
      completed_at = endDate.toISOString()
    } else if (index === completedCount) {
      status = 'In Progress'
      started_at = baseDate.toISOString()
    }
    
    return {
      id: `act-${projIndex + 1}-${index + 1}`,
      project_id: project.id,
      activity_name: step,
      assigned_to: assignees[index % assignees.length],
      started_at,
      completed_at,
      status,
      priority: index < 5 ? 'High' : index < 12 ? 'Medium' : 'Low',
      created_at: project.created_at
    }
  })
})

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Theme
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem(THEME_KEY)
    return saved === 'dark'
  })
  
  // Auth
  const [user, setUser] = useState<User | null>(() => safeParseJSON(SESSION_KEY, null))
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  
  // Data
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = safeParseJSON<Project[]>(PROJECTS_KEY, [])
    return saved.length > 0 ? saved : seedProjects
  })
  const [activities, setActivities] = useState<Activity[]>(() => {
    const saved = safeParseJSON<Activity[]>(ACTIVITIES_KEY, [])
    return saved.length > 0 ? saved : seedActivities
  })
  const [projectsLoading, setProjectsLoading] = useState(false)
  const [activitiesLoading, setActivitiesLoading] = useState(false)
  
  // Theme effect
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light')
  }, [isDark])
  
  // Persist data
  useEffect(() => {
    saveJSON(PROJECTS_KEY, projects)
  }, [projects])
  
  useEffect(() => {
    saveJSON(ACTIVITIES_KEY, activities)
  }, [activities])
  
  useEffect(() => {
    if (user) {
      saveJSON(SESSION_KEY, user)
    } else {
      localStorage.removeItem(SESSION_KEY)
    }
  }, [user])
  
  // Auth initialization
  useEffect(() => {
    const timer = setTimeout(() => setIsAuthLoading(false), 300)
    return () => clearTimeout(timer)
  }, [])
  
  const toggleTheme = useCallback(() => setIsDark(prev => !prev), [])
  
  const login = useCallback(async (email: string, _password: string) => {
    setIsAuthLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const isAdmin = email.toLowerCase().endsWith('@kesariprojects.com')
    setUser({
      id: 'user-1',
      email,
      name: email.split('@')[0],
      role: isAdmin ? 'Admin' : 'Client'
    })
    setIsAuthLoading(false)
  }, [])
  
  const logout = useCallback(() => {
    setUser(null)
  }, [])
  
  // Project CRUD
  const createProject = useCallback(async (projectData: Omit<Project, 'id' | 'code' | 'created_at' | 'progress' | 'completion_percentage' | 'completed_tasks' | 'pending_tasks' | 'overdue_tasks' | 'activities'>): Promise<Project> => {
    const code = generateProjectCode(projects, projectData.mep_name, projectData.architect_name, projectData.client_name)
    
    const newProject: Project = {
      ...projectData,
      id: `proj-${Date.now()}`,
      code,
      progress: 0,
      completion_percentage: 0,
      completed_tasks: 0,
      pending_tasks: 20,
      overdue_tasks: 0,
      activities: 20,
      created_at: new Date().toISOString()
    }
    
    // Create default activities for the new project
    const defaultActivities: Activity[] = [
      'Project Allocation',
      'Sharing Checklist',
      'Kick-off Meeting with Client, MEP and Architect',
      'Data Collation from Client, MEP and Architect',
      'Application for EC',
      'Check Demand Note for MPCB for Scrutiny Fee Payment',
      'Client Intimation & Uploading of Payment on Site',
      'Intimation for MPCB Site Visit and Report',
      'MPCB Report Uploading on Parivesh',
      'PPT Preparation',
      'Mock PPT with All Stakeholders',
      'Listing on SEAC-2 Agenda',
      'Intimation for Scrutiny Fee Payment as soon as Agenda',
      'Submissions to SEAC-2 Committee',
      'SEAC-2 Hearing',
      'Compliance/PPT - SEAC II in case of ADS/Absent/Deferred Case',
      'MOM SEAC-2',
      'SEIAA Compliance Submissions',
      'SEIAA MOM',
      'Final EC'
    ].map((step, index) => ({
      id: `act-${newProject.id}-${index + 1}`,
      project_id: newProject.id,
      activity_name: step,
      assigned_to: index < 5 ? 'KIPL Team' : index < 10 ? 'Client' : 'KIPL Team',
      started_at: null,
      completed_at: null,
      status: 'Not Started' as const,
      priority: (index < 5 ? 'High' : index < 12 ? 'Medium' : 'Low') as const,
      created_at: new Date().toISOString()
    }))
    
    setProjects(prev => [...prev, newProject])
    setActivities(prev => [...prev, ...defaultActivities])
    
    return newProject
  }, [projects])
  
  const updateProject = useCallback(async (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => 
      p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
    ))
  }, [])
  
  const deleteProject = useCallback(async (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id))
    setActivities(prev => prev.filter(a => a.project_id !== id))
  }, [])
  
  const getProject = useCallback((id: string) => {
    return projects.find(p => p.id === id)
  }, [projects])
  
  // Activity CRUD
  const createActivity = useCallback(async (activityData: Omit<Activity, 'id' | 'created_at'>): Promise<Activity> => {
    const newActivity: Activity = {
      ...activityData,
      id: `act-${Date.now()}`,
      created_at: new Date().toISOString()
    }
    
    setActivities(prev => [...prev, newActivity])
    
    // Update project activity count
    setProjects(prev => prev.map(p => {
      if (p.id === activityData.project_id) {
        return { ...p, activities: p.activities + 1, pending_tasks: p.pending_tasks + 1 }
      }
      return p
    }))
    
    return newActivity
  }, [])
  
  const updateActivity = useCallback(async (id: string, updates: Partial<Activity>) => {
    setActivities(prev => {
      const updated = prev.map(a => 
        a.id === id ? { ...a, ...updates, updated_at: new Date().toISOString() } : a
      )
      
      // Recalculate project metrics
      const activity = prev.find(a => a.id === id)
      if (activity && updates.status) {
        const projectActivities = updated.filter(a => a.project_id === activity.project_id)
        const completed = projectActivities.filter(a => a.status === 'Completed').length
        const total = projectActivities.length
        const overdue = projectActivities.filter(a => 
          isOverdue(a.completed_at || a.started_at, a.status)
        ).length
        
        setProjects(p => p.map(proj => {
          if (proj.id === activity.project_id) {
            const progress = Math.round((completed / total) * 100)
            return {
              ...proj,
              completed_tasks: completed,
              pending_tasks: total - completed,
              overdue_tasks: overdue,
              progress,
              completion_percentage: progress,
              status: progress === 100 ? 'Completed' : progress > 0 ? 'In Progress' : 'Not Started'
            }
          }
          return proj
        }))
      }
      
      return updated
    })
  }, [])
  
  const deleteActivity = useCallback(async (id: string) => {
    const activity = activities.find(a => a.id === id)
    if (activity) {
      setActivities(prev => prev.filter(a => a.id !== id))
      setProjects(prev => prev.map(p => {
        if (p.id === activity.project_id) {
          return { ...p, activities: Math.max(0, p.activities - 1) }
        }
        return p
      }))
    }
  }, [activities])
  
  const getProjectActivities = useCallback((projectId: string) => {
    return activities.filter(a => a.project_id === projectId)
  }, [activities])
  
  // Calculate metrics
  const metrics = useMemo<DashboardMetrics>(() => {
    const totalProjects = projects.length
    const activeProjects = projects.filter(p => p.status === 'In Progress').length
    const completedProjects = projects.filter(p => p.status === 'Completed').length
    
    const totalActivities = activities.length
    const completedActivities = activities.filter(a => a.status === 'Completed').length
    const pendingActivities = activities.filter(a => a.status !== 'Completed').length
    const overdueActivities = activities.filter(a => 
      isOverdue(a.completed_at || a.started_at, a.status)
    ).length
    const upcomingActivities = activities.filter(a => 
      isUpcoming(a.completed_at || a.started_at, a.status)
    ).length
    
    const averageCompletion = totalProjects > 0
      ? Math.round(projects.reduce((sum, p) => sum + p.completion_percentage, 0) / totalProjects)
      : 0
    
    return {
      totalProjects,
      activeProjects,
      completedProjects,
      totalActivities,
      completedActivities,
      pendingActivities,
      overdueActivities,
      upcomingActivities,
      averageCompletion
    }
  }, [projects, activities])
  
  const refreshData = useCallback(() => {
    setProjectsLoading(true)
    setActivitiesLoading(true)
    setTimeout(() => {
      setProjectsLoading(false)
      setActivitiesLoading(false)
    }, 300)
  }, [])
  
  const value = useMemo<AppContextType>(() => ({
    isDark,
    toggleTheme,
    user,
    isAuthenticated: !!user,
    isAuthLoading,
    login,
    logout,
    projects,
    projectsLoading,
    createProject,
    updateProject,
    deleteProject,
    getProject,
    activities,
    activitiesLoading,
    createActivity,
    updateActivity,
    deleteActivity,
    getProjectActivities,
    metrics,
    refreshData
  }), [
    isDark, toggleTheme, user, isAuthLoading, login, logout,
    projects, projectsLoading, createProject, updateProject, deleteProject, getProject,
    activities, activitiesLoading, createActivity, updateActivity, deleteActivity, getProjectActivities,
    metrics, refreshData
  ])
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
