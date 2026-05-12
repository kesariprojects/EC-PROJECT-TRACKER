import React, { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Filter,
  Plus,
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowLeft,
  Save,
  X,
  Play,
  Pause,
  Download
} from 'lucide-react'
import { useApp } from '../providers/AppProvider'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Select,
  PageHeader,
  Badge,
  ProgressBar,
  EmptyState,
  Modal,
  Tabs
} from '../components/ui'
import { formatDate, formatDateForInput, cn, getStatusColor, getPriorityColor } from '../lib/utils'
import { exportActivitiesToExcel, exportProjectReportToExcel } from '../lib/export'
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from '../types'
import type { Activity, ActivityStatus, Priority } from '../types'

export default function Activities() {
  const { projectId } = useParams()
  const { 
    projects, 
    activities, 
    getProjectActivities, 
    getProject, 
    updateActivity,
    createActivity,
    deleteActivity 
  } = useApp()
  
  const project = projectId ? getProject(projectId) : null
  const scopedActivities = projectId ? getProjectActivities(projectId) : activities
  
  // UI State
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  
  // Edit form state
  const [editForm, setEditForm] = useState<Partial<Activity>>({})
  
  // Create form state
  const [createForm, setCreateForm] = useState({
    activity_name: '',
    assigned_to: '',
    priority: 'Medium' as Priority,
    status: 'Not Started' as ActivityStatus,
    project_id: projectId || ''
  })
  
  // Filter activities
  const filteredActivities = useMemo(() => {
    let result = [...scopedActivities]
    
    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(a =>
        a.activity_name.toLowerCase().includes(searchLower) ||
        a.assigned_to.toLowerCase().includes(searchLower)
      )
    }
    
    if (statusFilter !== 'all') {
      result = result.filter(a => a.status === statusFilter)
    }
    
    if (priorityFilter !== 'all') {
      result = result.filter(a => a.priority === priorityFilter)
    }
    
    return result
  }, [scopedActivities, search, statusFilter, priorityFilter])
  
  // Group by status for tabs
  const activityCounts = {
    all: scopedActivities.length,
    'Not Started': scopedActivities.filter(a => a.status === 'Not Started').length,
    'In Progress': scopedActivities.filter(a => a.status === 'In Progress').length,
    'Completed': scopedActivities.filter(a => a.status === 'Completed').length,
    'On Hold': scopedActivities.filter(a => a.status === 'On Hold').length
  }
  
  const handleStartEdit = (activity: Activity) => {
    setEditingId(activity.id)
    setEditForm({
      status: activity.status,
      priority: activity.priority,
      assigned_to: activity.assigned_to,
      started_at: activity.started_at,
      completed_at: activity.completed_at
    })
  }
  
  const handleSaveEdit = async (id: string) => {
    await updateActivity(id, editForm)
    setEditingId(null)
    setEditForm({})
  }
  
  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }
  
  const handleQuickStatusChange = async (id: string, newStatus: ActivityStatus) => {
    const updates: Partial<Activity> = { status: newStatus }
    
    if (newStatus === 'In Progress' && !scopedActivities.find(a => a.id === id)?.started_at) {
      updates.started_at = new Date().toISOString()
    }
    
    if (newStatus === 'Completed') {
      updates.completed_at = new Date().toISOString()
    }
    
    await updateActivity(id, updates)
  }
  
  const handleCreateActivity = async () => {
    if (!createForm.activity_name || !createForm.assigned_to) return
    
    await createActivity({
      ...createForm,
      project_id: projectId || projects[0]?.id || '',
      started_at: null,
      completed_at: null
    })
    
    setCreateForm({
      activity_name: '',
      assigned_to: '',
      priority: 'Medium',
      status: 'Not Started',
      project_id: projectId || ''
    })
    setIsCreateModalOpen(false)
  }
  
  const handleDeleteActivity = async (id: string) => {
    if (confirm('Are you sure you want to delete this activity?')) {
      await deleteActivity(id)
    }
  }
  
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    ...STATUS_OPTIONS.map(s => ({ value: s, label: s }))
  ]
  
  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    ...PRIORITY_OPTIONS.map(p => ({ value: p, label: p }))
  ]
  
  const tabs = [
    { id: 'all', label: 'All', count: activityCounts.all },
    { id: 'Not Started', label: 'Not Started', count: activityCounts['Not Started'] },
    { id: 'In Progress', label: 'In Progress', count: activityCounts['In Progress'] },
    { id: 'Completed', label: 'Completed', count: activityCounts['Completed'] },
    { id: 'On Hold', label: 'On Hold', count: activityCounts['On Hold'] }
  ]
  
  // Calculate progress
  const progress = scopedActivities.length > 0 
    ? Math.round((activityCounts.Completed / scopedActivities.length) * 100)
    : 0
  
  return (
    <div className="space-y-6">
      {projectId && (
        <Link to={`/projects/${projectId}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={16} />
          Back to Project
        </Link>
      )}
      
      <PageHeader
        eyebrow="Process Tracker"
        title={project ? `${project.project_name} Activities` : 'All Activities'}
        description="Track and manage EC process activities with real-time status updates."
        action={
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                if (project) {
                  exportProjectReportToExcel(project, scopedActivities)
                } else {
                  exportActivitiesToExcel(scopedActivities, projects)
                }
              }}
            >
              <Download size={16} className="mr-2" />
              Export
            </Button>
            {projectId && (
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus size={16} className="mr-2" />
                Add Activity
              </Button>
            )}
          </div>
        }
      />
      
      {/* Progress Overview */}
      <Card>
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Overall Progress</p>
              <p className="text-3xl font-semibold">{progress}%</p>
            </div>
            <div className="flex-1 max-w-md">
              <ProgressBar value={progress} />
            </div>
            <div className="flex gap-6 text-center">
              <div>
                <p className="text-2xl font-semibold text-success">{activityCounts.Completed}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-info">{activityCounts['In Progress']}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-muted-foreground">{activityCounts['Not Started']}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search activities..."
                className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            
            <div className="flex gap-2">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={statusOptions}
                className="w-36"
              />
              <Select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                options={priorityOptions}
                className="w-36"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tabs */}
      <Tabs 
        tabs={tabs} 
        activeTab={statusFilter} 
        onChange={setStatusFilter} 
      />
      
      {/* Activities Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Sr No.
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Activity
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Assigned To
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Priority
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Started
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Completed
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {filteredActivities.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center">
                      <EmptyState
                        icon={<CheckCircle2 size={40} className="text-muted-foreground" />}
                        title="No activities found"
                        description={search || statusFilter !== 'all' ? "Try adjusting your filters" : "Add activities to track progress"}
                      />
                    </td>
                  </tr>
                ) : (
                  filteredActivities.map((activity, index) => {
                    const isEditing = editingId === activity.id
                    const isExpanded = expandedId === activity.id
                    const statusColors = getStatusColor(activity.status)
                    const priorityColors = getPriorityColor(activity.priority)
                    const proj = !projectId ? projects.find(p => p.id === activity.project_id) : null
                    
                    return (
                      <motion.tr
                        key={activity.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={cn(
                          'border-b border-border transition-colors',
                          isExpanded ? 'bg-accent/30' : 'hover:bg-accent/50'
                        )}
                      >
                        <td className="px-4 py-3 text-sm font-medium">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-start gap-2">
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : activity.id)}
                              className="mt-0.5 p-1 rounded hover:bg-accent transition-colors"
                            >
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                            <div>
                              <p className="font-medium text-sm">{activity.activity_name}</p>
                              {proj && (
                                <p className="text-xs text-muted-foreground">{proj.code}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <Input
                              value={editForm.assigned_to || ''}
                              onChange={(e) => setEditForm({ ...editForm, assigned_to: e.target.value })}
                              className="h-8 text-sm"
                            />
                          ) : (
                            <span className="text-sm">{activity.assigned_to}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <Select
                              value={editForm.priority || activity.priority}
                              onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as Priority })}
                              options={PRIORITY_OPTIONS.map(p => ({ value: p, label: p }))}
                              className="h-8 text-sm"
                            />
                          ) : (
                            <Badge className={cn(priorityColors.bg, priorityColors.text)}>
                              {activity.priority}
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <Select
                              value={editForm.status || activity.status}
                              onChange={(e) => setEditForm({ ...editForm, status: e.target.value as ActivityStatus })}
                              options={STATUS_OPTIONS.map(s => ({ value: s, label: s }))}
                              className="h-8 text-sm"
                            />
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className={cn('w-2 h-2 rounded-full', statusColors.dot)} />
                              <Badge className={cn(statusColors.bg, statusColors.text, statusColors.border)}>
                                {activity.status}
                              </Badge>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {isEditing ? (
                            <Input
                              type="date"
                              value={formatDateForInput(editForm.started_at)}
                              onChange={(e) => setEditForm({ ...editForm, started_at: e.target.value || null })}
                              className="h-8 text-sm"
                            />
                          ) : (
                            formatDate(activity.started_at)
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {isEditing ? (
                            <Input
                              type="date"
                              value={formatDateForInput(editForm.completed_at)}
                              onChange={(e) => setEditForm({ ...editForm, completed_at: e.target.value || null })}
                              className="h-8 text-sm"
                            />
                          ) : (
                            formatDate(activity.completed_at)
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => handleSaveEdit(activity.id)}
                                  className="p-2 rounded-lg hover:bg-success/10 text-success transition-colors"
                                  title="Save"
                                >
                                  <Save size={14} />
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                                  title="Cancel"
                                >
                                  <X size={14} />
                                </button>
                              </>
                            ) : (
                              <>
                                {activity.status === 'Not Started' && (
                                  <button
                                    onClick={() => handleQuickStatusChange(activity.id, 'In Progress')}
                                    className="p-2 rounded-lg hover:bg-info/10 text-info transition-colors"
                                    title="Start"
                                  >
                                    <Play size={14} />
                                  </button>
                                )}
                                {activity.status === 'In Progress' && (
                                  <button
                                    onClick={() => handleQuickStatusChange(activity.id, 'Completed')}
                                    className="p-2 rounded-lg hover:bg-success/10 text-success transition-colors"
                                    title="Complete"
                                  >
                                    <CheckCircle2 size={14} />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleStartEdit(activity)}
                                  className="p-2 rounded-lg hover:bg-accent transition-colors"
                                  title="Edit"
                                >
                                  <Edit2 size={14} />
                                </button>
                                {projectId && (
                                  <button
                                    onClick={() => handleDeleteActivity(activity.id)}
                                    className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </Card>
      
      {/* Create Activity Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add New Activity"
        description="Create a new activity for this project"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Activity Name"
            value={createForm.activity_name}
            onChange={(e) => setCreateForm({ ...createForm, activity_name: e.target.value })}
            placeholder="Enter activity name"
            required
          />
          
          <Input
            label="Assigned To"
            value={createForm.assigned_to}
            onChange={(e) => setCreateForm({ ...createForm, assigned_to: e.target.value })}
            placeholder="Enter assignee name"
            required
          />
          
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Priority"
              value={createForm.priority}
              onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value as Priority })}
              options={PRIORITY_OPTIONS.map(p => ({ value: p, label: p }))}
            />
            
            <Select
              label="Status"
              value={createForm.status}
              onChange={(e) => setCreateForm({ ...createForm, status: e.target.value as ActivityStatus })}
              options={STATUS_OPTIONS.map(s => ({ value: s, label: s }))}
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateActivity}>
              Create Activity
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
