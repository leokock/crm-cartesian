'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  CheckCircle,
  Activity,
} from 'lucide-react'

interface ReportSummary {
  totalDeals: number
  wonDeals: number
  lostDeals: number
  openDeals: number
  totalValue: number
  wonValue: number
  conversionRate: number
  totalActivities: number
  completedActivities: number
  activityCompletionRate: number
}

interface ReportSummaryCardsProps {
  data: ReportSummary | undefined
  isLoading: boolean
}

export function ReportSummaryCards({ data, isLoading }: ReportSummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-24 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const cards = [
    {
      title: 'Total de Negócios',
      value: data?.totalDeals || 0,
      subtitle: `${data?.wonDeals || 0} ganhos, ${data?.lostDeals || 0} perdidos`,
      icon: Target,
      iconColor: 'text-blue-500',
    },
    {
      title: 'Valor Fechado',
      value: formatCurrency(data?.wonValue || 0),
      subtitle: `de ${formatCurrency(data?.totalValue || 0)} total`,
      icon: DollarSign,
      iconColor: 'text-green-500',
    },
    {
      title: 'Taxa de Conversão',
      value: `${data?.conversionRate || 0}%`,
      subtitle: `${data?.openDeals || 0} negócios em aberto`,
      icon: data?.conversionRate && data.conversionRate >= 50 ? TrendingUp : TrendingDown,
      iconColor: data?.conversionRate && data.conversionRate >= 50 ? 'text-green-500' : 'text-red-500',
    },
    {
      title: 'Atividades',
      value: data?.completedActivities || 0,
      subtitle: `${data?.activityCompletionRate || 0}% concluídas de ${data?.totalActivities || 0}`,
      icon: Activity,
      iconColor: 'text-purple-500',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <Icon className={`h-4 w-4 ${card.iconColor}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
