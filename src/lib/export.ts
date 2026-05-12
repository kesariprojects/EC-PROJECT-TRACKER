import * as XLSX from 'xlsx'
import type { Project, Activity } from '../types'
import { formatDate } from './utils'

export function exportProjectsToExcel(projects: Project[], filename = 'ec-projects') {
  const data = projects.map(p => ({
    'Project Code': p.code,
    'Client Name': p.client_name,
    'Project Name': p.project_name,
    'Owner': p.owner_name,
    'Category': p.category,
    'Location': p.location,
    'MEP': p.mep_name,
    'Architect': p.architect_name,
    'Status': p.status,
    'Progress (%)': p.completion_percentage,
    'Completed Tasks': p.completed_tasks,
    'Pending Tasks': p.pending_tasks,
    'Overdue Tasks': p.overdue_tasks,
    'Total Activities': p.activities,
    'Created Date': formatDate(p.created_at),
    'Details': p.details
  }))
  
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Projects')
  
  // Auto-size columns
  const maxWidth = 50
  const colWidths = Object.keys(data[0] || {}).map(key => ({
    wch: Math.min(maxWidth, Math.max(key.length, ...data.map(row => String(row[key as keyof typeof row] || '').length)))
  }))
  worksheet['!cols'] = colWidths
  
  XLSX.writeFile(workbook, `${filename}-${new Date().toISOString().split('T')[0]}.xlsx`)
}

export function exportActivitiesToExcel(
  activities: Activity[], 
  projects: Project[],
  filename = 'ec-activities'
) {
  const projectMap = new Map(projects.map(p => [p.id, p]))
  
  const data = activities.map((a, index) => {
    const project = projectMap.get(a.project_id)
    return {
      'Sr. No.': index + 1,
      'Project Code': project?.code || 'N/A',
      'Project Name': project?.project_name || 'Unknown',
      'Activity': a.activity_name,
      'Assigned To': a.assigned_to,
      'Priority': a.priority,
      'Status': a.status,
      'Started Date': formatDate(a.started_at),
      'Completed Date': formatDate(a.completed_at),
      'Created Date': formatDate(a.created_at)
    }
  })
  
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Activities')
  
  // Auto-size columns
  const maxWidth = 50
  if (data.length > 0) {
    const colWidths = Object.keys(data[0]).map(key => ({
      wch: Math.min(maxWidth, Math.max(key.length, ...data.map(row => String(row[key as keyof typeof row] || '').length)))
    }))
    worksheet['!cols'] = colWidths
  }
  
  XLSX.writeFile(workbook, `${filename}-${new Date().toISOString().split('T')[0]}.xlsx`)
}

export function exportProjectReportToExcel(
  project: Project,
  activities: Activity[],
  filename?: string
) {
  // Project summary sheet
  const summaryData = [{
    'Field': 'Project Code',
    'Value': project.code
  }, {
    'Field': 'Project Name',
    'Value': project.project_name
  }, {
    'Field': 'Client Name',
    'Value': project.client_name
  }, {
    'Field': 'Owner',
    'Value': project.owner_name
  }, {
    'Field': 'Category',
    'Value': project.category
  }, {
    'Field': 'Location',
    'Value': project.location
  }, {
    'Field': 'MEP',
    'Value': project.mep_name
  }, {
    'Field': 'Architect',
    'Value': project.architect_name
  }, {
    'Field': 'Status',
    'Value': project.status
  }, {
    'Field': 'Progress',
    'Value': `${project.completion_percentage}%`
  }, {
    'Field': 'Completed Tasks',
    'Value': project.completed_tasks
  }, {
    'Field': 'Pending Tasks',
    'Value': project.pending_tasks
  }, {
    'Field': 'Overdue Tasks',
    'Value': project.overdue_tasks
  }, {
    'Field': 'Created Date',
    'Value': formatDate(project.created_at)
  }]
  
  // Activities sheet
  const activitiesData = activities.map((a, index) => ({
    'Sr. No.': index + 1,
    'Activity': a.activity_name,
    'Assigned To': a.assigned_to,
    'Priority': a.priority,
    'Status': a.status,
    'Started Date': formatDate(a.started_at),
    'Completed Date': formatDate(a.completed_at)
  }))
  
  const workbook = XLSX.utils.book_new()
  
  // Add summary sheet
  const summarySheet = XLSX.utils.json_to_sheet(summaryData)
  summarySheet['!cols'] = [{ wch: 20 }, { wch: 40 }]
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Project Summary')
  
  // Add activities sheet
  const activitiesSheet = XLSX.utils.json_to_sheet(activitiesData)
  if (activitiesData.length > 0) {
    const colWidths = Object.keys(activitiesData[0]).map(key => ({
      wch: Math.min(50, Math.max(key.length, ...activitiesData.map(row => String(row[key as keyof typeof row] || '').length)))
    }))
    activitiesSheet['!cols'] = colWidths
  }
  XLSX.utils.book_append_sheet(workbook, activitiesSheet, 'Activities')
  
  const exportFilename = filename || `${project.code}-report`
  XLSX.writeFile(workbook, `${exportFilename}-${new Date().toISOString().split('T')[0]}.xlsx`)
}
