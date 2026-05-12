import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  FolderKanban,
  X,
  Download
} from 'lucide-react'
import { useApp } from '../providers/AppProvider'
import {
  Card,
  CardContent,
  Button,
  Input,
  Select,
  Textarea,
  PageHeader,
  Badge,
  ProgressBar,
  EmptyState,
  Modal
} from '../components/ui'
import { formatDate, cn } from '../lib/utils'
import { exportProjectsToExcel } from '../lib/export'
import { CATEGORY_OPTIONS, OWNER_OPTIONS, STATUS_OPTIONS } from '../types'
import type { Project, ProjectStatus } from '../types'

export default function Projects() {
  const { projects, createProject, updateProject, deleteProject } = useApp()
  
  // UI State
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [ownerFilter, setOwnerFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'progress'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  
  // Form State
  const [formData, setFormData] = useState({
    client_name: '',
    project_name: '',
    owner_name: OWNER_OPTIONS[0],
    category: CATEGORY_OPTIONS[0],
    location: '',
    details: '',
    mep_name: '',
    architect_name: '',
    status: 'Not Started' as ProjectStatus
  })
  
  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    let result = [...projects]
    
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(p => 
        p.project_name.toLowerCase().includes(searchLower) ||
        p.client_name.toLowerCase().includes(searchLower) ||
        p.code.toLowerCase().includes(searchLower) ||
        p.location.toLowerCase().includes(searchLower)
      )
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(p => p.status === statusFilter)
    }
    
    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter(p => p.category === categoryFilter)
    }
    
    // Owner filter
    if (ownerFilter !== 'all') {
      result = result.filter(p => p.owner_name === ownerFilter)
    }
    
    // Sort
    result.sort((a, b) => {
      let comparison = 0
      if (sortBy === 'name') {
        comparison = a.project_name.localeCompare(b.project_name)
      } else if (sortBy === 'date') {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      } else if (sortBy === 'progress') {
        comparison = a.completion_percentage - b.completion_percentage
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })
    
    return result
  }, [projects, search, statusFilter, categoryFilter, ownerFilter, sortBy, sortOrder])
  
  const resetForm = () => {
    setFormData({
      client_name: '',
      project_name: '',
      owner_name: OWNER_OPTIONS[0],
      category: CATEGORY_OPTIONS[0],
      location: '',
      details: '',
      mep_name: '',
      architect_name: '',
      status: 'Not Started'
    })
  }
  
  const handleCreateProject = async () => {
    await createProject(formData)
    resetForm()
    setIsCreateModalOpen(false)
  }
  
  const handleEditProject = (project: Project) => {
    setEditingProject(project)
    setFormData({
      client_name: project.client_name,
      project_name: project.project_name,
      owner_name: project.owner_name,
      category: project.category,
      location: project.location,
      details: project.details,
      mep_name: project.mep_name,
      architect_name: project.architect_name,
      status: project.status
    })
    setIsEditModalOpen(true)
  }
  
  const handleUpdateProject = async () => {
    if (editingProject) {
      await updateProject(editingProject.id, formData)
      setEditingProject(null)
      resetForm()
      setIsEditModalOpen(false)
    }
  }
  
  const handleDeleteProject = async (id: string) => {
    setIsDeleting(id)
    await deleteProject(id)
    setIsDeleting(null)
  }
  
  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }
  
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    ...STATUS_OPTIONS.map(s => ({ value: s, label: s }))
  ]
  
  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...CATEGORY_OPTIONS.map(c => ({ value: c, label: c }))
  ]
  
  const ownerOptions = [
    { value: 'all', label: 'All Owners' },
    ...OWNER_OPTIONS.map(o => ({ value: o, label: o }))
  ]
  
  const ProjectForm = ({ onSubmit, submitLabel }: { onSubmit: () => void; submitLabel: string }) => (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Client Name"
          value={formData.client_name}
          onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
          placeholder="Enter client name"
          required
        />
        <Input
          label="Project Name"
          value={formData.project_name}
          onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
          placeholder="Enter project name"
          required
        />
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Project Owner"
          value={formData.owner_name}
          onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
          options={OWNER_OPTIONS.map(o => ({ value: o, label: o }))}
        />
        <Select
          label="Category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          options={CATEGORY_OPTIONS.map(c => ({ value: c, label: c }))}
        />
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="MEP Name"
          value={formData.mep_name}
          onChange={(e) => setFormData({ ...formData, mep_name: e.target.value })}
          placeholder="MEP consultant name"
          required
        />
        <Input
          label="Architect Name"
          value={formData.architect_name}
          onChange={(e) => setFormData({ ...formData, architect_name: e.target.value })}
          placeholder="Architect name"
          required
        />
      </div>
      
      <Input
        label="Location"
        value={formData.location}
        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
        placeholder="Project location"
      />
      
      <Textarea
        label="Project Details"
        value={formData.details}
        onChange={(e) => setFormData({ ...formData, details: e.target.value })}
        placeholder="Additional project details..."
        rows={3}
      />
      
      {editingProject && (
        <Select
          label="Status"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
          options={STATUS_OPTIONS.map(s => ({ value: s, label: s }))}
        />
      )}
      
      <div className="flex justify-end gap-3 pt-4">
        <Button 
          variant="outline" 
          onClick={() => {
            resetForm()
            setIsCreateModalOpen(false)
            setIsEditModalOpen(false)
            setEditingProject(null)
          }}
        >
          Cancel
        </Button>
        <Button onClick={onSubmit}>
          {submitLabel}
        </Button>
      </div>
    </div>
  )
  
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Projects"
        title="Project Directory"
        description="Create, manage, and track all EC projects across your portfolio."
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => exportProjectsToExcel(filteredProjects)}>
              <Download size={16} className="mr-2" />
              Export
            </Button>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus size={16} className="mr-2" />
              New Project
            </Button>
          </div>
        }
      />
      
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
                placeholder="Search projects..."
                className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={statusOptions}
                className="w-36"
              />
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                options={categoryOptions}
                className="w-40"
              />
              <Select
                value={ownerFilter}
                onChange={(e) => setOwnerFilter(e.target.value)}
                options={ownerOptions}
                className="w-36"
              />
              
              <div className="flex gap-1 border border-input rounded-lg">
                <button
                  onClick={() => toggleSort('date')}
                  className={cn(
                    'px-3 py-2 text-xs font-medium rounded-l-md',
                    sortBy === 'date' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                  )}
                >
                  Date
                </button>
                <button
                  onClick={() => toggleSort('name')}
                  className={cn(
                    'px-3 py-2 text-xs font-medium',
                    sortBy === 'name' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                  )}
                >
                  Name
                </button>
                <button
                  onClick={() => toggleSort('progress')}
                  className={cn(
                    'px-3 py-2 text-xs font-medium rounded-r-md',
                    sortBy === 'progress' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                  )}
                >
                  Progress
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <Card>
          <EmptyState
            icon={<FolderKanban size={40} className="text-muted-foreground" />}
            title="No projects found"
            description={search || statusFilter !== 'all' ? "Try adjusting your filters" : "Create your first project to get started"}
            action={
              !search && statusFilter === 'all' && (
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus size={16} className="mr-2" />
                  New Project
                </Button>
              )
            }
          />
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card hover className="h-full">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="font-mono text-xs">
                            {project.code}
                          </Badge>
                          <Badge 
                            variant={
                              project.status === 'Completed' ? 'success' :
                              project.status === 'In Progress' ? 'info' :
                              project.status === 'On Hold' ? 'warning' : 'default'
                            }
                          >
                            {project.status}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-sm truncate">{project.project_name}</h3>
                        <p className="text-xs text-muted-foreground truncate">{project.client_name}</p>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditProject(project)}
                          className="p-2 rounded-lg hover:bg-accent transition-colors"
                          title="Edit project"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                          title="Delete project"
                          disabled={isDeleting === project.id}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Owner:</span>
                          <p className="font-medium">{project.owner_name}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Category:</span>
                          <p className="font-medium">{project.category}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Location:</span>
                          <p className="font-medium">{project.location || '-'}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Created:</span>
                          <p className="font-medium">{formatDate(project.created_at)}</p>
                        </div>
                      </div>
                      
                      <ProgressBar value={project.completion_percentage} showLabel />
                      
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex gap-3 text-xs text-muted-foreground">
                          <span>{project.completed_tasks}/{project.activities} tasks</span>
                          {project.overdue_tasks > 0 && (
                            <span className="text-destructive">{project.overdue_tasks} overdue</span>
                          )}
                        </div>
                        
                        <Link to={`/projects/${project.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye size={14} className="mr-1" />
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
      
      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          resetForm()
          setIsCreateModalOpen(false)
        }}
        title="Create New Project"
        description="Add a new EC project to your portfolio."
        size="lg"
      >
        <ProjectForm onSubmit={handleCreateProject} submitLabel="Create Project" />
      </Modal>
      
      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          resetForm()
          setEditingProject(null)
          setIsEditModalOpen(false)
        }}
        title="Edit Project"
        description={`Editing ${editingProject?.project_name || 'project'}`}
        size="lg"
      >
        <ProjectForm onSubmit={handleUpdateProject} submitLabel="Save Changes" />
      </Modal>
    </div>
  )
}
