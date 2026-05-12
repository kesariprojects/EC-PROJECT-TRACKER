import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-'
  const d = new Date(date)
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

export function formatDateForInput(date: string | Date | null | undefined): string {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  return d.toISOString().split('T')[0]
}

export function generateProjectCode(
  projects: { code: string }[],
  mepName: string,
  architectName: string,
  clientName: string
): string {
  const mepInitial = (mepName || '').trim().slice(0, 2).toUpperCase()
  const archInitial = (architectName || '').trim().slice(0, 2).toUpperCase()
  const clientInitial = (clientName || 'CL').trim().slice(0, 2).toUpperCase()
  const base = `${mepInitial}${archInitial}${clientInitial}`.replace(/\s/g, '') || 'PRJ'
  
  let serial = (projects?.length || 0) + 1
  let code = `${base}${String(serial).padStart(2, '0')}`
  
  while (projects?.some(p => p.code?.toUpperCase() === code.toUpperCase())) {
    serial++
    code = `${base}${String(serial).padStart(2, '0')}`
  }
  
  return code
}

export function getStatusColor(status: string): {
  bg: string
  text: string
  border: string
  dot: string
} {
  switch (status?.toLowerCase()) {
    case 'completed':
      return {
        bg: 'bg-success/10',
        text: 'text-success',
        border: 'border-success/20',
        dot: 'bg-success'
      }
    case 'in progress':
      return {
        bg: 'bg-info/10',
        text: 'text-info',
        border: 'border-info/20',
        dot: 'bg-info'
      }
    case 'on hold':
      return {
        bg: 'bg-warning/10',
        text: 'text-warning',
        border: 'border-warning/20',
        dot: 'bg-warning'
      }
    case 'overdue':
      return {
        bg: 'bg-destructive/10',
        text: 'text-destructive',
        border: 'border-destructive/20',
        dot: 'bg-destructive'
      }
    default:
      return {
        bg: 'bg-muted',
        text: 'text-muted-foreground',
        border: 'border-muted',
        dot: 'bg-muted-foreground'
      }
  }
}

export function getPriorityColor(priority: string): {
  bg: string
  text: string
} {
  switch (priority?.toLowerCase()) {
    case 'high':
      return { bg: 'bg-destructive/10', text: 'text-destructive' }
    case 'medium':
      return { bg: 'bg-warning/10', text: 'text-warning' }
    case 'low':
      return { bg: 'bg-success/10', text: 'text-success' }
    default:
      return { bg: 'bg-muted', text: 'text-muted-foreground' }
  }
}

export function isOverdue(endDate: string | Date | null | undefined, status: string): boolean {
  if (!endDate || status?.toLowerCase() === 'completed') return false
  const end = new Date(endDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)
  return end < today
}

export function isUpcoming(endDate: string | Date | null | undefined, status: string, daysAhead = 3): boolean {
  if (!endDate || status?.toLowerCase() === 'completed') return false
  const end = new Date(endDate)
  const today = new Date()
  const future = new Date()
  future.setDate(today.getDate() + daysAhead)
  today.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)
  future.setHours(0, 0, 0, 0)
  return end >= today && end <= future
}

export function calculateProgress(completedTasks: number, totalTasks: number): number {
  if (totalTasks === 0) return 0
  return Math.round((completedTasks / totalTasks) * 100)
}
