export type ProjectStatus = 'Not Started' | 'In Progress' | 'Completed' | 'On Hold'
export type ActivityStatus = 'Not Started' | 'In Progress' | 'Completed' | 'On Hold'
export type Priority = 'Low' | 'Medium' | 'High'

export interface Project {
  id: string
  code: string
  client_name: string
  project_name: string
  owner_name: string
  category: string
  location: string
  details: string
  mep_name: string
  architect_name: string
  status: ProjectStatus
  progress: number
  completion_percentage: number
  completed_tasks: number
  pending_tasks: number
  overdue_tasks: number
  activities: number
  created_at: string
  updated_at?: string
}

export interface Activity {
  id: string
  project_id: string
  activity_name: string
  assigned_to: string
  started_at: string | null
  completed_at: string | null
  status: ActivityStatus
  priority: Priority
  created_at: string
  updated_at?: string
}

export interface DashboardMetrics {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  totalActivities: number
  completedActivities: number
  pendingActivities: number
  overdueActivities: number
  upcomingActivities: number
  averageCompletion: number
}

export interface User {
  id: string
  email: string
  name: string
  role: 'Admin' | 'Client'
}

export interface Session {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

// EC Process Steps (Environmental Compliance)
export const EC_PROCESS_STEPS = [
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
] as const

export const STATUS_OPTIONS: ProjectStatus[] = ['Not Started', 'In Progress', 'Completed', 'On Hold']
export const PRIORITY_OPTIONS: Priority[] = ['Low', 'Medium', 'High']
export const CATEGORY_OPTIONS = [
  'Residential',
  'Commercial',
  'Industrial',
  'Infrastructure',
  'Mixed Use',
  'Hospitality',
  'Healthcare',
  'Educational',
  'Other'
] as const

export const OWNER_OPTIONS = [
  'Chinmay',
  'Rahul',
  'Priya',
  'Amit',
  'Sneha',
  'Others'
] as const
