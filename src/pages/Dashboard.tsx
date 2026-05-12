import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Activity
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts'
import { useApp } from '../providers/AppProvider'
import { Card, CardContent, CardHeader, CardTitle, PageHeader, Badge, ProgressBar } from '../components/ui'
import { cn, formatDate, getStatusColor } from '../lib/utils'

export default function Dashboard() {
  const { projects, activities, metrics } = useApp()
  
  // Prepare chart data
  const statusData = [
    { name: 'Completed', value: metrics.completedProjects, color: 'oklch(0.65 0.18 145)' },
    { name: 'In Progress', value: metrics.activeProjects, color: 'oklch(0.6 0.15 245)' },
    { name: 'Not Started', value: metrics.totalProjects - metrics.completedProjects - metrics.activeProjects, color: 'oklch(0.7 0.01 247)' }
  ]
  
  const projectProgressData = projects.slice(0, 6).map(p => ({
    name: p.code,
    progress: p.completion_percentage,
    completed: p.completed_tasks,
    pending: p.pending_tasks
  }))
  
  const activityTrend = [
    { month: 'Jan', completed: 12, started: 18 },
    { month: 'Feb', completed: 15, started: 22 },
    { month: 'Mar', completed: 20, started: 25 },
    { month: 'Apr', completed: 18, started: 20 },
    { month: 'May', completed: 25, started: 28 }
  ]
  
  const recentProjects = projects.slice(0, 4)
  const overdueActivities = activities.filter(a => {
    if (!a.completed_at && a.started_at && a.status !== 'Completed') {
      const start = new Date(a.started_at)
      const deadline = new Date(start)
      deadline.setDate(deadline.getDate() + 7)
      return deadline < new Date()
    }
    return false
  }).slice(0, 5)
  
  const metricCards = [
    {
      label: 'Total Projects',
      value: metrics.totalProjects,
      icon: FolderKanban,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      label: 'Completed',
      value: metrics.completedProjects,
      icon: CheckCircle2,
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      label: 'In Progress',
      value: metrics.activeProjects,
      icon: Activity,
      color: 'text-info',
      bgColor: 'bg-info/10'
    },
    {
      label: 'Avg Completion',
      value: `${metrics.averageCompletion}%`,
      icon: TrendingUp,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      label: 'Overdue Tasks',
      value: metrics.overdueActivities,
      icon: AlertTriangle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10'
    }
  ]
  
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin Dashboard"
        title="Project Overview"
        description="Monitor project progress, track activities, and view real-time analytics across all EC projects."
        action={
          <Link to="/projects">
            <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors">
              View All Projects
              <ArrowRight size={16} />
            </button>
          </Link>
        }
      />
      
      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
                  <div className="flex items-center justify-between">
                    <div className={cn('rounded-xl p-2.5', card.bgColor)}>
                      <Icon size={20} className={card.color} />
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">Live</span>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">{card.label}</p>
                  <p className="mt-1 text-3xl font-semibold tracking-tight">{card.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
      
      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Project Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Project Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Project Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Project Progress Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectProgressData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis type="category" dataKey="name" width={60} />
                  <Tooltip />
                  <Bar dataKey="progress" fill="oklch(0.45 0.15 145)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Activity Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Trend (Last 5 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityTrend}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="completed" 
                  stroke="oklch(0.65 0.18 145)" 
                  strokeWidth={2}
                  dot={{ fill: 'oklch(0.65 0.18 145)' }}
                  name="Completed"
                />
                <Line 
                  type="monotone" 
                  dataKey="started" 
                  stroke="oklch(0.6 0.15 245)" 
                  strokeWidth={2}
                  dot={{ fill: 'oklch(0.6 0.15 245)' }}
                  name="Started"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Recent Projects & Alerts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Recent Projects</CardTitle>
            <Link to="/projects" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProjects.map(project => {
                const statusColors = getStatusColor(project.status)
                return (
                  <Link 
                    key={project.id} 
                    to={`/projects/${project.id}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-accent/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">{project.project_name}</span>
                          <Badge variant={project.status === 'Completed' ? 'success' : project.status === 'In Progress' ? 'info' : 'default'}>
                            {project.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {project.client_name} - {project.code}
                        </p>
                      </div>
                      <div className="w-24 ml-4">
                        <ProgressBar value={project.completion_percentage} showLabel />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>
        
        {/* Overdue Activities */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-destructive" />
              Overdue Activities
            </CardTitle>
            <Link to="/alerts" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {overdueActivities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 size={40} className="text-success mb-3" />
                <p className="font-medium">All caught up!</p>
                <p className="text-sm text-muted-foreground">No overdue activities</p>
              </div>
            ) : (
              <div className="space-y-3">
                {overdueActivities.map(activity => {
                  const project = projects.find(p => p.id === activity.project_id)
                  return (
                    <div
                      key={activity.id}
                      className="p-3 rounded-xl border border-destructive/20 bg-destructive/5"
                    >
                      <p className="font-medium text-sm">{activity.activity_name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {project?.code} - {activity.assigned_to}
                      </p>
                      <p className="text-xs text-destructive mt-1">
                        Started: {formatDate(activity.started_at)}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
