'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import {
  DateRangePicker,
  ActivityCompletionChart,
  ActivityCompletionRateChart,
  ActivityTypeChart,
} from '@/components/reports'
import {
  useActivityReport,
  useDefaultDateRange,
} from '@/hooks/use-reports'
import { exportToCSV, type DateRange } from '@/services/reports.service'
import { Download, CheckCircle, Clock, AlertCircle } from 'lucide-react'

const ACTIVITY_LABELS: Record<string, string> = {
  call: 'Ligação',
  meeting: 'Reunião',
  email: 'E-mail',
  task: 'Tarefa',
  note: 'Nota',
  visit: 'Visita',
}

export default function ActivitiesReportPage() {
  const defaultRange = useDefaultDateRange()
  const [dateRange, setDateRange] = useState<DateRange>(defaultRange)
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('month')

  const { data: activityReport, isLoading } = useActivityReport(dateRange, groupBy)

  // Aggregate type data from all periods
  const aggregatedTypeData = useMemo(() => {
    if (!activityReport) return []

    const typeMap = new Map<string, number>()
    activityReport.forEach((report) => {
      report.byType.forEach(({ type, count }) => {
        typeMap.set(type, (typeMap.get(type) || 0) + count)
      })
    })

    return Array.from(typeMap.entries()).map(([type, count]) => ({ type, count }))
  }, [activityReport])

  // Calculate totals
  const totals = useMemo(() => {
    if (!activityReport) return { total: 0, completed: 0, pending: 0, rate: 0 }

    const total = activityReport.reduce((sum, r) => sum + r.totalActivities, 0)
    const completed = activityReport.reduce((sum, r) => sum + r.completedActivities, 0)
    const pending = activityReport.reduce((sum, r) => sum + r.pendingActivities, 0)
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0

    return { total, completed, pending, rate }
  }, [activityReport])

  const handleExport = () => {
    if (!activityReport) return

    exportToCSV(activityReport, 'relatorio-atividades', [
      { key: 'period', label: 'Período' },
      { key: 'totalActivities', label: 'Total' },
      { key: 'completedActivities', label: 'Concluídas' },
      { key: 'pendingActivities', label: 'Pendentes' },
      { key: 'completionRate', label: 'Taxa de Conclusão (%)' },
    ])
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <DateRangePicker
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />

        <div className="flex items-center gap-2">
          <Select value={groupBy} onValueChange={(v) => setGroupBy(v as typeof groupBy)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Agrupar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Por Dia</SelectItem>
              <SelectItem value="week">Por Semana</SelectItem>
              <SelectItem value="month">Por Mês</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={handleExport} disabled={!activityReport}>
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Atividades</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{totals.total}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold text-green-600">{totals.completed}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold text-yellow-600">{totals.pending}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{totals.rate}%</div>
                <Progress value={totals.rate} className="mt-2 h-2" />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ActivityCompletionChart data={activityReport} isLoading={isLoading} />
        <ActivityCompletionRateChart data={activityReport} isLoading={isLoading} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ActivityTypeChart data={aggregatedTypeData} isLoading={isLoading} />

        {/* Period Details Table */}
        <Card>
          <CardHeader>
            <CardTitle>Dados por Período</CardTitle>
            <CardDescription>Detalhes de atividades por período</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : activityReport && activityReport.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Período</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                    <TableHead className="text-center">Concluídas</TableHead>
                    <TableHead className="text-center">Pendentes</TableHead>
                    <TableHead className="text-center">Taxa</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activityReport.map((row) => (
                    <TableRow key={row.period}>
                      <TableCell className="font-medium">{row.period}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{row.totalActivities}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {row.completedActivities}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          {row.pendingActivities}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Progress value={row.completionRate} className="h-2 w-16" />
                          <span className="text-sm">{row.completionRate}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma atividade no período selecionado
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
