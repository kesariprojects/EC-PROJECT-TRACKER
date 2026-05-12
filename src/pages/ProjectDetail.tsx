import React from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Calendar,
  MapPin,
  User,
  Building2,
  Briefcase,
  Edit2,
  ListTodo,
  BarChart3,
  Bell
} from 'lucide-react'
import { useApp } from '../providers/AppProvider'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  PageHeader,
  Badge,
  ProgressBar,
  Button,
  EmptyState
} from '../components/ui'
import { formatDate, cn } from '../lib/utils'

export default function ProjectDetail() {
  const { projectId } = useParams()
  const { getProject, getProjectActivities } = useApp()
  
  const project = projectId ? getProject(projectId) : null
  const activities = projectId ? getProjectActivities(projectId) : []
  
  if (!project) {
    return (
      <Card>
        <EmptyState
          icon={<AlertTriangle size={40} className="text-warning" />}
          title="Project not found"
          description="The project you are looking for does not exist or has been deleted."
          action={
            <Link to="/projects">
              <Button variant="outline">
                <ArrowLeft size={16} className="mr-2" />
                Back to Projects
              </Button>
            </Link>
          }
        />
      </Card>
    )
  }
  
  const completedActivities = activities.filter(a => a.status === 'Completed')
  const inProgressActivities = activities.filter(a => a.status === 'In Progress')
  const pendingActivities = activities.filter(a => a.status === 'Not Started' || a.status === 'On Hold')
  
  const recentActivities = [...activities]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
  
  const metricCards = [
    {
      label: 'Total Activities',
      value: activities.length,
      icon: ListTodo,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      label: 'Completed',
      value: completedActivities.length,
      icon: CheckCircle2,
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      label: 'In Progress',
      value: inProgressActivities.length,
      icon: Clock,
      color: 'text-info',
      bgColor: 'bg-info/10'
    },
    {
      label: 'Pending',
      value: pendingActivities.length,
      icon: AlertTriangle,
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    }
  ]
  
  const quickLinks = [
    { label: 'Activities', to: `/projects/${projectId}/activities`, icon: ListTodo },
    { label: 'Analytics', to: `/projects/${projectId}/analytics`, icon: BarChart3 },
    { label: 'Alerts', to: `/projects/${projectId}/alerts`, icon: Bell }
  ]
  
  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link to="/projects" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={16} />
        Back to Projects
      </Link>
      
      <PageHeader
        eyebrow={`Project ${project.code}`}
        title={project.project_name}
        description={project.details || 'No description provided'}
        action={
          <div className="flex gap-2">
            {quickLinks.map(link => (
              <Link key={link.to} to={link.to}>
                <Button variant="outline" size="sm">
                  <link.icon size={14} className="mr-1.5" />
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>
        }
      />
      
      {/* Project Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 flex-1">
              <div className="flex items-start gap-3">
                <div className="rounded-lg p-2 bg-muted">
                  <Building2 size={18} className="text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Client</p>
                  <p className="font-medium text-sm">{project.client_name}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="rounded-lg p-2 bg-muted">
                  <User size={18} className="text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Project Owner</p>
                  <p className="font-medium text-sm">{project.owner_name}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="rounded-lg p-2 bg-muted">
                  <MapPin size={18} className="text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="font-medium text-sm">{project.location || '-'}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="rounded-lg p-2 bg-muted">
                  <Briefcase size={18} className="text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Category</p>
                  <p className="font-medium text-sm">{project.category}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="rounded-lg p-2 bg-muted">
                  <User size={18} className="text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">MEP</p>
                  <p className="font-medium text-sm">{project.mep_name}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="rounded-lg p-2 bg-muted">
                  <User size={18} className="text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Architect</p>
                  <p className="font-medium text-sm">{project.architect_name}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="rounded-lg p-2 bg-muted">
                  <Calendar size={18} className="text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="font-medium text-sm">{formatDate(project.created_at)}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="rounded-lg p-2 bg-muted">
                  <TrendingUp size={18} className="text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
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
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Progress Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Overall Completion</span>
              <span className="text-2xl font-semibold">{project.completion_percentage}%</span>
            </div>
            <ProgressBar value={project.completion_percentage} />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{completedActivities.length} completed</span>
              <span>{pendingActivities.length + inProgressActivities.length} remaining</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((card, index) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="card-hover">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className={cn('rounded-xl p-3', card.bgColor)}>
                      <Icon size={20} className={card.color} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{card.label}</p>
                      <p className="text-2xl font-semibold">{card.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
      
      {/* Recent Activities */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Activities</CardTitle>
          <Link to={`/projects/${projectId}/activities`}>
            <Button variant="ghost" size="sm">View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentActivities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No activities yet</p>
          ) : (
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-2 h-2 rounded-full',
                      activity.status === 'Completed' ? 'bg-success' :
                      activity.status === 'In Progress' ? 'bg-info' :
                      activity.status === 'On Hold' ? 'bg-warning' : 'bg-muted-foreground'
                    )} />
                    <div>
                      <p className="font-medium text-sm">{activity.activity_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.assigned_to} - {activity.priority} priority
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={
                      activity.status === 'Completed' ? 'success' :
                      activity.status === 'In Progress' ? 'info' :
                      activity.status === 'On Hold' ? 'warning' : 'default'
                    }
                  >
                    {activity.status}
                  </Badge>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
