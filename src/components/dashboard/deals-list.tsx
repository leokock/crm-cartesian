'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  FolderKanban,
  ArrowRight,
  Calendar,
  Building2,
  Clock,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useRecentDeals, useDealsNearClosing } from '@/hooks/use-dashboard'
import { ROUTES } from '@/lib/constants/routes'

function DealSkeleton() {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex-1">
        <Skeleton className="h-4 w-32 mb-1" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-6 w-20" />
    </div>
  )
}

export function RecentDeals() {
  const { data: deals, isLoading } = useRecentDeals(5)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">Negócios Recentes</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href={ROUTES.PIPELINE}>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <DealSkeleton />
            <DealSkeleton />
            <DealSkeleton />
          </div>
        ) : !deals || deals.length === 0 ? (
          <div className="flex h-[120px] flex-col items-center justify-center text-muted-foreground">
            <FolderKanban className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">Nenhum negócio ainda</p>
          </div>
        ) : (
          <div className="space-y-3">
            {deals.map((deal) => (
              <Link
                key={deal.id}
                href={ROUTES.PIPELINE}
                className="flex items-center justify-between py-2 px-2 -mx-2 rounded-lg transition-colors hover:bg-muted/50"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {deal.stage && (
                      <div
                        className="h-2 w-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: deal.stage.color }}
                      />
                    )}
                    <p className="text-sm font-medium truncate">{deal.title}</p>
                  </div>
                  {deal.company && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Building2 className="h-3 w-3" />
                      {deal.company.name}
                    </p>
                  )}
                </div>
                {deal.value && (
                  <Badge variant="secondary" className="ml-2 flex-shrink-0">
                    {formatCurrency(deal.value)}
                  </Badge>
                )}
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function DealsNearClosing() {
  const { data: deals, isLoading } = useDealsNearClosing(5)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Próximos do Fechamento
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <DealSkeleton />
            <DealSkeleton />
            <DealSkeleton />
          </div>
        ) : !deals || deals.length === 0 ? (
          <div className="flex h-[120px] flex-col items-center justify-center text-muted-foreground">
            <Calendar className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">Nenhum negócio próximo</p>
            <p className="text-xs">do fechamento esta semana</p>
          </div>
        ) : (
          <div className="space-y-3">
            {deals.map((deal) => (
              <Link
                key={deal.id}
                href={ROUTES.PIPELINE}
                className="flex items-center justify-between py-2 px-2 -mx-2 rounded-lg transition-colors hover:bg-muted/50"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {deal.stage && (
                      <div
                        className="h-2 w-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: deal.stage.color }}
                      />
                    )}
                    <p className="text-sm font-medium truncate">{deal.title}</p>
                  </div>
                  {deal.expected_close_date && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Calendar className="h-3 w-3" />
                      Fechamento: {formatDate(deal.expected_close_date)}
                    </p>
                  )}
                </div>
                {deal.value && (
                  <Badge variant="secondary" className="ml-2 flex-shrink-0">
                    {formatCurrency(deal.value)}
                  </Badge>
                )}
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
