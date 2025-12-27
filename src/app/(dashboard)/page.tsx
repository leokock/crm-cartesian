'use client'

import {
  StatsCards,
  PipelineFunnel,
  RecentActivities,
  RecentDeals,
  DealsNearClosing,
} from '@/components/dashboard'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do seu CRM
        </p>
      </div>

      {/* KPIs */}
      <StatsCards />

      {/* Pipeline e Atividades */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <PipelineFunnel />
        <RecentActivities />
      </div>

      {/* Negócios */}
      <div className="grid gap-4 md:grid-cols-2">
        <RecentDeals />
        <DealsNearClosing />
      </div>
    </div>
  )
}
