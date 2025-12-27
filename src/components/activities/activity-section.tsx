'use client'

import { useState } from 'react'
import { Plus, CheckSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ActivityTimeline } from './activity-timeline'
import { ActivityFormDialog } from './activity-form-dialog'
import { useActivities } from '@/hooks/use-activities'
import type { ActivityFilters } from '@/services/activities.service'

interface ActivitySectionProps {
  companyId?: string
  contactId?: string
  dealId?: string
  projectId?: string
  title?: string
}

export function ActivitySection({
  companyId,
  contactId,
  dealId,
  projectId,
  title = 'Atividades',
}: ActivitySectionProps) {
  const [showFormDialog, setShowFormDialog] = useState(false)

  const filters: ActivityFilters = {
    company_id: companyId,
    contact_id: contactId,
    deal_id: dealId,
    project_id: projectId,
  }

  const { data: activities, isLoading } = useActivities(filters)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <CheckSquare className="h-5 w-5" />
          {title}
        </CardTitle>
        <Button size="sm" onClick={() => setShowFormDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : activities && activities.length > 0 ? (
          <ActivityTimeline activities={activities} showRelations={false} />
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
            <CheckSquare className="h-10 w-10 mb-2 opacity-50" />
            <p className="text-sm">Nenhuma atividade registrada</p>
            <Button
              variant="link"
              size="sm"
              className="mt-2"
              onClick={() => setShowFormDialog(true)}
            >
              Criar primeira atividade
            </Button>
          </div>
        )}
      </CardContent>

      <ActivityFormDialog
        open={showFormDialog}
        onOpenChange={setShowFormDialog}
        defaultValues={{
          company_id: companyId,
          contact_id: contactId,
          deal_id: dealId,
          project_id: projectId,
        }}
      />
    </Card>
  )
}
