'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  DateRangePicker,
  TeamPerformanceTable,
} from '@/components/reports'
import {
  useTeamPerformance,
  useDefaultDateRange,
} from '@/hooks/use-reports'
import { exportToCSV, type DateRange } from '@/services/reports.service'
import { formatCurrency } from '@/lib/utils'
import { Download, Users, Trophy, Target } from 'lucide-react'

export default function TeamReportPage() {
  const defaultRange = useDefaultDateRange()
  const [dateRange, setDateRange] = useState<DateRange>(defaultRange)

  const { data: teamData, isLoading } = useTeamPerformance(dateRange)

  const handleExport = () => {
    if (!teamData) return

    exportToCSV(teamData, 'relatorio-equipe', [
      { key: 'userName', label: 'Vendedor' },
      { key: 'dealsWon', label: 'Negócios Ganhos' },
      { key: 'dealsLost', label: 'Negócios Perdidos' },
      { key: 'totalValue', label: 'Valor Total' },
      { key: 'conversionRate', label: 'Taxa de Conversão (%)' },
      { key: 'activitiesCompleted', label: 'Atividades Concluídas' },
    ])
  }

  // Calculate totals
  const totals = {
    members: teamData?.length || 0,
    totalWon: teamData?.reduce((sum, m) => sum + m.dealsWon, 0) || 0,
    totalValue: teamData?.reduce((sum, m) => sum + m.totalValue, 0) || 0,
    avgConversion: teamData?.length
      ? Math.round(teamData.reduce((sum, m) => sum + m.conversionRate, 0) / teamData.length)
      : 0,
  }

  // Prepare chart data (top 10)
  const chartData = teamData?.slice(0, 10).map((m) => ({
    name: m.userName.split(' ')[0], // First name only for chart
    ganhos: m.dealsWon,
    perdidos: m.dealsLost,
    valor: m.totalValue,
  })) || []

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <DateRangePicker
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />

        <Button variant="outline" size="sm" onClick={handleExport} disabled={!teamData}>
          <Download className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membros da Equipe</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <div className="text-2xl font-bold">{totals.members}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Negócios Ganhos</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-green-600">{totals.totalWon}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total Fechado</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold">{formatCurrency(totals.totalValue)}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversão Média</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{totals.avgConversion}%</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Comparativo de Desempenho</CardTitle>
          <CardDescription>Negócios ganhos e perdidos por vendedor</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[300px]" />
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="ganhos" name="Ganhos" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="perdidos" name="Perdidos" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Nenhum dado disponível
            </div>
          )}
        </CardContent>
      </Card>

      {/* Team Table */}
      <TeamPerformanceTable data={teamData} isLoading={isLoading} />
    </div>
  )
}
