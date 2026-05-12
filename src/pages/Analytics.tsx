import React from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
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
  Legend,
  AreaChart,
  Area
} from 'recharts'
import { 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Activity,
  Users,
  Calendar
} from 'lucide-react'
import { useApp } from '../providers/AppProvider'
import { Card, CardContent, CardHeader, CardTitle, PageHeader, ProgressBar } from '../components/ui'
import { cn } from '../lib/utils'

export default function Analytics() {
  const { projectId } = useParams()
  const { projects, activities, getProjectActivities, getProject, metrics } = useApp()
  
  const project = projectId ? getProject(projectId) : null
  const scopedActivities = projectId ? getProjectActivities(projectId) : activities
  const scopedProjects = projectId ? [project].filter(Boolean) : projects
  
  // Calculate scoped metrics
  const completedActivities = scopedActivities.filter(a => a.status === 'Completed').length
  const inProgressActivities = scopedActivities.filter(a => a.status === 'In Progress').length
  const notStartedActivities = scopedActivities.filter(a => a.status === 'Not Started').length
  const onHoldActivities = scopedActivities.filter(a => a.status === 'On Hold').length
  
  const progress = scopedActivities.length > 0 
    ? Math.round((completedActivities / scopedActivities.length) * 100)
    : 0
  
  // Status breakdown data
  const statusData = [
    { name: 'Completed', value: completedActivities, color: 'oklch(0.65 0.18 145)' },
    { name: 'In Progress', value: inProgressActivities, color: 'oklch(0.6 0.15 245)' },
    { name: 'Not Started', value: notStartedActivities, color: 'oklch(0.7 0.01 247)' },
    { name: 'On Hold', value: onHoldActivities, color: 'oklch(0.75 0.15 85)' }
  ].filter(d => d.value > 0)
  
  // Priority breakdown
  const priorityData = [
    { name: 'High', value: scopedActivities.filter(a => a.priority === 'High').length, color: 'oklch(0.577 0.245 27.325)' },
    { name: 'Medium', value: scopedActivities.filter(a => a.priority === 'Medium').length, color: 'oklch(0.75 0.15 85)' },
    { name: 'Low', value: scopedActivities.filter(a => a.priority === 'Low').length, color: 'oklch(0.65 0.18 145)' }
  ]
  
  // Assignee breakdown
  const assigneeMap = scopedActivities.reduce((acc, a) => {
    acc[a.assigned_to] = (acc[a.assigned_to] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const assigneeData = Object.entries(assigneeMap).map(([name, count]) => ({
    name,
    tasks: count,
    completed: scopedActivities.filter(a => a.assigned_to === name && a.status === 'Completed').length
  }))
  
  // Timeline data (by month)
  const timelineData = [
    { month: 'Jan', completed: 8, started: 12 },
    { month: 'Feb', completed: 12, started: 15 },
    { month: 'Mar', completed: 18, started: 20 },
    { month: 'Apr', completed: 15, started: 18 },
    { month: 'May', completed: 22, started: 25 }
  ]
  
  const metricCards = [
    {
      label: 'Overall Progress',
      value: `${progress}%`,
      icon: TrendingUp,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      label: 'Completed',
      value: completedActivities,
      icon: CheckCircle2,
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      label: 'In Progress',
      value: inProgressActivities,
      icon: Activity,
      color: 'text-info',
      bgColor: 'bg-info/10'
    },
    {
      label: 'Pending',
      value: notStartedActivities + onHoldActivities,
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    {
      label: 'Total Activities',
      value: scopedActivities.length,
      icon: Calendar,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted'
    }
  ]
  
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Analytics"
        title={project ? `${project.project_name} Analytics` : 'Portfolio Analytics'}
        description="Track progress, analyze completion rates, and monitor team productivity across all activities."
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
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className={cn('rounded-xl p-2.5', card.bgColor)}>
                      <Icon size={20} className={card.color} />
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">{card.label}</p>
                  <p className="mt-1 text-3xl font-semibold tracking-tight">{card.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
      
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Progress Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Overall Completion</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <div className="h-4 w-full overflow-hidden rounded-full bg-secondary">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground pt-2">
              <span>{completedActivities} completed</span>
              <span>{scopedActivities.length - completedActivities} remaining</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {statusData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Priority Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Priority Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Assignee Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users size={18} />
            Team Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={assigneeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="tasks" fill="oklch(0.6 0.15 245)" name="Total Tasks" radius={[0, 4, 4, 0]} />
                <Bar dataKey="completed" fill="oklch(0.65 0.18 145)" name="Completed" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="started" 
                  stackId="1"
                  stroke="oklch(0.6 0.15 245)" 
                  fill="oklch(0.6 0.15 245 / 0.2)"
                  name="Activities Started"
                />
                <Area 
                  type="monotone" 
                  dataKey="completed" 
                  stackId="2"
                  stroke="oklch(0.65 0.18 145)" 
                  fill="oklch(0.65 0.18 145 / 0.2)"
                  name="Activities Completed"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
