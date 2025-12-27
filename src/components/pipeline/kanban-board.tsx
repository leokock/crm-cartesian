'use client'

import { useState, useMemo } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { KanbanColumn } from './kanban-column'
import { DealCard } from './deal-card'
import { DealFormDialog } from './deal-form-dialog'
import { DealDetailSheet } from './deal-detail-sheet'
import { usePipelineStages } from '@/hooks/use-pipeline'
import { useDealsByStage, useMoveDealToStage } from '@/hooks/use-deals'
import { Skeleton } from '@/components/ui/skeleton'
import type { DealWithRelations } from '@/services/deals.service'

export function KanbanBoard() {
  const { data: stages, isLoading: stagesLoading } = usePipelineStages()
  const { data: deals, isLoading: dealsLoading } = useDealsByStage()
  const moveDealMutation = useMoveDealToStage()

  const [activeDeal, setActiveDeal] = useState<DealWithRelations | null>(null)
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null)
  const [selectedDeal, setSelectedDeal] = useState<DealWithRelations | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Group deals by stage
  const dealsByStage = useMemo(() => {
    if (!deals || !stages) return {}

    const grouped: Record<string, DealWithRelations[]> = {}
    stages.forEach((stage) => {
      grouped[stage.id] = []
    })

    deals.forEach((deal) => {
      if (deal.stage_id && grouped[deal.stage_id]) {
        grouped[deal.stage_id].push(deal)
      }
    })

    return grouped
  }, [deals, stages])

  function handleDragStart(event: DragStartEvent) {
    const { active } = event
    const deal = deals?.find((d) => d.id === active.id)
    if (deal) {
      setActiveDeal(deal)
    }
  }

  function handleDragOver(event: DragOverEvent) {
    // Handle drag over if needed for visual feedback
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    setActiveDeal(null)

    if (!over) return

    const dealId = active.id as string
    const deal = deals?.find((d) => d.id === dealId)
    if (!deal) return

    // Determine the target stage
    let targetStageId: string | null = null

    // Check if dropped over a column
    if (over.data.current?.type === 'column') {
      targetStageId = over.id as string
    } else if (over.data.current?.type === 'deal') {
      // If dropped over another deal, use that deal's stage
      const overDeal = deals?.find((d) => d.id === over.id)
      if (overDeal) {
        targetStageId = overDeal.stage_id
      }
    }

    // Move the deal if the stage changed
    if (targetStageId && targetStageId !== deal.stage_id) {
      moveDealMutation.mutate({ dealId, stageId: targetStageId })
    }
  }

  function handleAddDeal(stageId: string) {
    setSelectedStageId(stageId)
    setSelectedDeal(null)
    setIsFormOpen(true)
  }

  function handleDealClick(deal: DealWithRelations) {
    setSelectedDeal(deal)
    setIsDetailOpen(true)
  }

  function handleEditDeal(deal: DealWithRelations) {
    setSelectedDeal(deal)
    setSelectedStageId(deal.stage_id)
    setIsDetailOpen(false)
    setIsFormOpen(true)
  }

  if (stagesLoading || dealsLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="w-[300px] min-w-[300px]">
            <Skeleton className="h-12 mb-2" />
            <Skeleton className="h-32" />
          </div>
        ))}
      </div>
    )
  }

  if (!stages || stages.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Nenhum estágio do pipeline configurado.
      </div>
    )
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-200px)]">
          {stages.map((stage) => (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              deals={dealsByStage[stage.id] || []}
              onAddDeal={handleAddDeal}
              onDealClick={handleDealClick}
            />
          ))}
        </div>

        <DragOverlay>
          {activeDeal ? (
            <div className="opacity-80">
              <DealCard deal={activeDeal} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <DealFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        stageId={selectedStageId}
        deal={selectedDeal}
      />

      <DealDetailSheet
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        deal={selectedDeal}
        onEdit={handleEditDeal}
      />
    </>
  )
}
