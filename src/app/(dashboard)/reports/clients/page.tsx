'use client'

import { useState, useMemo } from 'react'
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
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  DateRangePicker,
  ClientRevenueTable,
} from '@/components/reports'
import {
  useClientRevenueReport,
  useDefaultDateRange,
} from '@/hooks/use-reports'
import { exportToCSV, type DateRange } from '@/services/reports.service'
import { formatCurrency } from '@/lib/utils'
import { Download, Building2, DollarSign, TrendingUp } from 'lucide-react'

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#ef4444', '#f97316', '#f59e0b', '#eab308']

export default function ClientsReportPage() {
  const defaultRange = useDefaultDateRange()
  const [dateRange, setDateRange] = useState<DateRange>(defaultRange)

  const { data: clientData, isLoading } = useClientRevenueReport(dateRange)

  const handleExport = () => {
    if (!clientData) return

    exportToCSV(clientData, 'relatorio-clientes', [
      { key: 'clientName', label: 'Cliente' },
      { key: 'totalDeals', label: 'Total de Negócios' },
      { key: 'wonDeals', label: 'Negócios Ganhos' },
      { key: 'totalValue', label: 'Valor Total' },
      { key: 'wonValue', label: 'Valor Ganho' },
    ])
  }

  // Calculate totals
  const totals = useMemo(() => {
    if (!clientData) return { clients: 0, totalDeals: 0, totalValue: 0, wonValue: 0 }

    return {
      clients: clientData.length,
      totalDeals: clientData.reduce((sum, c) => sum + c.totalDeals, 0),
      totalValue: clientData.reduce((sum, c) => sum + c.totalValue, 0),
      wonValue: clientData.reduce((sum, c) => sum + c.wonValue, 0),
    }
  }, [clientData])

  // Prepare chart data (top 10)
  const barChartData = clientData?.slice(0, 10).map((c) => ({
    name: c.clientName.length > 15 ? c.clientName.substring(0, 15) + '...' : c.clientName,
    valor: c.wonValue,
  })) || []

  // Pie chart data (top 5)
  const pieChartData = clientData?.slice(0, 5).map((c, i) => ({
    name: c.clientName,
    value: c.wonValue,
    color: COLORS[i % COLORS.length],
  })) || []

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <DateRangePicker
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />

        <Button variant="outline" size="sm" onClick={handleExport} disabled={!clientData}>
          <Download className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <div className="text-2xl font-bold">{totals.clients}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Negócios</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{totals.totalDeals}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
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
            <CardTitle className="text-sm font-medium">Valor Fechado</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totals.wonValue)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Clientes por Receita</CardTitle>
            <CardDescription>Valor total de negócios fechados</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px]" />
            ) : barChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => formatCurrency(value).replace('R$', '')}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 11 }}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value) => [formatCurrency(value as number), 'Valor']}
                  />
                  <Bar dataKey="valor" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Receita</CardTitle>
            <CardDescription>Top 5 clientes por participação na receita</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px]" />
            ) : pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ percent }) => `${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value) => [formatCurrency(value as number), 'Valor']}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Client Revenue Table */}
      <ClientRevenueTable data={clientData} isLoading={isLoading} limit={20} />
    </div>
  )
}
