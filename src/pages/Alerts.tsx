import React, { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertTriangle, Clock, CheckCircle2, ArrowRight } from 'lucide-react'
import { useApp } from '../providers/AppProvider'
import { Card, CardContent, PageHeader, EmptyState, Badge, Tabs } from '../components/ui'
import { formatDate, isOverdue, isUpcoming, cn } from '../lib/utils'

type AlertType = 'overdue' | 'upcoming' | 'all'

interface AlertItem {
  id: string
  activity_name: string
  project_id: string
  project_name: string
  project_code: string
  assigned_to: string
  due_date: string | null
  status: string
  type: 'overdue' | 'upcoming'
}

export default function Alerts() {
  const { projectId } = useParams()
  const { projects, activities, getProjectActivities, getProject } = useApp()
  const [activeTab, setActiveTab] = React.useState<AlertType>('all')
  
  const project = projectId ? getProject(projectId) : null
  const scopedActivities = projectId ? getProjectActivities(projectId) : activities
  
  // Generate alerts
  const alerts = useMemo<AlertItem[]>(() => {
    return scopedActivities
      .filter(a => a.status !== 'Completed')
      .map(a => {
        const proj = projects.find(p => p.id === a.project_id)
        const dueDate = a.started_at ? new Date(a.started_at) : null
        if (dueDate) {
          dueDate.setDate(dueDate.getDate() + 7) // 7 days to complete
        }
        
        const isOverdueAlert = dueDate && isOverdue(dueDate.toISOString(), a.status)
        const isUpcomingAlert = dueDate && isUpcoming(dueDate.toISOString(), a.status)
        
        if (!isOverdueAlert && !isUpcomingAlert) return null
        
        return {
          id: a.id,
          activity_name: a.activity_name,
          project_id: a.project_id,
          project_name: proj?.project_name || 'Unknown Project',
          project_code: proj?.code || 'N/A',
          assigned_to: a.assigned_to,
          due_date: dueDate?.toISOString() || null,
          status: a.status,
          type: isOverdueAlert ? 'overdue' : 'upcoming'
        } as AlertItem
      })
      .filter((a): a is AlertItem => a !== null)
  }, [scopedActivities, projects])
  
  const overdueAlerts = alerts.filter(a => a.type === 'overdue')
  const upcomingAlerts = alerts.filter(a => a.type === 'upcoming')
  
  const filteredAlerts = activeTab === 'all' 
    ? alerts 
    : alerts.filter(a => a.type === activeTab)
  
  const tabs = [
    { id: 'all', label: 'All Alerts', count: alerts.length },
    { id: 'overdue', label: 'Overdue', count: overdueAlerts.length },
    { id: 'upcoming', label: 'Upcoming', count: upcomingAlerts.length }
  ]
  
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Alerts"
        title={project ? `${project.project_name} Alerts` : 'Project Alerts'}
        description="Monitor overdue tasks and upcoming deadlines across your projects."
      />
      
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className={cn(
          'border-destructive/20',
          overdueAlerts.length > 0 && 'bg-destructive/5'
        )}>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl p-2.5 bg-destructive/10">
                <AlertTriangle size={20} className="text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overdue Tasks</p>
                <p className="text-2xl font-semibold">{overdueAlerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className={cn(
          'border-warning/20',
          upcomingAlerts.length > 0 && 'bg-warning/5'
        )}>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl p-2.5 bg-warning/10">
                <Clock size={20} className="text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Due Soon</p>
                <p className="text-2xl font-semibold">{upcomingAlerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-success/20 bg-success/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl p-2.5 bg-success/10">
                <CheckCircle2 size={20} className="text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">On Track</p>
                <p className="text-2xl font-semibold">
                  {scopedActivities.filter(a => a.status === 'Completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs */}
      <Tabs 
        tabs={tabs} 
        activeTab={activeTab} 
        onChange={(id) => setActiveTab(id as AlertType)} 
      />
      
      {/* Alerts List */}
      {filteredAlerts.length === 0 ? (
        <Card>
          <EmptyState
            icon={<CheckCircle2 size={40} className="text-success" />}
            title="No alerts"
            description="Everything is on track. All tasks are progressing as expected."
          />
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredAlerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card 
                className={cn(
                  'card-hover',
                  alert.type === 'overdue' 
                    ? 'border-destructive/30 bg-destructive/5' 
                    : 'border-warning/30 bg-warning/5'
                )}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={alert.type === 'overdue' ? 'destructive' : 'warning'}>
                          {alert.type === 'overdue' ? 'Overdue' : 'Due Soon'}
                        </Badge>
                        <Badge variant="outline">{alert.status}</Badge>
                      </div>
                      
                      <h3 className="font-medium text-sm truncate">{alert.activity_name}</h3>
                      
                      <p className="text-xs text-muted-foreground mt-1">
                        {alert.project_name} ({alert.project_code})
                      </p>
                      
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span>Assigned to: {alert.assigned_to}</span>
                        {alert.due_date && (
                          <span className={alert.type === 'overdue' ? 'text-destructive' : 'text-warning'}>
                            Due: {formatDate(alert.due_date)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <Link 
                      to={`/projects/${alert.project_id}/activities`}
                      className="flex-shrink-0 rounded-lg p-2 hover:bg-background transition-colors"
                    >
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
