'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Phone,
  Users,
  Mail,
  CheckSquare,
  FileText,
  MapPin,
  ArrowRight,
  Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDateTime } from '@/lib/utils'
import { useUpcomingActivities, useToggleActivityComplete } from '@/hooks/use-activities'
import { useToast } from '@/hooks/use-toast'
import { ACTIVITY_TYPES } from '@/services/activities.service'
import { ROUTES } from '@/lib/constants/routes'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Phone,
  Users,
  Mail,
  CheckSquare,
  FileText,
  MapPin,
}

function ActivitySkeleton() {
  return (
    <div className="flex items-center gap-3 py-2">
      <Skeleton className="h-5 w-5 rounded" />
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-4 w-32 mb-1" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  )
}

export function RecentActivities() {
  const { toast } = useToast()
  const { data: activities, isLoading } = useUpcomingActivities(5)
  const toggleComplete = useToggleActivityComplete()

  const handleToggle = async (id: string, isCompleted: boolean) => {
    try {
      await toggleComplete.mutateAsync({ id, isCompleted: !isCompleted })
      toast({
        title: isCompleted ? 'Atividade reaberta' : 'Atividade concluída',
      })
    } catch {
      toast({
        title: 'Erro ao atualizar atividade',
        variant: 'destructive',
      })
    }
  }

  const getActivityIcon = (type: string) => {
    const activityType = ACTIVITY_TYPES.find((t) => t.value === type)
    if (!activityType) return FileText
    return iconMap[activityType.icon] || FileText
  }

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date()
  }

  return (
    <Card className="col-span-3">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Próximas Atividades</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href={ROUTES.ACTIVITIES}>
            Ver todas
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <ActivitySkeleton />
            <ActivitySkeleton />
            <ActivitySkeleton />
          </div>
        ) : !activities || activities.length === 0 ? (
          <div className="flex h-[180px] flex-col items-center justify-center text-muted-foreground">
            <CheckSquare className="h-10 w-10 mb-2 opacity-50" />
            <p>Nenhuma atividade pendente</p>
            <Button variant="link" asChild className="mt-2">
              <Link href={ROUTES.ACTIVITIES}>Criar atividade</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-1">
            {activities.map((activity) => {
              const Icon = getActivityIcon(activity.type)
              const overdue = isOverdue(activity.due_date)

              return (
                <div
                  key={activity.id}
                  className={cn(
                    'flex items-center gap-3 py-2 px-2 rounded-lg transition-colors hover:bg-muted/50',
                    overdue && 'bg-red-50 dark:bg-red-950/20'
                  )}
                >
                  <Checkbox
                    checked={activity.is_completed}
                    onCheckedChange={() => handleToggle(activity.id, activity.is_completed)}
                    className="h-4 w-4"
                  />
                  <div
                    className={cn(
                      'p-1.5 rounded-full',
                      overdue
                        ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'
                        : 'bg-primary/10 text-primary'
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.title}</p>
                    {activity.due_date && (
                      <p
                        className={cn(
                          'text-xs flex items-center gap-1',
                          overdue
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-muted-foreground'
                        )}
                      >
                        <Clock className="h-3 w-3" />
                        {formatDateTime(activity.due_date)}
                        {overdue && ' (Atrasada)'}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
