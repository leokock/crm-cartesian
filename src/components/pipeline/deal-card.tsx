'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Building2, Calendar, GripVertical } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { DealWithRelations } from '@/services/deals.service'
import { cn } from '@/lib/utils'

interface DealCardProps {
  deal: DealWithRelations
  onClick?: () => void
}

export function DealCard({ deal, onClick }: DealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: deal.id,
    data: {
      type: 'deal',
      deal,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const contactName = deal.contact
    ? `${deal.contact.first_name}${deal.contact.last_name ? ` ${deal.contact.last_name}` : ''}`
    : null

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'cursor-pointer hover:shadow-md transition-shadow',
        isDragging && 'opacity-50 shadow-lg'
      )}
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <button
            {...attributes}
            {...listeners}
            className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate">{deal.title}</h4>

            <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
              <Building2 className="h-3 w-3" />
              <span className="truncate">{deal.company?.name || 'Sem empresa'}</span>
            </div>

            {deal.value && (
              <div className="mt-2">
                <Badge variant="secondary" className="font-semibold">
                  {formatCurrency(deal.value)}
                </Badge>
              </div>
            )}

            <div className="flex items-center justify-between mt-2">
              {deal.expected_close_date && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(deal.expected_close_date)}</span>
                </div>
              )}

              {deal.owner && (
                <Avatar className="h-6 w-6">
                  <AvatarImage src={deal.owner.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">
                    {deal.owner.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>

            {contactName && (
              <div className="mt-1.5 text-xs text-muted-foreground truncate">
                {contactName}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
