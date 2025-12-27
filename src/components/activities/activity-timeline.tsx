'use client'

import { useState } from 'react'
import { formatDateTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToggleActivityComplete, useDeleteActivity } from '@/hooks/use-activities'
import { useToast } from '@/hooks/use-toast'
import { ACTIVITY_TYPES, type ActivityWithRelations } from '@/services/activities.service'
import {
  Phone,
  Users,
  Mail,
  CheckSquare,
  FileText,
  MapPin,
  MoreVertical,
  Pencil,
  Trash2,
  Clock,
  Building2,
  User,
  Briefcase,
  FolderKanban,
} from 'lucide-react'
import { ActivityFormDialog } from './activity-form-dialog'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Phone,
  Users,
  Mail,
  CheckSquare,
  FileText,
  MapPin,
}

interface ActivityTimelineProps {
  activities: ActivityWithRelations[]
  showRelations?: boolean
}

export function ActivityTimeline({ activities, showRelations = true }: ActivityTimelineProps) {
  const { toast } = useToast()
  const [editingActivity, setEditingActivity] = useState<ActivityWithRelations | null>(null)
  const toggleComplete = useToggleActivityComplete()
  const deleteActivity = useDeleteActivity()

  const handleToggleComplete = async (activity: ActivityWithRelations) => {
    try {
      await toggleComplete.mutateAsync({
        id: activity.id,
        isCompleted: !activity.is_completed,
      })
      toast({
        title: activity.is_completed ? 'Atividade reaberta' : 'Atividade concluída',
        description: activity.is_completed
          ? 'A atividade foi marcada como pendente.'
          : 'A atividade foi marcada como concluída.',
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao atualizar a atividade.',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteActivity.mutateAsync(id)
      toast({
        title: 'Atividade excluída',
        description: 'A atividade foi excluída com sucesso.',
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao excluir a atividade.',
        variant: 'destructive',
      })
    }
  }

  const getActivityIcon = (type: string) => {
    const activityType = ACTIVITY_TYPES.find((t) => t.value === type)
    if (!activityType) return FileText
    return iconMap[activityType.icon] || FileText
  }

  const getActivityLabel = (type: string) => {
    const activityType = ACTIVITY_TYPES.find((t) => t.value === type)
    return activityType?.label || type
  }

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date()
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <CheckSquare className="h-12 w-12 mb-2 opacity-50" />
        <p>Nenhuma atividade encontrada</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = getActivityIcon(activity.type)
          const overdue = !activity.is_completed && isOverdue(activity.due_date)

          return (
            <div
              key={activity.id}
              className={cn(
                'flex gap-4 p-4 rounded-lg border bg-card transition-colors',
                activity.is_completed && 'opacity-60',
                overdue && 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950'
              )}
            >
              <div className="flex-shrink-0 pt-0.5">
                <Checkbox
                  checked={activity.is_completed}
                  onCheckedChange={() => handleToggleComplete(activity)}
                  className="h-5 w-5"
                />
              </div>

              <div
                className={cn(
                  'flex-shrink-0 p-2 rounded-full',
                  activity.is_completed
                    ? 'bg-muted text-muted-foreground'
                    : overdue
                    ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'
                    : 'bg-primary/10 text-primary'
                )}
              >
                <Icon className="h-4 w-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p
                      className={cn(
                        'font-medium',
                        activity.is_completed && 'line-through'
                      )}
                    >
                      {activity.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {getActivityLabel(activity.type)}
                    </p>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingActivity(activity)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(activity.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {activity.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {activity.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                  {activity.due_date && (
                    <span
                      className={cn(
                        'flex items-center gap-1',
                        overdue && 'text-red-600 dark:text-red-400'
                      )}
                    >
                      <Clock className="h-3 w-3" />
                      {formatDateTime(activity.due_date)}
                      {overdue && ' (Atrasada)'}
                    </span>
                  )}

                  {showRelations && (
                    <>
                      {activity.company && (
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {activity.company.name}
                        </span>
                      )}

                      {activity.contact && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {activity.contact.first_name} {activity.contact.last_name}
                        </span>
                      )}

                      {activity.deal && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          {activity.deal.title}
                        </span>
                      )}

                      {activity.project && (
                        <span className="flex items-center gap-1">
                          <FolderKanban className="h-3 w-3" />
                          {activity.project.name}
                        </span>
                      )}
                    </>
                  )}

                  {activity.owner && (
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {activity.owner.full_name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <ActivityFormDialog
        open={!!editingActivity}
        onOpenChange={(open) => !open && setEditingActivity(null)}
        activity={editingActivity}
      />
    </>
  )
}
