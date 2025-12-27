'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Building2,
  DollarSign,
  FolderKanban,
  CheckSquare,
  AlertCircle,
  Trophy,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useDashboardStats } from '@/hooks/use-dashboard'

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  variant = 'default',
}: {
  title: string
  value: string | number
  description?: string
  icon: React.ElementType
  variant?: 'default' | 'success' | 'warning' | 'danger'
}) {
  const variantStyles = {
    default: 'text-muted-foreground',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${variantStyles[variant]}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20 mb-1" />
        <Skeleton className="h-3 w-16" />
      </CardContent>
    </Card>
  )
}

export function StatsCards() {
  const { data: stats, isLoading } = useDashboardStats()

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Negócios Abertos"
        value={stats?.openDeals || 0}
        description="No pipeline"
        icon={FolderKanban}
      />
      <StatCard
        title="Valor Total"
        value={formatCurrency(stats?.totalValue || 0)}
        description="Em negociação"
        icon={DollarSign}
      />
      <StatCard
        title="Clientes"
        value={stats?.totalClients || 0}
        description="Cadastrados"
        icon={Building2}
      />
      <StatCard
        title="Atividades Pendentes"
        value={stats?.pendingActivities || 0}
        description={stats?.overdueActivities ? `${stats.overdueActivities} atrasada(s)` : 'Nenhuma atrasada'}
        icon={stats?.overdueActivities ? AlertCircle : CheckSquare}
        variant={stats?.overdueActivities ? 'danger' : 'default'}
      />
    </div>
  )
}

export function MonthlyStatsCards() {
  const { data: stats, isLoading } = useDashboardStats()

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <StatCard
        title="Negócios Ganhos (Mês)"
        value={stats?.wonDealsThisMonth || 0}
        description="Fechados este mês"
        icon={Trophy}
        variant="success"
      />
      <StatCard
        title="Valor Ganho (Mês)"
        value={formatCurrency(stats?.wonValueThisMonth || 0)}
        description="Receita do mês"
        icon={DollarSign}
        variant="success"
      />
    </div>
  )
}
