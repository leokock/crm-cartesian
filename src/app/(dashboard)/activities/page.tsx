'use client'

import { useState } from 'react'
import { CheckSquare, Plus, Filter, Calendar, AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { SearchInput } from '@/components/shared/search-input'
import { ActivityTimeline } from '@/components/activities/activity-timeline'
import { ActivityFormDialog } from '@/components/activities/activity-form-dialog'
import { useActivities, useOverdueActivities } from '@/hooks/use-activities'
import { ACTIVITY_TYPES, type ActivityFilters } from '@/services/activities.service'
import type { Database } from '@/types/database.types'

type ActivityType = Database['public']['Tables']['activities']['Row']['type']

export default function ActivitiesPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [showFormDialog, setShowFormDialog] = useState(false)
  const [activeTab, setActiveTab] = useState('pending')

  const filters: ActivityFilters = {
    search: search || undefined,
    type: typeFilter !== 'all' ? (typeFilter as ActivityType) : undefined,
    is_completed: activeTab === 'completed' ? true : activeTab === 'pending' ? false : undefined,
  }

  const { data: activities, isLoading } = useActivities(filters)
  const { data: overdueActivities } = useOverdueActivities()

  const overdueCount = overdueActivities?.length || 0

  if (!isLoading && (!activities || activities.length === 0) && !search && typeFilter === 'all' && activeTab === 'pending') {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Atividades"
          description="Gerencie suas tarefas, ligações, reuniões e mais"
        />
        <EmptyState
          icon={CheckSquare}
          title="Nenhuma atividade cadastrada"
          description="Comece criando sua primeira atividade para acompanhar tarefas, ligações e reuniões."
          action={{
            label: 'Nova Atividade',
            onClick: () => setShowFormDialog(true),
          }}
        />
        <ActivityFormDialog
          open={showFormDialog}
          onOpenChange={setShowFormDialog}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Atividades"
        description="Gerencie suas tarefas, ligações, reuniões e mais"
      >
        <Button onClick={() => setShowFormDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Atividade
        </Button>
      </PageHeader>

      {overdueCount > 0 && (
        <div className="flex items-center gap-2 p-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          <span className="text-sm text-red-600 dark:text-red-400">
            Você tem {overdueCount} {overdueCount === 1 ? 'atividade atrasada' : 'atividades atrasadas'}
          </span>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-4">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar atividades..."
            className="max-w-sm"
          />

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {ACTIVITY_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <Calendar className="h-4 w-4" />
            Pendentes
            {activeTab !== 'pending' && activities && (
              <Badge variant="secondary" className="ml-1">
                {activities.filter(a => !a.is_completed).length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            <CheckSquare className="h-4 w-4" />
            Concluídas
          </TabsTrigger>
          <TabsTrigger value="all">
            Todas
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : activities && activities.length > 0 ? (
            <ActivityTimeline activities={activities} />
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <CheckSquare className="h-12 w-12 mb-2 opacity-50" />
              <p>
                {activeTab === 'pending'
                  ? 'Nenhuma atividade pendente'
                  : activeTab === 'completed'
                  ? 'Nenhuma atividade concluída'
                  : 'Nenhuma atividade encontrada'}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <ActivityFormDialog
        open={showFormDialog}
        onOpenChange={setShowFormDialog}
      />
    </div>
  )
}
