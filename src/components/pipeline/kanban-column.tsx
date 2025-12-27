'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { DealCard } from './deal-card'
import { formatCurrency } from '@/lib/utils'
import type { DealWithRelations } from '@/services/deals.service'
import { cn } from '@/lib/utils'

interface PipelineStage {
  id: string
  name: string
  color: string
  probability: number
}

interface KanbanColumnProps {
  stage: PipelineStage
  deals: DealWithRelations[]
  onAddDeal: (stageId: string) => void
  onDealClick: (deal: DealWithRelations) => void
}

export function KanbanColumn({
  stage,
  deals,
  onAddDeal,
  onDealClick,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
    data: {
      type: 'column',
      stage,
    },
  })

  const totalValue = deals.reduce((sum, deal) => sum + (deal.value || 0), 0)
  const dealIds = deals.map((deal) => deal.id)

  return (
    <div className="flex flex-col w-[300px] min-w-[300px] bg-muted/30 rounded-lg">
      {/* Header */}
      <div className="p-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: stage.color }}
            />
            <h3 className="font-medium text-sm">{stage.name}</h3>
            <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {deals.length}
            </span>
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            {stage.probability}%
          </span>
        </div>
        {totalValue > 0 && (
          <div className="mt-1 text-xs text-muted-foreground">
            Total: {formatCurrency(totalValue)}
          </div>
        )}
      </div>

      {/* Cards Container */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 p-2 space-y-2 overflow-y-auto min-h-[200px]',
          isOver && 'bg-primary/5'
        )}
      >
        <SortableContext items={dealIds} strategy={verticalListSortingStrategy}>
          {deals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              onClick={() => onDealClick(deal)}
            />
          ))}
        </SortableContext>

        {deals.length === 0 && (
          <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">
            Nenhum negócio
          </div>
        )}
      </div>

      {/* Add Button */}
      <div className="p-2 border-t">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground"
          onClick={() => onAddDeal(stage.id)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Adicionar negócio
        </Button>
      </div>
    </div>
  )
}
